import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db/prisma.js';
import authRoutes from './routes/auth.js';
import flightRoutes from './routes/flights.js';
import matchRoutes from './routes/matches.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
prisma.$connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((error) => {
    console.error('PostgreSQL connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/matches', matchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fly Events API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
