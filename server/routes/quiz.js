const express = require('express');
const router = express.Router();

const QuizResult = require('../models/QuizResult');
const authMiddleware = require('../middleware/authMiddleware');


// =========================
// GET QUIZ RESULT
// =========================

router.get('/:lessonId', authMiddleware, async (req, res) => {
  try {
    const result = await QuizResult.findOne({
      user: req.userId,
      lessonId: req.params.lessonId,
    });

    res.json({
      result,
    });
  } catch (error) {
    console.error('GET QUIZ RESULT ERROR:', error);

    res.status(500).json({
      message: 'Could not load quiz result.',
    });
  }
});


// =========================
// GET ALL QUIZ RESULTS
// =========================

router.get('/', authMiddleware, async (req, res) => {
  try {
    const results = await QuizResult.find({
      user: req.userId,
    }).sort({
      updatedAt: -1,
    });

    res.json({
      results,
    });
  } catch (error) {
    console.error('GET ALL QUIZ RESULTS ERROR:', error);

    res.status(500).json({
      message: 'Could not load quiz results.',
    });
  }
});


// =========================
// SAVE QUIZ RESULT
// =========================

router.post('/:lessonId', authMiddleware, async (req, res) => {
  try {
    const {
      score,
      totalQuestions,
      percentage,
    } = req.body;

    const { lessonId } = req.params;

    // Validate required values
    if (
      typeof score !== 'number' ||
      typeof totalQuestions !== 'number' ||
      typeof percentage !== 'number'
    ) {
      return res.status(400).json({
        message: 'Invalid quiz result data.',
      });
    }

    if (totalQuestions <= 0) {
      return res.status(400).json({
        message: 'Total questions must be greater than zero.',
      });
    }

    if (score < 0 || score > totalQuestions) {
      return res.status(400).json({
        message: 'Invalid quiz score.',
      });
    }

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({
        message: 'Invalid quiz percentage.',
      });
    }

    console.log(
      'Saving quiz result:',
      {
        userId: req.userId,
        lessonId,
        score,
        totalQuestions,
        percentage,
      }
    );

    const result = await QuizResult.findOneAndUpdate(
      {
        user: req.userId,
        lessonId,
      },
      {
        user: req.userId,
        lessonId,
        score,
        totalQuestions,
        percentage,
        completed: true,
        completedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      message: 'Quiz result saved successfully.',
      result,
    });
  } catch (error) {
    console.error('SAVE QUIZ RESULT ERROR:', error);

    res.status(500).json({
      message: 'Could not save quiz result.',
    });
  }
});


// =========================
// DELETE QUIZ RESULT
// =========================

router.delete('/:lessonId', authMiddleware, async (req, res) => {
  try {
    await QuizResult.findOneAndDelete({
      user: req.userId,
      lessonId: req.params.lessonId,
    });

    res.json({
      message: 'Quiz result removed successfully.',
    });
  } catch (error) {
    console.error('DELETE QUIZ RESULT ERROR:', error);

    res.status(500).json({
      message: 'Could not delete quiz result.',
    });
  }
});


module.exports = router;