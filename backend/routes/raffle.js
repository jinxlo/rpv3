// routes/raffle.js
const express = require('express');
const router = express.Router();
const Raffle = require('../models/Raffle');
const auth = require('../middleware/auth'); // Middleware to check if user is admin

// Get all raffles (admin only)
router.get('/all', auth.isAdmin, async (req, res) => {
  try {
    const raffles = await Raffle.find();
    res.json(raffles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching raffles' });
  }
});

// Get active raffle (public)
router.get('/', async (req, res) => {
  try {
    // Get the most recent active raffle
    const raffle = await Raffle.findOne({ active: true }).sort({ createdAt: -1 });
    if (!raffle) {
      return res.status(404).json({ message: 'No active raffle found' });
    }
    res.json(raffle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching raffle' });
  }
});

// Create new raffle (admin only)
router.post('/create', auth.isAdmin, async (req, res) => {
  try {
    // Deactivate all other raffles
    await Raffle.updateMany({}, { active: false });

    // Create new raffle
    const raffle = new Raffle({
      productName: req.body.productName,
      productImage: req.body.productImage,
      price: req.body.price,
      totalTickets: req.body.totalTickets,
      active: true,
      soldTickets: 0,
      reservedTickets: 0
    });

    await raffle.save();
    res.status(201).json(raffle);
  } catch (error) {
    res.status(500).json({ message: 'Error creating raffle' });
  }
});

// Delete raffle (admin only)
router.delete('/:id', auth.isAdmin, async (req, res) => {
  try {
    await Raffle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Raffle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting raffle' });
  }
});

module.exports = router;