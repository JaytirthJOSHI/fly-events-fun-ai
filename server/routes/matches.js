import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Find matching flights (people arriving at similar times to the same event)
router.get('/find', authenticate, async (req, res) => {
  try {
    const { eventId, arrivalDate, timeWindow = 4 } = req.query;

    if (!eventId || !arrivalDate) {
      return res.status(400).json({ 
        message: 'Event ID and arrivalDate are required' 
      });
    }

    const targetDate = new Date(arrivalDate);
    const timeWindowMs = (parseInt(timeWindow) || 4) * 60 * 60 * 1000; // Convert hours to ms

    // Find flights for the same event
    // Arriving within the time window (before or after)
    const startTime = new Date(targetDate.getTime() - timeWindowMs);
    const endTime = new Date(targetDate.getTime() + timeWindowMs);

    const matches = await prisma.flight.findMany({
      where: {
        eventId: eventId,
        arrivalDate: {
          gte: startTime,
          lte: endTime
        },
        isActive: true,
        userId: {
          not: req.user.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            slackId: true,
            profileImage: true
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            destination: true
          }
        }
      },
      orderBy: {
        arrivalDate: 'asc'
      }
    });

    // Calculate time difference for each match
    const matchesWithTimeDiff = matches.map(match => {
      const timeDiffMs = Math.abs(new Date(match.arrivalDate) - targetDate);
      const timeDiffHours = (timeDiffMs / (1000 * 60 * 60)).toFixed(1);
      
      return {
        ...match,
        timeDifferenceHours: parseFloat(timeDiffHours)
      };
    });

    res.json(matchesWithTimeDiff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get matches for a specific flight
router.get('/flight/:flightId', authenticate, async (req, res) => {
  try {
    const flight = await prisma.flight.findFirst({
      where: {
        id: req.params.flightId,
        userId: req.user.id
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            destination: true
          }
        }
      }
    });

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (!flight.eventId) {
      return res.json({
        flight,
        matches: []
      });
    }

    const timeWindowMs = 4 * 60 * 60 * 1000; // 4 hours
    const startTime = new Date(new Date(flight.arrivalDate).getTime() - timeWindowMs);
    const endTime = new Date(new Date(flight.arrivalDate).getTime() + timeWindowMs);

    const matches = await prisma.flight.findMany({
      where: {
        eventId: flight.eventId,
        arrivalDate: {
          gte: startTime,
          lte: endTime
        },
        isActive: true,
        userId: {
          not: req.user.id
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            slackId: true,
            profileImage: true
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            destination: true
          }
        }
      },
      orderBy: {
        arrivalDate: 'asc'
      }
    });

    const matchesWithTimeDiff = matches.map(match => {
      const timeDiffMs = Math.abs(new Date(match.arrivalDate) - new Date(flight.arrivalDate));
      const timeDiffHours = (timeDiffMs / (1000 * 60 * 60)).toFixed(1);
      
      return {
        ...match,
        timeDifferenceHours: parseFloat(timeDiffHours)
      };
    });

    res.json({
      flight,
      matches: matchesWithTimeDiff
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
