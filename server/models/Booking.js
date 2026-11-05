const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    topic: {
      type: String,
      default: '',
      trim: true,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },

    meetingLink: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  instructor: 1,
  date: 1,
  startTime: 1,
});

bookingSchema.index({
  student: 1,
  date: 1,
});

module.exports = mongoose.model(
  'Booking',
  bookingSchema
);