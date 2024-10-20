// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: Number, required: true, unique: true },
  status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
  reservedAt: { type: Date, default: null },
  userId: { type: String, default: null },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
