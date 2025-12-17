import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flightNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  airline: {
    type: String,
    required: true,
    trim: true
  },
  origin: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  arrivalDate: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: String,
    required: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  departureTime: {
    type: String,
    required: true
  },
  terminal: {
    type: String,
    trim: true
  },
  gate: {
    type: String,
    trim: true
  },
  lookingFor: {
    type: String,
    enum: ['travel-buddy', 'ride-share', 'events', 'general'],
    default: 'travel-buddy'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
flightSchema.index({ destination: 1, arrivalDate: 1, isActive: 1 });

export default mongoose.model('Flight', flightSchema);
