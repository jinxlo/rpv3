const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// @route   GET /api/tickets/:id
// @desc    Get a single ticket by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketNumber: req.params.id }).select('-__v').lean();
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket' });
  }
});

module.exports = router;
