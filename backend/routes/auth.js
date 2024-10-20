// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Secret key for JWT (Store in environment variable)
const JWT_SECRET = process.env.JWT_SECRET;

// Login with password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send login code
router.post('/send-login-code', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new user without a password
    if (!user) {
      user = new User({ email });
    }

    // Generate a 6-digit code
    const loginCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save code and expiration to user's record
    user.loginCode = loginCode;
    user.codeExpires = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes
    await user.save();

    // Send code via email
    // Configure your email transport
    const transporter = nodemailer.createTransport({
      // Use environment variables or a secure config
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Login Code',
      text: `Your login code is ${loginCode}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Email error:', err);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.json({ message: 'Login code sent' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify login code
router.post('/verify-login-code', async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      user.loginCode !== code ||
      user.codeExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Clear login code
    user.loginCode = null;
    user.codeExpires = null;
    await user.save();

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
