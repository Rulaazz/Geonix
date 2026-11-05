const express = require('express');
const router = express.Router();

const LessonProgress = require('../models/LessonProgress');
const authMiddleware = require('../middleware/authMiddleware');


/* =========================================================
   GET ALL LESSON PROGRESS
   GET /api/lesson-progress
========================================================= */

router.get('/', authMiddleware, async (req, res) => {
  try {
    const progress = await LessonProgress.find({
      user: req.userId,
    }).sort({
      updatedAt: -1,
    });

    res.json({
      success: true,
      progress,
    });

  } catch (error) {
    console.error(
      'GET LESSON PROGRESS ERROR:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to get lesson progress.',
    });
  }
});


/* =========================================================
   GET ONE LESSON PROGRESS
   GET /api/lesson-progress/:lessonId
========================================================= */

router.get(
  '/:lessonId',
  authMiddleware,
  async (req, res) => {
    try {
      const progress =
        await LessonProgress.findOne({
          user: req.userId,
          lessonId: req.params.lessonId,
        });

      if (!progress) {
        return res.json({
          success: true,
          completed: false,
          progress: null,
        });
      }

      res.json({
        success: true,
        completed: progress.completed,
        progress,
      });

    } catch (error) {
      console.error(
        'GET SINGLE LESSON PROGRESS ERROR:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to get lesson progress.',
      });
    }
  }
);


/* =========================================================
   COMPLETE / UPDATE LESSON
   POST /api/lesson-progress/:lessonId
========================================================= */

router.post(
  '/:lessonId',
  authMiddleware,
  async (req, res) => {
    try {
      const { lessonId } = req.params;

      const completed =
        req.body.completed !== false;


      console.log(
        'Saving lesson progress:',
        {
          userId: req.userId,
          lessonId,
          completed,
        }
      );


      const progress =
        await LessonProgress.findOneAndUpdate(
          {
            user: req.userId,
            lessonId,
          },
          {
            user: req.userId,
            lessonId,
            completed,
            completedAt: completed
              ? new Date()
              : null,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );


      res.json({
        success: true,
        message: completed
          ? 'Lesson completed successfully.'
          : 'Lesson progress updated.',
        progress,
      });

    } catch (error) {
      console.error(
        'UPDATE LESSON PROGRESS ERROR:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to update lesson progress.',
      });
    }
  }
);


/* =========================================================
   DELETE LESSON PROGRESS
   DELETE /api/lesson-progress/:lessonId
========================================================= */

router.delete(
  '/:lessonId',
  authMiddleware,
  async (req, res) => {
    try {
      const deleted =
        await LessonProgress.findOneAndDelete({
          user: req.userId,
          lessonId: req.params.lessonId,
        });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Lesson progress not found.',
        });
      }

      res.json({
        success: true,
        message: 'Lesson progress removed.',
      });

    } catch (error) {
      console.error(
        'DELETE LESSON PROGRESS ERROR:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Failed to remove lesson progress.',
      });
    }
  }
);


module.exports = router;