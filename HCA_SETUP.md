# Hack Club Auth Setup Guide

## Step 1: Create OAuth App on Hack Club Auth

1. Go to [auth.hackclub.com/developer/apps](https://auth.hackclub.com/developer/apps)
2. Click **"New App"** or **"Create App"**
3. Fill in:
   - **App Name**: `Fly Events` (or whatever you want)
   - **Redirect URI**: `http://localhost:3000/auth/callback` (for local development)
   - For production, also add: `https://yourdomain.com/auth/callback`
4. Click **"Create"**
5. **Save your Client ID and Client Secret** - you'll need these!

## Step 2: Update Your .env File

Edit `server/.env` and add:

```env
HACKCLUB_CLIENT_ID=your_client_id_here
HACKCLUB_CLIENT_SECRET=your_client_secret_here
HACKCLUB_REDIRECT_URI=http://localhost:3000/auth/callback
FRONTEND_URL=http://localhost:3000
```

Replace the values with what you got from Step 1.

## Step 3: Run Database Migration

Since we updated the User model to use Hack Club Auth, you need to migrate:

```bash
cd server
npm run prisma:migrate
```

When prompted, name it something like `add_hca_auth` or just press Enter.

This will:
- Remove the `password` field
- Add `hcaId` (Hack Club Auth identifier)
- Add `slackId` (optional, from HCA)

## Step 4: Install Dependencies

```bash
cd server
npm install
```

This will install `openid-client` which handles the OAuth flow.

## Step 5: Test It!

1. Start your servers:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/login`
3. Click **"Sign in with Hack Club"**
4. You'll be redirected to Hack Club Auth
5. Sign in with your Hack Club account
6. You'll be redirected back and logged in! 🎉

## Troubleshooting

**"Client ID not configured" error:**
- Make sure you set `HACKCLUB_CLIENT_ID` in your `.env` file

**"Invalid redirect URI" error:**
- Check that the redirect URI in your HCA app matches exactly what's in `.env`
- Must match: `http://localhost:3000/auth/callback` (no trailing slash, exact match)

**"Failed to initialize HCA client" error:**
- Check your internet connection
- The HCA discovery endpoint should be accessible

**Migration fails:**
- Make sure your Supabase database is connected
- Check your `DATABASE_URL` in `.env`

## Production Setup

When deploying to production:

1. Update redirect URI in HCA app:
   - Add `https://yourdomain.com/auth/callback`

2. Update `.env`:
   ```env
   HACKCLUB_REDIRECT_URI=https://yourdomain.com/auth/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. Make sure to use environment variables, not hardcoded values!

## What Changed?

- ✅ Removed email/password authentication
- ✅ Added Hack Club Auth OIDC integration
- ✅ Users now sign in with their Hack Club accounts
- ✅ User profile automatically synced from HCA
- ✅ No need for users to create separate accounts!

