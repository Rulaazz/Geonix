const express = require('express');

const router = express.Router();

const User = require('../models/User');
const Instructor = require('../models/Instructor');

const authMiddleware =
  require('../middleware/authMiddleware');

/* =====================================================
   GET ALL ACTIVE INSTRUCTORS
   GET /api/instructors
===================================================== */

router.get(
  '/',
  authMiddleware,
  async (req, res) => {
    try {
      const instructors =
        await Instructor.find({
          isActive: true,
        })
          .populate(
            'user',
            'name email role'
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        instructors,
      });

    } catch (error) {
      console.error(
        'GET INSTRUCTORS ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not load instructors.',
      });
    }
  }
);

/* =====================================================
   GET MY INSTRUCTOR PROFILE
   GET /api/instructors/me
===================================================== */

router.get(
  '/me',
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
            'Only instructors can access this profile.',
        });
      }

      const instructor =
        await Instructor.findOne({
          user: req.userId,
        }).populate(
          'user',
          'name email role'
        );

      if (!instructor) {
        return res.status(404).json({
          message:
            'Instructor profile not found.',
        });
      }

      res.json({
        instructor,
      });

    } catch (error) {
      console.error(
        'GET MY INSTRUCTOR ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not load instructor profile.',
      });
    }
  }
);

/* =====================================================
   GET ONE INSTRUCTOR
   GET /api/instructors/:instructorId

   The ID can be either:
   - Instructor._id
   - User._id
===================================================== */

router.get(
  '/:instructorId',
  authMiddleware,
  async (req, res) => {
    try {
      const id =
        req.params.instructorId;

      let instructor =
        null;

      /* ---------------------------------------------
         First try Instructor._id
      --------------------------------------------- */

      instructor =
        await Instructor.findOne({
          _id: id,
          isActive: true,
        }).populate(
          'user',
          'name email role'
        );

      /* ---------------------------------------------
         If not found, try User._id
      --------------------------------------------- */

      if (!instructor) {
        instructor =
          await Instructor.findOne({
            user: id,
            isActive: true,
          }).populate(
            'user',
            'name email role'
          );
      }

      if (!instructor) {
        return res.status(404).json({
          message:
            'Instructor not found.',
        });
      }

      res.json({
        instructor,
      });

    } catch (error) {
      console.error(
        'GET INSTRUCTOR ERROR:',
        error
      );

      /*
       * Invalid MongoDB ObjectId
       */
      if (
        error.name ===
        'CastError'
      ) {
        return res.status(404).json({
          message:
            'Instructor not found.',
        });
      }

      res.status(500).json({
        message:
          'Could not load instructor.',
      });
    }
  }
);

/* =====================================================
   CREATE INSTRUCTOR PROFILE
   POST /api/instructors/profile
===================================================== */

router.post(
  '/profile',
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
            'Only instructors can create an instructor profile.',
        });
      }

      const existing =
        await Instructor.findOne({
          user: req.userId,
        });

      if (existing) {
        return res.status(400).json({
          message:
            'Instructor profile already exists.',
        });
      }

      const {
        bio,
        subjects,
        grades,
        experience,
        hourlyRate,
        avatar,
      } = req.body;

      const instructor =
        await Instructor.create({
          user: req.userId,

          bio:
            typeof bio ===
            'string'
              ? bio.trim()
              : '',

          subjects:
            Array.isArray(
              subjects
            )
              ? subjects
              : [],

          grades:
            Array.isArray(
              grades
            )
              ? grades
              : [],

          experience:
            Number(
              experience
            ) || 0,

          hourlyRate:
            Number(
              hourlyRate
            ) || 0,

          avatar:
            typeof avatar ===
            'string'
              ? avatar.trim()
              : '',

          isActive: true,
        });

      const populatedInstructor =
        await Instructor.findById(
          instructor._id
        ).populate(
          'user',
          'name email role'
        );

      res.status(201).json({
        message:
          'Instructor profile created successfully.',

        instructor:
          populatedInstructor,
      });

    } catch (error) {
      console.error(
        'CREATE INSTRUCTOR ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not create instructor profile.',
      });
    }
  }
);

/* =====================================================
   UPDATE INSTRUCTOR PROFILE
   PUT /api/instructors/profile
===================================================== */

router.put(
  '/profile',
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
            'Only instructors can update this profile.',
        });
      }

      const {
        bio,
        subjects,
        grades,
        experience,
        hourlyRate,
        avatar,
        isActive,
      } = req.body;

      const instructor =
        await Instructor.findOneAndUpdate(
          {
            user: req.userId,
          },
          {
            bio:
              bio !== undefined
                ? String(
                    bio
                  ).trim()
                : '',

            subjects:
              Array.isArray(
                subjects
              )
                ? subjects
                : [],

            grades:
              Array.isArray(
                grades
              )
                ? grades
                : [],

            experience:
              Number(
                experience
              ) || 0,

            hourlyRate:
              Number(
                hourlyRate
              ) || 0,

            avatar:
              avatar !== undefined
                ? String(
                    avatar
                  ).trim()
                : '',

            isActive:
              isActive !== undefined
                ? Boolean(
                    isActive
                  )
                : true,
          },
          {
            new: true,
            runValidators: true,
          }
        ).populate(
          'user',
          'name email role'
        );

      if (!instructor) {
        return res.status(404).json({
          message:
            'Instructor profile not found.',
        });
      }

      res.json({
        message:
          'Instructor profile updated successfully.',

        instructor,
      });

    } catch (error) {
      console.error(
        'UPDATE INSTRUCTOR ERROR:',
        error
      );

      res.status(500).json({
        message:
          'Could not update instructor profile.',
      });
    }
  }
);

module.exports = router;