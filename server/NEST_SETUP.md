# Setting up Fly Events on Nest

This guide will help you deploy Fly Events to Nest and connect it to Nest's PostgreSQL database.

## Prerequisites

- A Nest account ([get one here](https://hackclub.app))
- SSH access to Nest (you should be able to `ssh hackclub.app`)

## Step 1: Create Database on Nest

SSH into Nest and create a database:

```bash
ssh hackclub.app
nest db create flyevents
```

This creates a database named `yourusername_flyevents` (where `yourusername` is your Nest username).

## Step 2: Deploy Your Code to Nest

You can deploy using git, or upload your files directly. Here's using git:

```bash
# On Nest
mkdir -p ~/fly-events
cd ~/fly-events
git clone <your-repo-url> .
```

Or if you're pushing from your local machine:

```bash
# On your local machine, add Nest as a remote
git remote add nest hackclub.app:~/fly-events
git push nest main
```

## Step 3: Set Up Environment Variables

On Nest, create your `.env` file:

```bash
cd ~/fly-events/server
cp .env.example .env
nano .env  # or use your preferred editor
```

**Important:** When running on Nest, use the local connection string:

```env
PORT=5000
DATABASE_URL=postgres://yourusername@localhost/yourusername_flyevents?sslmode=disable&host=/var/run/postgresql
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
```

Replace `yourusername` with your actual Nest username.

## Step 4: Install Dependencies and Run Migrations

```bash
cd ~/fly-events
npm run install-all

cd server
npm run prisma:generate
npm run prisma:migrate
```

## Step 5: Set Up Your App to Run

### Option A: Using PM2 (Recommended for production)

```bash
# Install PM2 if you haven't
npm install -g pm2

# Start the server
cd ~/fly-events/server
pm2 start index.js --name fly-events
pm2 save
pm2 startup
```

### Option B: Using systemd service

Create a service file:

```bash
sudo nano /etc/systemd/system/fly-events.service
```

Add:

```ini
[Unit]
Description=Fly Events API
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/home/yourusername/fly-events/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable fly-events
sudo systemctl start fly-events
```

## Step 6: Set Up Frontend (if needed)

If you want to serve the frontend from Nest, you can build it and serve with nginx or another web server:

```bash
cd ~/fly-events/client
npm run build
```

Then configure nginx or another web server to serve the `dist/` folder.

Alternatively, deploy the frontend separately (e.g., Vercel, Netlify) and point it to your Nest API.

## Step 7: Access Your App

Your API should now be accessible at:
- `http://yourusername.hackclub.app:5000/api` (if you've set up port forwarding)
- Or via your configured domain/proxy

## Useful Commands

- Check if your app is running: `pm2 status` or `sudo systemctl status fly-events`
- View logs: `pm2 logs fly-events` or `sudo journalctl -u fly-events -f`
- Access PostgreSQL: `psql` (then `\c yourusername_flyevents`)
- Run Prisma Studio: `cd ~/fly-events/server && npm run prisma:studio`

## Troubleshooting

1. **Can't connect to database:** Make sure you're using the local connection string (with `@localhost`) when running on Nest
2. **Port already in use:** Change the PORT in your `.env` file
3. **Permission denied:** Make sure files are owned by your user: `chown -R yourusername:yourusername ~/fly-events`

## Connecting from External Services

If you want to connect to Nest Postgres from an external service (like Vercel), use:

```
DATABASE_URL=postgres://username:password@hackclub.app/username_flyevents
```

Replace `username` and `password` with your Nest credentials.

