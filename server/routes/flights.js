import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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
      airline,
      origin,
      destination,
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime,
      terminal,
      gate,
      lookingFor,
      notes,
      isActive
    } = req.body;

    const flight = await prisma.flight.create({
      data: {
        userId: req.user.id,
        flightNumber,
        airline,
        origin,
        destination: destination.toUpperCase(),
        arrivalDate: new Date(arrivalDate),
        arrivalTime,
        departureDate: new Date(departureDate),
        departureTime,
        terminal: terminal || null,
        gate: gate || null,
        lookingFor: lookingFor || 'travel-buddy',
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
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
      airline,
      origin,
      destination,
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime,
      terminal,
      gate,
      lookingFor,
      notes,
      isActive
    } = req.body;

    const updateData = {};
    if (flightNumber) updateData.flightNumber = flightNumber;
    if (airline) updateData.airline = airline;
    if (origin) updateData.origin = origin;
    if (destination) updateData.destination = destination.toUpperCase();
    if (arrivalDate) updateData.arrivalDate = new Date(arrivalDate);
    if (arrivalTime) updateData.arrivalTime = arrivalTime;
    if (departureDate) updateData.departureDate = new Date(departureDate);
    if (departureTime) updateData.departureTime = departureTime;
    if (terminal !== undefined) updateData.terminal = terminal || null;
    if (gate !== undefined) updateData.gate = gate || null;
    if (lookingFor) updateData.lookingFor = lookingFor;
    if (notes !== undefined) updateData.notes = notes || null;
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
