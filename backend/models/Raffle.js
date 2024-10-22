// models/Raffle.js
const mongoose = require('mongoose');

const raffleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  price: { type: Number, required: true },
  totalTickets: { type: Number, required: true },
  soldTickets: { type: [Number], default: [] },
  pendingTickets: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Raffle', raffleSchema);
