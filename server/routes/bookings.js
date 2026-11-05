const express = require('express');

const router = express.Router();

const User = require('../models/User');
const Instructor = require('../models/Instructor');
const Availability = require('../models/Availability');
const Booking = require('../models/Booking');

const authMiddleware =
  require('../middleware/authMiddleware');

/* =====================================================
   HELPERS
===================================================== */

const isValidTime = (time) => {
  if (typeof time !== 'string') {
    return false;
  }

  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(
    time
  );
};

const getDayOfWeek = (dateString) => {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.getDay();
};

const isValidDateString = (dateString) => {
  if (
    typeof dateString !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }

  const date = new Date(
    `${dateString}T00:00:00`
  );

  return !Number.isNaN(date.getTime());
};

/* =====================================================
   CREATE BOOKING
===================================================== */

router.post(
  '/',
  authMiddleware,
  async (req, res) => {
    try {
      const student =
        await User.findById(req.userId);

      if (!student) {
        return res.status(404).json({
          message:
            'Student account not found.',
        });
      }

      const {
        instructorId,
        date,
        startTime,
        endTime,
        topic,
        notes,
      } = req.body;

      /* ---------------------------------------------
         Validate instructor
      --------------------------------------------- */

      const instructor =
        await User.findById(instructorId);

      if (!instructor) {
        return res.status(404).json({
          message:
            'Instructor not found.',
        });
      }

      if (
        instructor.role !==
        'instructor'
      ) {
        return res.status(400).json({
          message:
            'The selected user is not an instructor.',
        });
      }

      if (
        String(instructor._id) ===
        String(req.userId)
      ) {
        return res.status(400).json({
          message:
            'You cannot book a lesson with yourself.',
        });
      }

      /* ---------------------------------------------
         Validate date
      --------------------------------------------- */

      if (
        !isValidDateString(date)
      ) {
        return res.status(400).json({
          message:
            'Please provide a valid date in YYYY-MM-DD format.',
        });
      }

      /* ---------------------------------------------
         Validate time
      --------------------------------------------- */

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

      if (
        startTime >= endTime
      ) {
        return res.status(400).json({
          message:
            'End time must be later than start time.',
        });
      }

      /* ---------------------------------------------
         Check instructor profile
      --------------------------------------------- */

      const instructorProfile =
        await Instructor.findOne({
          user: instructorId,
          isActive: true,
        });

      if (!instructorProfile) {
        return res.status(400).json({
          message:
            'This instructor is not currently available.',
        });
      }

      /* ---------------------------------------------
         Check instructor availability
      --------------------------------------------- */

      const dayOfWeek =
        getDayOfWeek(date);

      const availability =
        await Availability.findOne({
          instructor: instructorId,
          dayOfWeek,
          isActive: true,
          startTime: {
            $lte: startTime,
          },
          endTime: {
            $gte: endTime,
          },
        });

      if (!availability) {
        return res.status(400).json({
          message:
            'The selected time is outside the instructor availability.',
        });
      }

      /* ---------------------------------------------
         Check if date is in the past
      --------------------------------------------- */

      const selectedDate =
        new Date(
          `${date}T${startTime}:00`
        );

      if (
        selectedDate <= new Date()
      ) {
        return res.status(400).json({
          message:
            'You cannot book a lesson in the past.',
        });
      }

      /* ---------------------------------------------
         Prevent instructor double booking
      --------------------------------------------- */

      const instructorConflict =
        await Booking.findOne({
          instructor: instructorId,
          date: {
            $gte: new Date(
              `${date}T00:00:00`
            ),
            $lt: new Date(
              `${date}T23:59:59`
            ),
          },
          status: {
            $in: [
              'pending',
              'confirmed',
            ],
          },
          startTime: {
            $lt: endTime,
          },
          endTime: {
            $gt: startTime,
          },
        });

      if (instructorConflict) {
        return res.status(409).json({
          message:
            'This time is already booked by another student.',
        });
      }

      /* ---------------------------------------------
         Prevent student double booking
      --------------------------------------------- */

      const studentConflict =
        await Booking.findOne({
          student: req.userId,
          date: {
            $gte: new Date(
              `${date}T00:00:00`
            ),
            $lt: new Date(
              `${date}T23:59:59`
            ),
          },
          status: {
            $in: [
              'pending',
              'confirmed',
            ],
          },
          startTime: {
            $lt: endTime,
          },
          endTime: {
            $gt: startTime,
          },
        });

      if (studentConflict) {
        return res.status(409).json({
          message:
            'You already have another lesson at this time.',
        });
      }

      /* ---------------------------------------------
         Create booking
      --------------------------------------------- */

      const booking =
        await Booking.create({
          student: req.userId,
          instructor: instructorId,
          date: selectedDate,
          startTime,
          endTime,
          topic:
            typeof topic ===
            'string'
              ? topic.trim()
              : '',
          notes:
            typeof notes ===
            'string'
              ? notes.trim()
              : '',
          status: 'pending',
          meetingLink: '',
        });

      console.log(
        '===================================='
      );

      console.log(
        'NEW BOOKING CREATED'
      );

      console.log(
        'BOOKING ID:',
        String(booking._id)
      );

      console.log(
        'STUDENT:',
        String(booking.student)
      );

      console.log(
        'INSTRUCTOR:',
        String(booking.instructor)
      );

      console.log(
        'STATUS:',
        booking.status
      );

      console.log(
        '===================================='
      );

      const populatedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            'student',
            'name email'
          )
          .populate(
            'instructor',
            'name email'
          );

      return res.status(201).json({
        message:
          'Lesson booking created successfully.',
        booking:
          populatedBooking,
      });
    } catch (error) {
      console.error(
        'CREATE BOOKING ERROR:',
        error
      );

      return res.status(500).json({
        message:
          'Could not create lesson booking.',
      });
    }
  }
);

