// routes/payments.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post('/confirm', upload.single('proofOfPayment'), async (req, res) => {
  try {
    const {
      fullName,
      idNumber,
      phoneNumber,
      email,
      selectedNumbers,
      method,
      totalAmountUSD,
    } = req.body;

    // Parse selectedNumbers if it's a string
    const numbers = Array.isArray(selectedNumbers)
      ? selectedNumbers
      : JSON.parse(selectedNumbers);

    // Save payment details
    const payment = new Payment({
      fullName,
      idNumber,
      phoneNumber,
      email,
      selectedNumbers: numbers,
      method,
      totalAmountUSD,
      proofOfPayment: req.file.path,
      status: 'Pending',
    });
    await payment.save();

    // Reserve tickets
    for (const number of numbers) {
      await Ticket.findOneAndUpdate(
        { ticketNumber: number, status: 'available' },
        { $set: { status: 'reserved', userId: email, reservedAt: new Date() } }
      );
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create new user without password
      user = new User({ email });
      await user.save();
    }

    res.json({ message: 'Payment confirmed' });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
