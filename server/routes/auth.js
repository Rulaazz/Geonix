
const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

dotenv.config();

/* =========================
   USER RESPONSE HELPER
========================= */

const formatUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role || 'student',
  avatar: user.avatar || '',
  gradeLevel: user.gradeLevel || '',
  learningGoal: user.learningGoal || '',
  bio: user.bio || '',
});

/* =========================
   SIGN UP
========================= */

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Name, email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email already used.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'User created.',
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email already used.',
      });
    }

    console.error('SIGNUP ERROR:', error);

    return res.status(500).json({
      message: 'Could not create user.',
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Password is excluded by default in User.js,
    // so explicitly select it for password verification.
    const user = await User.findOne({
      email: normalizedEmail,
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        message: 'Invalid email or password.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment.');

      return res.status(500).json({
        message: 'Authentication is not configured correctly.',
      });
    }

    const token = jwt.sign(
      {
        id: String(user._id),
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2d',
      }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      message: 'Login error.',
    });
  }
});

/* =========================
   GET CURRENT USER
========================= */

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    return res.json({
      user: formatUser(user),
    });
  } catch (error) {
    console.error('GET USER ERROR:', error);

    return res.status(500).json({
      message: 'Could not get user information.',
    });
  }
});

/* =========================
   UPDATE PROFILE
========================= */

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const {
      name,
      gradeLevel,
      learningGoal,
      bio,
    } = req.body;

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        message: 'Name is required.',
      });
    }

    if (
      gradeLevel !== undefined &&
      typeof gradeLevel !== 'string'
    ) {
      return res.status(400).json({
        message: 'Grade level must be a string.',
      });
    }

    if (
      learningGoal !== undefined &&
      typeof learningGoal !== 'string'
    ) {
      return res.status(400).json({
        message: 'Learning goal must be a string.',
      });
    }

    if (bio !== undefined && typeof bio !== 'string') {
      return res.status(400).json({
        message: 'Bio must be a string.',
      });
    }

    if (typeof bio === 'string' && bio.length > 1000) {
      return res.status(400).json({
        message: 'Bio cannot exceed 1000 characters.',
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    user.name = name.trim();

    if (gradeLevel !== undefined) {
      user.gradeLevel = gradeLevel.trim();
    }

    if (learningGoal !== undefined) {
      user.learningGoal = learningGoal.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    return res.json({
      message: 'Profile updated successfully.',
      user: formatUser(user),
    });
  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);

    return res.status(500).json({
      message: 'Could not update profile.',
    });
  }
});

module.exports = router;
