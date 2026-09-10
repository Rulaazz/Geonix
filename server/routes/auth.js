const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const dotenv = require('dotenv');
dotenv.config();


// =========================
// SIGN UP
// =========================

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: 'Email already used.',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      message: 'User created.',
    });

  } catch (err) {
    console.error('SIGNUP ERROR:', err);

    res.status(500).json({
      message: err.message,
    });
  }
});


// =========================
// LOGIN
// =========================

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid email or password.',
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '2d',
      }
    );

    res.json({
      token,
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);

    res.status(500).json({
      message: 'Login error.',
    });
  }
});


// =========================
// GET CURRENT USER
// =========================

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User
      .findById(req.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('GET USER ERROR:', error);

    res.status(500).json({
      message: 'Could not get user information.',
    });
  }
});


// =========================
// UPDATE PROFILE
// =========================

router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check required fields
    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required.',
      });
    }

    // Check if another user already uses this email
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email is already used by another account.',
      });
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('UPDATE PROFILE ERROR:', error);

    res.status(500).json({
      message: 'Could not update profile.',
    });
  }
});


module.exports = router;