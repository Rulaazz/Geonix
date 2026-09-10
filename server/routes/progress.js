
const express = require('express');
const router = express.Router();

const Progress = require('../models/Progress');
const authMiddleware = require('../middleware/authMiddleware');

const validCategories = [
  'addition',
  'multiplication',
  'fractions',
  'algebra',
  'geometry',
];

// GET USER PROGRESS
router.get('/', authMiddleware, async (req, res) => {
  try {
    let progress = await Progress.findOne({
      user: req.userId,
    });

    if (!progress) {
      progress = await Progress.create({
        user: req.userId,
        questionsAnswered: 0,
        correctAnswers: 0,
      });
    }

    res.json({
      progress: {
        questionsAnswered: progress.questionsAnswered,
        correctAnswers: progress.correctAnswers,
        categoryProgress: progress.categoryProgress,
      },
    });

  } catch (error) {
    console.error(
      'GET PROGRESS ERROR:',
      error
    );

    res.status(500).json({
      message: 'Could not get progress.',
    });
  }
});

// UPDATE USER PROGRESS
router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { correct, category } = req.body;

    // Check correct
    if (typeof correct !== 'boolean') {
      return res.status(400).json({
        message: 'Correct must be true or false.',
      });
    }

    // Check category
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category.',
      });
    }

    let progress = await Progress.findOne({
      user: req.userId,
    });

    if (!progress) {
      progress = new Progress({
        user: req.userId,
        questionsAnswered: 0,
        correctAnswers: 0,
      });
    }

    // Update total progress
    progress.questionsAnswered += 1;

    if (correct) {
      progress.correctAnswers += 1;
    }

    // Update category progress
    progress.categoryProgress[category].questionsAnswered += 1;

    if (correct) {
      progress.categoryProgress[category].correctAnswers += 1;
    }

    await progress.save();

    res.json({
      message: 'Progress updated successfully.',

      progress: {
        questionsAnswered:
          progress.questionsAnswered,

        correctAnswers:
          progress.correctAnswers,

        categoryProgress:
          progress.categoryProgress,
      },
    });

  } catch (error) {
    console.error(
      'UPDATE PROGRESS ERROR:',
      error
    );

    res.status(500).json({
      message: 'Could not update progress.',
    });
  }
});

module.exports = router;
