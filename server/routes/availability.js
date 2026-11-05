const express = require('express');

const router = express.Router();

const User = require('../models/User');
const Availability = require('../models/Availability');

const authMiddleware =
  require('../middleware/authMiddleware');

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const isValidTime = (time) => {
  if (typeof time !== 'string') {
    return false;
  }

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    time
  );
};

/* =====================================================
   GET PUBLIC INSTRUCTOR AVAILABILITY
   ===================================================== */

router.get(
  '/instructor/:instructorId',
  authMiddleware,
  async (req, res) => {
    try {
      const instructor = await User.findById(
        req.params.instructorId
      );

      if (!instructor) {
        return res.status(404).json({
          message: 'Instructor not found.',
        });
      }

      if (instructor.role !== 'instructor') {
        return res.status(400).json({
          message:
            'The selected user is not an instructor.',
        });
      }

      const availability =
        await Availability.find({
          instructor: req.params.instructorId,
          isActive: true,
        }).sort({
          dayOfWeek: 1,
          startTime: 1,
        });

      res.json({
        instructor: {
          id: instructor._id,
          name: instructor.name,
        },
        availability,
      });

    } catch (error) {
      console.error(
        'GET PUBLIC INSTRUCTOR AVAILABILITY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not load instructor availability.',
      });
    }
  }
);

/* =====================================================
   GET MY AVAILABILITY
   ===================================================== */

router.get(
  '/me',
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      if (user.role !== 'instructor') {
        return res.status(403).json({
          message:
            'Only instructors can manage availability.',
        });
      }

      const availability =
        await Availability.find({
          instructor: req.userId,
        }).sort({
          dayOfWeek: 1,
          startTime: 1,
        });

      res.json({
        availability,
      });

    } catch (error) {
      console.error(
        'GET AVAILABILITY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not load availability.',
      });
    }
  }
);

/* =====================================================
   CREATE AVAILABILITY
   ===================================================== */

router.post(
  '/',
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      if (user.role !== 'instructor') {
        return res.status(403).json({
          message:
            'Only instructors can create availability.',
        });
      }

      const {
        dayOfWeek,
        startTime,
        endTime,
      } = req.body;

      const day = Number(dayOfWeek);

      if (
        !Number.isInteger(day) ||
        day < 0 ||
        day > 6
      ) {
        return res.status(400).json({
          message:
            'Please provide a valid day of the week.',
        });
      }

      if (!isValidTime(startTime)) {
        return res.status(400).json({
          message:
            'Start time must use HH:MM format.',
        });
      }

      if (!isValidTime(endTime)) {
        return res.status(400).json({
          message:
            'End time must use HH:MM format.',
        });
      }

      if (startTime >= endTime) {
        return res.status(400).json({
          message:
            'End time must be later than start time.',
        });
      }

      const existing =
        await Availability.findOne({
          instructor: req.userId,
          dayOfWeek: day,
          startTime,
          endTime,
        });

      if (existing) {
        return res.status(400).json({
          message:
            'This availability slot already exists.',
        });
      }

      const existingSlots =
        await Availability.find({
          instructor: req.userId,
          dayOfWeek: day,
          isActive: true,
        });

      const newStart = startTime;
      const newEnd = endTime;

      const overlaps =
        existingSlots.some((slot) => {
          return (
            newStart < slot.endTime &&
            newEnd > slot.startTime
          );
        });

      if (overlaps) {
        return res.status(400).json({
          message:
            'This time overlaps with another availability slot.',
        });
      }

      const availability =
        await Availability.create({
          instructor: req.userId,
          dayOfWeek: day,
          startTime,
          endTime,
          isActive: true,
        });

      res.status(201).json({
        message:
          `${dayNames[day]} availability created successfully.`,
        availability,
      });

    } catch (error) {
      console.error(
        'CREATE AVAILABILITY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not create availability.',
      });
    }
  }
);

/* =====================================================
   DELETE AVAILABILITY
   ===================================================== */

router.delete(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      if (user.role !== 'instructor') {
        return res.status(403).json({
          message:
            'Only instructors can delete availability.',
        });
      }

      const availability =
        await Availability.findOneAndDelete({
          _id: req.params.id,
          instructor: req.userId,
        });

      if (!availability) {
        return res.status(404).json({
          message:
            'Availability slot not found.',
        });
      }

      res.json({
        message:
          'Availability removed successfully.',
      });

    } catch (error) {
      console.error(
        'DELETE AVAILABILITY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not delete availability.',
      });
    }
  }
);

/* =====================================================
   UPDATE AVAILABILITY
   ===================================================== */

router.put(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          message: 'User not found.',
        });
      }

      if (user.role !== 'instructor') {
        return res.status(403).json({
          message:
            'Only instructors can update availability.',
        });
      }

      const { isActive } = req.body;

      const availability =
        await Availability.findOneAndUpdate(
          {
            _id: req.params.id,
            instructor: req.userId,
          },
          {
            isActive: Boolean(isActive),
          },
          {
            new: true,
          }
        );

      if (!availability) {
        return res.status(404).json({
          message:
            'Availability slot not found.',
        });
      }

      res.json({
        message:
          'Availability updated successfully.',
        availability,
      });

    } catch (error) {
      console.error(
        'UPDATE AVAILABILITY ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not update availability.',
      });
    }
  }
);

module.exports = router;