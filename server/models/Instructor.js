const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      default: '',
      trim: true,
    },

    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    grades: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    hourlyRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    avatar: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Instructor',
  instructorSchema
);