/* =====================================================
   GET MY BOOKINGS
===================================================== */

router.get(
  '/my',
  authMiddleware,
  async (req, res) => {
    try {
      const bookings =
        await Booking.find({
          $or: [
            {
              student: req.userId,
            },
            {
              instructor: req.userId,
            },
          ],
        })
          .populate(
            'student',
            'name email'
          )
          .populate(
            'instructor',
            'name email'
          )
          .sort({
            date: 1,
            startTime: 1,
          });

      /* ---------------------------------------------
         DEBUG INFORMATION
      --------------------------------------------- */

      console.log(
        '===================================='
      );

      console.log(
        'GET MY BOOKINGS'
      );

      console.log(
        'USER ID:',
        req.userId
      );

      console.log(
        'NUMBER OF BOOKINGS:',
        bookings.length
      );

      bookings.forEach(
        (booking, index) => {
          console.log(
            `BOOKING ${index + 1}`
          );

          console.log(
            'ID:',
            String(
              booking._id
            )
          );

          console.log(
            'STUDENT:',
            booking.student?._id
              ? String(
                  booking.student._id
                )
              : null
          );

          console.log(
            'INSTRUCTOR:',
            booking.instructor?._id
              ? String(
                  booking.instructor._id
                )
              : null
          );

          console.log(
            'DATE:',
            booking.date
          );

          console.log(
            'TIME:',
            `${booking.startTime} - ${booking.endTime}`
          );

          console.log(
            'STATUS:',
            booking.status
          );

          console.log(
            '------------------------------------'
          );
        }
      );

      console.log(
        '===================================='
      );

      return res.json({
        bookings,
      });
    } catch (error) {
      console.error(
        'GET MY BOOKINGS ERROR:',
        error
      );

      return res.status(500).json({
        message:
          'Could not load bookings.',
      });
    }
  }
);

/* =====================================================
   GET ONE BOOKING
===================================================== */

router.get(
  '/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const booking =
        await Booking.findOne({
          _id: req.params.id,
          $or: [
            {
              student: req.userId,
            },
            {
              instructor: req.userId,
            },
          ],
        })
          .populate(
            'student',
            'name email'
          )
          .populate(
            'instructor',
            'name email'
          );

      if (!booking) {
        return res.status(404).json({
          message:
            'Booking not found.',
        });
      }

      console.log(
        'GET ONE BOOKING:',
        String(booking._id),
        'STATUS:',
        booking.status
      );

      return res.json({
        booking,
      });
    } catch (error) {
      console.error(
        'GET BOOKING ERROR:',
        error
      );

      return res.status(500).json({
        message:
          'Could not load booking.',
      });
    }
  }
);

/* =====================================================
   CANCEL BOOKING
===================================================== */

