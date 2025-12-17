# Quick Supabase Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `fly-events` (or anything you like)
   - **Database Password**: Choose a strong password (⚠️ **SAVE THIS** - you'll need it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Connection String

1. In your Supabase project dashboard, click **Settings** (gear icon in sidebar)
2. Click **Database** in the left menu
3. Scroll down to **Connection string** section
4. Select the **"Connection pooling"** tab (recommended)
5. Copy the URI that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## Step 3: Update Your .env File

1. In your project, edit `server/.env`:
   ```bash
   cd server
   nano .env  # or use your editor
   ```

2. Paste your connection string and replace `[YOUR-PASSWORD]` with the password you set:
   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:YOUR_ACTUAL_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   PORT=5000
   JWT_SECRET=your-random-secret-key-here
   NODE_ENV=development
   ```

## Step 4: Run Migrations

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

When asked for a migration name, just press Enter (or type "init").

## Step 5: Verify in Supabase Dashboard

1. Go back to your Supabase dashboard
2. Click **Table Editor** in the sidebar
3. You should see two tables: `users` and `flights` ✨

## Step 6: Start Your App

```bash
# From project root
npm run dev
```

Your app should now connect to Supabase! 🎉

## Troubleshooting

**Can't connect?**
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string
- Check that your Supabase project is fully initialized (green checkmark)
- Try using the "Direct connection" URI instead of pooling (under Connection string → Session mode)

**Migration fails?**
- Make sure your password doesn't have special characters that need URL encoding
- If it does, encode them (e.g., `@` becomes `%40`, `#` becomes `%23`)

**Need help?**
- Supabase docs: https://supabase.com/docs
- Prisma docs: https://www.prisma.io/docs

