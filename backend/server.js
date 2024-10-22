// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// -----------------------
// Socket.IO Configuration
// -----------------------
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join admin room if user is admin
  socket.on('join-admin', (token) => {
    // Verify admin token here if needed
    socket.join('admin-room');
    console.log('Admin joined:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// -----------------------
// Middleware Configuration
// -----------------------

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// -----------------------
// Multer Configuration
// -----------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/proofs';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------------
// Import Models
// -----------------------

const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Payment = require('./models/Payment');
const Raffle = require('./models/Raffle');

// -----------------------
// Routes Configuration
// -----------------------

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const ticketsRoutes = require('./routes/tickets');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes(upload, io));
app.use('/api/tickets', ticketsRoutes(io));

// Exchange Rate Route
app.get('/api/exchange-rate', async (req, res) => {
  try {
    const response = await axios.get('https://bcv-exchange-rates.vercel.app/get_exchange_rates', { 
      timeout: 5000 
    });
    res.json(response.data);
  } catch (error) {
    console.error('Exchange rate error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch exchange rate', 
      fallbackRate: 35.0 
    });
  }
});

// Raffle Route
app.get('/api/raffle', async (req, res) => {
  try {
    const raffle = await Raffle.findOne({ active: true });
    
    if (!raffle) {
      return res.status(404).json({ 
        error: 'No active raffle found',
        message: 'Please create a raffle from the admin dashboard' 
      });
    }

    res.json({
      id: raffle._id,
      productName: raffle.productName,
      productImage: raffle.productImage,
      price: raffle.price,
      totalTickets: raffle.totalTickets,
      soldTickets: raffle.soldTickets,
      reservedTickets: raffle.reservedTickets,
      active: raffle.active
    });
  } catch (error) {
    console.error('Raffle fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch raffle data' });
  }
});

// -----------------------
// Scheduled Tasks
// -----------------------

cron.schedule('*/5 * * * *', async () => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  try {
    const expiredTickets = await Ticket.find({
      status: 'reserved',
      reservedAt: { $lt: cutoff }
    });

    if (expiredTickets.length > 0) {
      const ticketNumbers = expiredTickets.map(ticket => ticket.ticketNumber);

      await Ticket.updateMany(
        { ticketNumber: { $in: ticketNumbers } },
        { 
          $set: { 
            status: 'available', 
            reservedAt: null, 
            userId: null 
          } 
        }
      );

      io.emit('ticketsReleased', { tickets: ticketNumbers });
      console.log(`Released ${ticketNumbers.length} expired tickets`);
    }
  } catch (error) {
    console.error('Error in ticket release job:', error);
  }
});

// -----------------------
// Database & Server
// -----------------------

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Initialize tickets if needed
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      const tickets = Array.from({ length: 1000 }, (_, i) => ({
        ticketNumber: i + 1,
        status: 'available'
      }));
      await Ticket.insertMany(tickets);
      console.log('Initialized 1000 tickets');
    }

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});