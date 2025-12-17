import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import prisma from '../db/prisma.js';
import { getAuthUrl, HCA_BASE_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '../config/hca.js';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Store states temporarily (in production, use Redis or similar)
const stateStore = new Map();

// Clean up old states (older than 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStore.entries()) {
    if (now - data.createdAt > 10 * 60 * 1000) {
      stateStore.delete(state);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

// Redirect to Hack Club Auth for login
router.get('/login', async (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');
    stateStore.set(state, { createdAt: Date.now() });
    
    const authUrl = getAuthUrl(state);
    console.log('Generated state:', state);
    res.json({ authUrl, state });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: error.message });
  }
});

// OAuth callback - exchange code for tokens and create/login user
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    console.log('OAuth callback received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error,
    });

    if (error) {
      console.error('OAuth error:', error);
      return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('Missing code or state:', { code: !!code, state: !!state });
      return res.redirect(`${FRONTEND_URL}/login?error=missing_code_or_state`);
    }

    // Verify state
    if (!stateStore.has(state)) {
      console.error('Invalid state:', state, 'Available states:', Array.from(stateStore.keys()));
      return res.redirect(`${FRONTEND_URL}/login?error=invalid_state`);
    }

    stateStore.delete(state);

    // Step 4: Exchange code for access token
    // OAuth token endpoint expects form-encoded data
    const tokenResponse = await axios.post(
      `${HCA_BASE_URL}/oauth/token`,
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
        grant_type: 'authorization_code'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error('No access token received:', tokenResponse.data);
      return res.redirect(`${FRONTEND_URL}/login?error=no_access_token`);
    }

    // Step 5: Get user info from API
    console.log('Fetching user info with access token:', accessToken.substring(0, 20) + '...');
    const userResponse = await axios.get(`${HCA_BASE_URL}/api/v1/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userData = userResponse.data;
    console.log('User data from API:', JSON.stringify(userData, null, 2));
    
    // HCA API returns data nested under 'identity'
    const identity = userData?.identity;
    const hcaId = identity?.id; // Already in "ident!xxx" format
    const email = identity?.primary_email;
    
    // Try to get name from various fields, fallback to email username
    const name = identity?.name || 
                 identity?.full_name || 
                 identity?.display_name ||
                 `${(identity?.first_name || '').trim()} ${(identity?.last_name || '').trim()}`.trim() || 
                 email?.split('@')[0] || 
                 'User';

    console.log('Extracted user info:', { hcaId, email, name });

    if (!hcaId) {
      console.error('No user ID found in API response. Available fields:', Object.keys(userData || {}));
      throw new Error('No user ID in API response');
    }

    if (!email) {
      console.error('No email found in API response:', userData);
      throw new Error('No email in API response');
    }

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
        // Create new user (default role is "user", existing users are already admin)
        user = await prisma.user.create({
          data: {
            hcaId,
            email,
            name,
            phone: identity?.phone_number || null,
            slackId: identity?.slack_id || null,
            role: 'user', // New users are standard users
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
      const slackId = identity?.slack_id || null;
      console.log('Updating user with slackId:', slackId);
      user = await prisma.user.update({
        where: { hcaId },
        data: {
          name,
          email,
          phone: identity?.phone_number || user.phone,
          slackId: slackId,
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
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    const errorMessage = error.response?.data?.error || error.response?.data?.error_description || error.message || 'Authentication failed';
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`);
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
        role: true,
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
