// routes/payments.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Required for transactions
const User = require('../models/User');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const fs = require('fs'); // For filesystem operations

// Secret key for JWT (Store in environment variable)
const JWT_SECRET = process.env.JWT_SECRET;

// Export a function that takes multer upload middleware and io
module.exports = (upload, io) => {

  /**
   * @route   POST /api/payments/create-and-pay
   * @desc    Create a new user account and reserve selected tickets
   * @access  Public
   */
  router.post(
    '/create-and-pay',
    upload.single('proofOfPayment'), // Handle file upload
    [
      // Validation middleware
      body('fullName').notEmpty().withMessage('Full Name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('idNumber').notEmpty().withMessage('ID Number is required'),
      body('phoneNumber').notEmpty().withMessage('Phone Number is required'),
      body('selectedNumbers').notEmpty().withMessage('Selected ticket numbers are required'),
      body('method').notEmpty().withMessage('Payment method is required'),
      body('totalAmountUSD').isFloat({ gt: 0 }).withMessage('Total Amount USD must be a positive number'),
    ],
    async (req, res) => {
      // Handle validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // If a file was uploaded, remove it since the request is invalid
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        fullName,
        idNumber,
        phoneNumber,
        email,
        password,
        selectedNumbers,
        method,
        totalAmountUSD,
      } = req.body;

      // Start a session for transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Check if user already exists
        let user = await User.findOne({ email }).session(session);
        if (user) {
          throw new Error('User with this email already exists');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
          fullName,
          email,
          password: hashedPassword, // Use hashed password
          idNumber,
          phoneNumber,
        });

        await user.save({ session });

        // Reserve tickets using atomic update to avoid race conditions
        let tickets = [];
        try {
          tickets = JSON.parse(selectedNumbers);
          if (!Array.isArray(tickets)) throw new Error();
        } catch (err) {
          throw new Error('Invalid selectedNumbers format');
        }

        const unavailableTickets = [];

        for (const ticketNumber of tickets) {
          console.log(`Attempting to reserve ticket ${ticketNumber}`);
          const ticket = await Ticket.findOneAndUpdate(
            { ticketNumber, status: 'available' },
            { $set: { status: 'reserved', reservedAt: new Date(), userId: user._id } },
            { session, new: true }
          );

          if (!ticket) {
            console.log(`Ticket ${ticketNumber} is not available`);
            unavailableTickets.push(ticketNumber);
          } else {
            console.log(`Successfully reserved ticket ${ticketNumber}`);
          }
        }

        if (unavailableTickets.length > 0) {
          throw new Error(`The following tickets are not available: ${unavailableTickets.join(', ')}`);
        }

        // Create payment record
        const payment = new Payment({
          user: user._id, // Reference to the user
          fullName,
          idNumber,
          phoneNumber,
          email,
          selectedNumbers: tickets,
          method,
          totalAmountUSD: parseFloat(totalAmountUSD),
          proofOfPayment: req.file ? `/uploads/proofs/${req.file.filename}` : '',
          status: 'Pending',
        });

        await payment.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Emit event to inform all clients about the reserved tickets
        io.emit('ticketsReserved', { tickets });

        // Generate JWT token
        const token = jwt.sign(
          { userId: user._id, isAdmin: user.isAdmin },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        // Respond with success message and token
        res.status(201).json({
          success: true,
          message: 'Account created and payment submitted successfully',
          token,
          isAdmin: user.isAdmin,
        });
      } catch (error) {
        // Only abort if the transaction hasn't been committed
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        session.endSession();

        // If a file was uploaded, remove it since the transaction failed
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        console.error('Error in create-and-pay:', error);
        res.status(400).json({ success: false, message: error.message || 'Server error' });
      }
    }
  );

  return router;
};
