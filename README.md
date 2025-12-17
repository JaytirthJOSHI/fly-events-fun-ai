# Fly Events - Travel Buddy Platform

Find travel buddies who are flying to the same destination at similar times.

## Features

- User authentication (register/login)
- Add and manage flight information
- Search for travel buddies arriving at similar times
- Match algorithm finds people within a customizable time window
- Modern UI with React and Tailwind CSS
- Backend API with Node.js and Express
- PostgreSQL database via Supabase

## Tech Stack

- **Backend:** Node.js, Express, Supabase (PostgreSQL), Prisma ORM, JWT
- **Frontend:** React 18, Vite, React Router, Tailwind CSS, Axios

## Prerequisites

- Node.js v16 or higher
- Supabase account (free tier available)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Set up Supabase:**
   - Create a new project at supabase.com
   - Save your database password
   - Go to Settings → Database
   - Copy the Connection pooling URI (with `pooler.supabase.com`)

3. **Configure environment variables:**
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

4. **Set up database:**
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   Or separately:
   ```bash
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

6. **Open the app at http://localhost:3000**

## How to Use

1. Create an account
2. Add your flight details
3. Search for other travelers to your destination
4. View matches and connect

## API Endpoints

**Auth:**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Flights:**
- `GET /api/flights/my-flights`
- `POST /api/flights`
- `PUT /api/flights/:id`
- `DELETE /api/flights/:id`

**Matches:**
- `GET /api/matches/find` (query: destination, arrivalDate, timeWindow)
- `GET /api/matches/flight/:flightId`

## How Matching Works

Finds flights with:
- Same destination (case-insensitive)
- Arrival time within ±4 hours (configurable)
- Active flights only

## Project Structure

```
fly-events/
├── server/          # Backend API
├── client/          # Frontend React app
├── package.json
└── README.md
```

## License

MIT
