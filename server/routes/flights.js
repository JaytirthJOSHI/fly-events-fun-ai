import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// Admin: Get all users with their flights
router.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        flights: {
          include: {
            event: {
              select: {
                id: true,
                name: true,
                destination: true
              }
            }
          },
          orderBy: { arrivalDate: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lookup flight info from AviationStack API
router.get('/lookup/:flightNumber', authenticate, async (req, res) => {
  try {
    const { flightNumber } = req.params;
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'Flight lookup API not configured' });
    }

    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ message: data.error.message || 'API error' });
    }
    
    if (!data.data || data.data.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const flight = data.data[0];
    
    const flightInfo = {
      flightNumber: flight.flight?.iata || flightNumber,
      airline: flight.airline?.name || '',
      origin: flight.departure?.airport || '',
      originIata: flight.departure?.iata || '',
      destination: flight.arrival?.airport || '',
      destinationIata: flight.arrival?.iata || '',
      departureDate: flight.departure?.scheduled ? flight.departure.scheduled.split('T')[0] : '',
      departureTime: flight.departure?.scheduled ? flight.departure.scheduled.split('T')[1]?.substring(0, 5) : '',
      arrivalDate: flight.arrival?.scheduled ? flight.arrival.scheduled.split('T')[0] : '',
      arrivalTime: flight.arrival?.scheduled ? flight.arrival.scheduled.split('T')[1]?.substring(0, 5) : '',
      terminal: flight.arrival?.terminal || '',
      gate: flight.arrival?.gate || '',
      status: flight.flight_status || ''
    };
    
    res.json(flightInfo);
  } catch (error) {
    console.error('Flight lookup error:', error);
    res.status(500).json({ message: 'Failed to lookup flight' });
  }
});

// Get all flights for a user
router.get('/my-flights', authenticate, async (req, res) => {
  try {
    const flights = await prisma.flight.findMany({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
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
      orderBy: { arrivalDate: 'asc' }
    });
    
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new flight
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      flightNumber,
      eventId,
      arrivalDate,
      arrivalTime
    } = req.body;

    // Validate event exists if provided
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId, isActive: true }
      });
      
      if (!event) {
        return res.status(400).json({ message: 'Invalid or inactive event' });
      }
    }

    const flight = await prisma.flight.create({
      data: {
        userId: req.user.id,
        eventId: eventId || null,
        flightNumber: flightNumber.toUpperCase().trim(),
        arrivalDate: new Date(arrivalDate),
        arrivalTime,
        isActive: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            destination: true
          }
        }
      }
    });
    
    res.status(201).json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a flight
router.put('/:id', authenticate, async (req, res) => {
  try {
    // First check if flight exists and belongs to user
    const existingFlight = await prisma.flight.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!existingFlight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    const {
      flightNumber,
      eventId,
      arrivalDate,
      arrivalTime,
      isActive
    } = req.body;

    // Validate event exists if provided
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId, isActive: true }
      });
      
      if (!event) {
        return res.status(400).json({ message: 'Invalid or inactive event' });
      }
    }

    const updateData = {};
    if (flightNumber) updateData.flightNumber = flightNumber.toUpperCase().trim();
    if (eventId !== undefined) updateData.eventId = eventId || null;
    if (arrivalDate) updateData.arrivalDate = new Date(arrivalDate);
    if (arrivalTime) updateData.arrivalTime = arrivalTime;
    if (isActive !== undefined) updateData.isActive = isActive;

    const flight = await prisma.flight.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        event: {
          select: {
            id: true,
            name: true,
            destination: true
          }
        }
      }
    });
    
    res.json(flight);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a flight
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // First check if flight exists and belongs to user
    const flight = await prisma.flight.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    await prisma.flight.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