router.put(
  '/:id/cancel',
  authMiddleware,
  async (req, res) => {
    try {
      const booking =
        await Booking.findOne({
          _id: req.params.id,
          $or: [
            {
              student: req.userId,
            },
            {
              instructor: req.userId,
            },
          ],
        });

      if (!booking) {
        return res.status(404).json({
          message:
            'Booking not found.',
        });
      }

      if (
        booking.status ===
        'completed'
      ) {
        return res.status(400).json({
          message:
            'Completed lessons cannot be cancelled.',
        });
      }

      if (
        booking.status ===
        'cancelled'
      ) {
        return res.status(400).json({
          message:
            'This booking is already cancelled.',
        });
      }

      booking.status =
        'cancelled';

      await booking.save();

      const updatedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            'student',
            'name email'
          )
          .populate(
            'instructor',
            'name email'
          );

      console.log(
        'BOOKING CANCELLED:',
        String(
          updatedBooking._id
        ),
        'STATUS:',
        updatedBooking.status
      );

      return res.json({
        message:
          'Booking cancelled successfully.',
        booking:
          updatedBooking,
      });
    } catch (error) {
      console.error(
        'CANCEL BOOKING ERROR:',
        error
      );

      return res.status(500).json({
        message:
          'Could not cancel booking.',
      });
    }
  }
);

/* =====================================================
   INSTRUCTOR CONFIRMS BOOKING
===================================================== */

router.put(
  '/:id/confirm',
  authMiddleware,
  async (req, res) => {
    try {
      console.log(
        '===================================='
      );

      console.log(
        'CONFIRM BOOKING REQUEST'
      );

      console.log(
        'BOOKING ID:',
        req.params.id
      );

      console.log(
        'USER ID:',
        req.userId
      );

      console.log(
        '===================================='
      );

      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            'User not found.',
        });
      }

      console.log(
        'USER ROLE:',
        user.role
      );

      if (
        user.role !==
        'instructor'
      ) {
        return res.status(403).json({
          message:
            'Only instructors can confirm bookings.',
        });
      }

      const booking =
        await Booking.findOne({
          _id: req.params.id,
          instructor: req.userId,
        });

      if (!booking) {
        return res.status(404).json({
          message:
            'Booking not found.',
        });
      }

      console.log(
        'BOOKING FOUND:',
        String(
          booking._id
        )
      );

      console.log(
        'BOOKING STATUS BEFORE:',
        booking.status
      );

      if (
        booking.status !==
        'pending'
      ) {
        return res.status(400).json({
          message:
            `Only pending bookings can be confirmed. Current status: ${booking.status}`,
        });
      }

      /* ---------------------------------------------
         CHANGE STATUS
      --------------------------------------------- */

      booking.status =
        'confirmed';

      await booking.save();

      console.log(
        'STATUS SAVED TO DATABASE:',
        booking.status
      );

      /* ---------------------------------------------
         READ FROM DATABASE AGAIN
      --------------------------------------------- */

      const confirmedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            'student',
            'name email'
          )
          .populate(
            'instructor',
            'name email'
          );

      console.log(
        'BOOKING STATUS AFTER DATABASE READ:',
        confirmedBooking.status
      );

      console.log(
        '===================================='
      );

      return res.json({
        success: true,
        message:
          'Booking confirmed successfully.',
        booking:
          confirmedBooking,
      });
    } catch (error) {
      console.error(
        'CONFIRM BOOKING ERROR:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Could not confirm booking.',
      });
    }
  }
);

/* =====================================================
   INSTRUCTOR COMPLETES BOOKING
===================================================== */

router.put(
  '/:id/complete',
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        );

      if (!user) {
        return res.status(404).json({
          message:
            'User not found.',
        });
      }

      if (
        user.role !==
        'instructor'
      ) {
        return res.status(403).json({
          message:
            'Only instructors can complete bookings.',
        });
      }

      const booking =
        await Booking.findOne({
          _id: req.params.id,
          instructor: req.userId,
        });

      if (!booking) {
        return res.status(404).json({
          message:
            'Booking not found.',
        });
      }

      if (
        booking.status !==
        'confirmed'
      ) {
        return res.status(400).json({
          message:
            'Only confirmed bookings can be completed.',
        });
      }

      booking.status =
        'completed';

      await booking.save();

      const completedBooking =
        await Booking.findById(
          booking._id
        )
          .populate(
            'student',
            'name email'
          )
          .populate(
            'instructor',
            'name email'
          );

      console.log(
        'BOOKING COMPLETED:',
        String(
          completedBooking._id
        ),
        'STATUS:',
        completedBooking.status
      );

      return res.json({
        success: true,
        message:
          'Lesson marked as completed.',
        booking:
          completedBooking,
      });
    } catch (error) {
      console.error(
        'COMPLETE BOOKING ERROR:',
        error
      );

      return res.status(500).json({
        success: false,
        message:
          'Could not complete booking.',
      });
    }
  }
);

module.exports = router;