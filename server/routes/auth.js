import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { getHcaClient, getAuthUrl } from '../config/hca.js';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REDIRECT_URI = process.env.HACKCLUB_REDIRECT_URI || 'http://localhost:3000/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Store states temporarily (in production, use Redis or similar)
const stateStore = new Map();

// Redirect to Hack Club Auth for login
router.get('/login', (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    stateStore.set(state, { createdAt: Date.now() });
    
    const authUrl = getAuthUrl(state);
    res.json({ authUrl, state });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// OAuth callback - exchange code for tokens and create/login user
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${FRONTEND_URL}/login?error=missing_code_or_state`);
    }

    // Verify state (in production, check stateStore)
    if (!stateStore.has(state)) {
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
    }

    stateStore.delete(state);

    const client = await getHcaClient();
    
    // Exchange authorization code for tokens
    const tokenSet = await client.callback(REDIRECT_URI, { code, state });
    
    // Get user info from ID token
    const claims = tokenSet.claims();
    const hcaId = claims.sub; // ident!xxx
    const email = claims.email;
    const name = claims.name || `${claims.given_name || ''} ${claims.family_name || ''}`.trim();

    // Create or update user in database
    let user = await prisma.user.findUnique({
      where: { hcaId }
    });

    if (!user) {
      // Check if user exists by email (migration case)
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        // Update existing user with HCA ID
        user = await prisma.user.update({
          where: { email },
          data: { hcaId }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            hcaId,
            email,
            name,
            phone: claims.phone_number || null,
            slackId: claims.slack_id || null,
          },
          select: {
            id: true,
            hcaId: true,
            name: true,
            email: true,
            phone: true,
            slackId: true,
            createdAt: true
          }
        });
      }
    } else {
      // Update existing user info
      user = await prisma.user.update({
        where: { hcaId },
        data: {
          name,
          email,
          phone: claims.phone_number || user.phone,
          slackId: claims.slack_id || user.slackId,
        },
        select: {
          id: true,
          hcaId: true,
          name: true,
          email: true,
          phone: true,
          slackId: true,
          createdAt: true
        }
      });
    }

    // Generate JWT token for our app
    const appToken = jwt.sign({ 
      userId: user.id,
      hcaId: user.hcaId 
    }, JWT_SECRET, { expiresIn: '7d' });

    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/auth/success?token=${appToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        hcaId: true,
        name: true,
        email: true,
        phone: true,
        slackId: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Logout (client-side will remove token, this is just for consistency)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;