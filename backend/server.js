// server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');

const cors = require('cors');

const http = require('http'); // Required for creating an HTTP server

const { Server } = require('socket.io'); // Import Socket.IO

const mongoose = require('mongoose'); // For MongoDB connection

const cron = require('node-cron'); // For scheduling tasks

const path = require('path'); // For handling file paths

const axios = require('axios'); // Import axios for making HTTP requests

const multer = require('multer'); // Import multer for handling file uploads

const fs = require('fs'); // For filesystem operations



const app = express();

const PORT = process.env.PORT || 5000;



// -----------------------

// Middleware Configuration

// -----------------------



// CORS Configuration

app.use(cors({

  origin: 'http://localhost:3000', // Replace with your React frontend URL

  methods: ['GET', 'POST'],

  credentials: true,

}));



// Body Parsing Middleware

app.use(express.json()); // Middleware to parse JSON data

app.use(express.urlencoded({ extended: true })); // For parsing form data



// -----------------------

// Multer Configuration

// -----------------------



// Configure multer for file uploads

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, 'uploads/proofs/'); // Directory to store proof of payment

  },

  filename: function (req, file, cb) {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    cb(null, uniqueSuffix + '-' + file.originalname);

  }

});

const upload = multer({ storage: storage });



// Ensure the uploads/proofs directory exists

const uploadsDir = path.join(__dirname, 'uploads/proofs');

if (!fs.existsSync(uploadsDir)) {

  fs.mkdirSync(uploadsDir, { recursive: true });

}

// Serve uploaded files statically

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// -----------------------

// HTTP Server & Socket.IO

// -----------------------



// Create an HTTP server and bind Socket.IO to it

const server = http.createServer(app);

const io = new Server(server, {

  cors: {

    origin: 'http://localhost:3000', // Replace with your React frontend URL or use an environment variable

    methods: ['GET', 'POST'],

    credentials: true,

  },

});



// Socket.IO connection event

io.on('connection', (socket) => {

  console.log('A user connected');



  // Handle when a user disconnects

  socket.on('disconnect', () => {

    console.log('A user disconnected');

  });

});



// -----------------------

// Import Models

// -----------------------



const Ticket = require('./models/Ticket');

const User = require('./models/User');

const Payment = require('./models/Payment');

const Raffle = require('./models/Raffle'); // Assuming you have a Raffle model



// -----------------------

// Import Routes

// -----------------------



// Import authentication routes

const authRoutes = require('./routes/auth');

// Import payment routes and pass the upload middleware

const paymentRoutes = require('./routes/payments')(upload); // Pass multer to payment routes



// Use routes

app.use('/api/auth', authRoutes);

app.use('/api/payments', paymentRoutes);



// -----------------------

// Additional Routes

// -----------------------



// Route to fetch exchange rates

app.get('/api/exchange-rate', async (req, res) => {

  try {

    const response = await axios.get('https://bcv-exchange-rates.vercel.app/get_exchange_rates');

    res.json(response.data);

  } catch (error) {

    console.error('Error fetching exchange rate:', error);

    res.status(500).json({ error: 'Failed to fetch exchange rate' });

  }

});



// Define a route to fetch raffle data

app.get('/api/raffle', async (req, res) => {
  try {
    // Fetch raffle data from the database
    const raffle = await Raffle.findOne({ id: '1' }); // Assuming you have a Raffle model

    if (!raffle) {
      return res.status(404).json({ error: 'Raffle not found' });
    }

    const raffleData = {
      id: raffle.id,
      productName: raffle.productName,
      productImage: raffle.productImage,
      price: raffle.price,
      totalTickets: raffle.totalTickets,
      soldTickets: raffle.soldTickets, // Assuming these fields exist in your Raffle model
      pendingTickets: raffle.pendingTickets,
    };

    res.json(raffleData);
  } catch (error) {
    console.error('Error fetching raffle data:', error);
    res.status(500).json({ error: 'Failed to fetch raffle data' });
  }
});



// -----------------------

// Ticket Routes

// -----------------------



// Get all tickets

app.get('/api/tickets', async (req, res) => {

  try {

    const tickets = await Ticket.find({}, '-__v');

    res.json(tickets);

  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch tickets' });

  }

});



// Reserve tickets

app.post('/api/tickets/reserve', async (req, res) => {

  const { userId, tickets } = req.body;



  try {

    const availableTickets = await Ticket.find({

      ticketNumber: { $in: tickets },

      status: 'available',

    });



    if (availableTickets.length !== tickets.length) {

      return res

        .status(400)

        .json({ success: false, message: 'Some tickets are not available' });

    }



    await Ticket.updateMany(

      { ticketNumber: { $in: tickets } },

      { $set: { status: 'reserved', reservedAt: new Date(), userId } }

    );



    io.emit('ticketsReserved', { tickets });



    res.json({ success: true, message: 'Tickets reserved successfully' });

  } catch (error) {

    res.status(500).json({ success: false, error: 'Failed to reserve tickets' });

  }

});



// Confirm tickets

app.post('/api/tickets/confirm', async (req, res) => {

  const { userId, tickets } = req.body;



  try {

    const reservedTickets = await Ticket.find({

      ticketNumber: { $in: tickets },

      status: 'reserved',

      userId,

    });



    if (reservedTickets.length !== tickets.length) {

      return res

        .status(400)

        .json({ success: false, message: 'Some tickets are not reserved by this user' });

    }



    await Ticket.updateMany(

      { ticketNumber: { $in: tickets } },

      { $set: { status: 'sold', reservedAt: null, userId: null } }

    );



    io.emit('ticketsSold', { tickets });



    res.json({ success: true, message: 'Tickets confirmed successfully' });

  } catch (error) {

    res.status(500).json({ success: false, error: 'Failed to confirm tickets' });

  }

});



// -----------------------

// Cron Jobs

// -----------------------



// Cron job to release tickets after 24 hours

cron.schedule('0 * * * *', async () => {

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  try {

    const expiredTickets = await Ticket.find({

      status: 'reserved',

      reservedAt: { $lt: cutoff },

    });



    if (expiredTickets.length > 0) {

      const ticketNumbers = expiredTickets.map((ticket) => ticket.ticketNumber);



      await Ticket.updateMany(

        { ticketNumber: { $in: ticketNumbers } },

        { $set: { status: 'available', reservedAt: null, userId: null } }

      );



      io.emit('ticketsReleased', { tickets: ticketNumbers });



      console.log(`Released tickets: ${ticketNumbers.join(', ')}`);

    }

  } catch (error) {

    console.error('Error releasing expired tickets:', error);

  }

});



// -----------------------

// MongoDB Connection

// -----------------------



mongoose

  .connect(process.env.MONGODB_URI, {

    useNewUrlParser: true,

    useUnifiedTopology: true,

  }) // Use the connection string from environment variables

  .then(async () => {

    console.log('Connected to MongoDB Atlas');



    // Initialize tickets if they don't exist

    const initializeTickets = async () => {

      try {

        const count = await Ticket.countDocuments();

        if (count === 0) {

          const tickets = [];

          for (let i = 1; i <= 1000; i++) {

            tickets.push({ ticketNumber: i });

          }

          await Ticket.insertMany(tickets);

          console.log('Tickets initialized');

        } else {

          console.log('Tickets already initialized');

        }

      } catch (error) {

        console.error('Error initializing tickets:', error);

      }

    };



    await initializeTickets();



    // Start the server only after the DB connection and initialization

    server.listen(PORT, () => {

      console.log(`Server is running on port ${PORT}`);

    });

  })

  .catch((error) => {

    console.error('MongoDB connection error:', error);

  });
