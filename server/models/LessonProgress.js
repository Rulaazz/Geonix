const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema(
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

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
  A user should only have one progress record
  for each lesson.
*/
lessonProgressSchema.index(
  { user: 1, lessonId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'LessonProgress',
  lessonProgressSchema
);