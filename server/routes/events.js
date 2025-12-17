import express from 'express';
import prisma from '../db/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = express.Router();

// Get all active events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { flights: true }
        }
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { flights: true }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes - Create event
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, destination, description, startDate, endDate } = req.body;

    const event = await prisma.event.create({
      data: {
        name,
        destination: destination.toUpperCase(),
        description: description || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin routes - Update event
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, destination, description, startDate, endDate, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (destination) updateData.destination = destination.toUpperCase();
    if (description !== undefined) updateData.description = description || null;
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Admin routes - Delete event
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes - Get all events (including inactive)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { flights: true }
        }
      }
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

