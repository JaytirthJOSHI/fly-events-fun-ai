# ✈️ Fly Events - Travel Buddy Platform

A platform to connect travelers flying to the same destination at similar times. Find your perfect travel buddy before you land!

## Features

- 🔐 User authentication (register/login)
- ✈️ Add and manage your flight information
- 🔍 Search for travel buddies arriving at similar times
- 🤝 Match algorithm finds people within customizable time windows
- 📱 Modern, responsive UI built with React and Tailwind CSS
- 🚀 Fast API built with Node.js and Express
- 💾 PostgreSQL database (Nest Postgres) for reliable data storage

## Tech Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** with Prisma ORM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **Vite** for fast development
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

## Prerequisites

- Node.js (v16 or higher)
- Nest account (free backend infrastructure from Hack Club) - [Get one here](https://hackclub.app)
- npm or yarn

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   This will install dependencies for the root, server, and client directories.

3. **Set up Nest Postgres:**
   
   If you haven't already, create a database on Nest:
   ```bash
   ssh hackclub.app
   nest db create flyevents
   ```
   
   This will create a database named `yourusername_flyevents` (where `yourusername` is your Nest username).

4. **Set up environment variables:**
   
   Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` and update the values:
   
   **For local development (connecting from your machine):**
   ```
   PORT=5000
   DATABASE_URL=postgres://username:password@hackclub.app/username_flyevents
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=development
   ```
   
   Replace:
   - `username` with your Nest username
   - `password` with your Nest password
   - `username_flyevents` with your actual database name (yourusername_flyevents)
   
   **For deployment on Nest (connecting from within Nest):**
   ```
   DATABASE_URL=postgres://username@localhost/username_flyevents?sslmode=disable&host=/var/run/postgresql
   ```
   
   (No password needed when connecting from within Nest!)

5. **Set up the database schema:**
   
   Generate Prisma Client and run migrations:
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   ```
   
   This will create the necessary tables in your PostgreSQL database.

6. **Start the development servers:**
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   This starts both the backend (port 5000) and frontend (port 3000) servers.

   Or start them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

7. **Open your browser:**
   
   Navigate to `http://localhost:3000`

## Usage

1. **Register/Login:** Create an account or sign in
2. **Add Flight:** Enter your flight details (flight number, dates, times, destination)
3. **Find Buddies:** 
   - Search by destination and arrival date
   - Or click "Find Buddies" from your flight card
4. **Connect:** View matches with contact information and flight details

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Flights
- `GET /api/flights/my-flights` - Get user's flights
- `POST /api/flights` - Create a new flight
- `PUT /api/flights/:id` - Update a flight
- `DELETE /api/flights/:id` - Delete a flight

### Matches
- `GET /api/matches/find` - Search for matches (query params: destination, arrivalDate, timeWindow)
- `GET /api/matches/flight/:flightId` - Get matches for a specific flight

## Matching Algorithm

The platform finds travel buddies based on:
- **Same destination** (case-insensitive)
- **Arrival time within a window** (default ±4 hours, configurable)
- **Active flights only**

Matches are sorted by arrival time, and each match shows the time difference in hours.

## Project Structure

```
fly-events/
├── server/                 # Backend API
│   ├── db/                # Database connection (Prisma)
│   ├── prisma/            # Prisma schema and migrations
│   ├── routes/            # API routes (auth, flights, matches)
│   ├── middleware/        # Auth middleware
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # React entry point
│   └── vite.config.js     # Vite configuration
├── package.json           # Root package.json
└── README.md
```

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- Frontend is configured to proxy API requests to the backend

## Future Enhancements

- Real-time messaging between matched users
- Push notifications for new matches
- Integration with flight APIs for automatic flight tracking
- Event recommendations based on destination
- User profiles with photos and interests
- Rate/feedback system for travel buddies

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
