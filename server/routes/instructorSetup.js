const express = require('express');

const router = express.Router();

const User = require('../models/User');
const Instructor = require('../models/Instructor');

const authMiddleware =
  require('../middleware/authMiddleware');


// =========================
// MAKE CURRENT USER
// AN INSTRUCTOR
// =========================

router.post(
  '/become-instructor',
  authMiddleware,
  async (req, res) => {
    try {
      // =========================
      // FIND USER
      // =========================

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }


      // =========================
      // CHECK EXISTING ROLE
      // =========================

      if (user.role === 'admin') {
        return res.status(400).json({
          message:
            'Admin accounts cannot become instructors.',
        });
      }


      // =========================
      // ALREADY INSTRUCTOR
      // =========================

      if (user.role === 'instructor') {
        return res.json({
          message:
            'You are already an instructor.',
          user,
        });
      }


      // =========================
      // CHANGE ROLE
      // =========================

      user.role = 'instructor';

      await user.save();


      // =========================
      // CREATE PROFILE
      // =========================

      let instructor =
        await Instructor.findOne({
          user: user._id,
        });

      if (!instructor) {
        instructor =
          await Instructor.create({
            user: user._id,

            bio: '',

            subjects: [
              'Mathematics',
            ],

            grades: [],

            experience: 0,

            hourlyRate: 0,

            avatar: '',

            isActive: true,
          });
      }


      // =========================
      // RESPONSE
      // =========================

      res.json({
        message:
          'Your account is now an instructor.',
        user,
        instructor,
      });

    } catch (error) {

      console.error(
        'BECOME INSTRUCTOR ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not create instructor account.',
      });
    }
  }
);


module.exports = router;