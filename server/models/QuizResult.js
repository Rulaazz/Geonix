const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    lessonId: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    completed: {
      type: Boolean,
      default: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

quizResultSchema.index(
  {
    user: 1,
    lessonId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  'QuizResult',
  quizResultSchema
);