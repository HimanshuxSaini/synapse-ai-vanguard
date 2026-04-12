const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('../server/routes/auth');
const sessionRoutes = require('../server/routes/sessionRoutes');

const app = express();

// Security Headers
app.use(helmet());

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Access Denied: Neural pattern limit exceeded. Please wait 15 minutes." }
});
app.use('/api/', limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);

// Global Error Handling
app.use((err, req, res, next) => {
  console.error('SYSTEM ERROR LOG:', err.message);
  res.status(500).json({ error: 'Sentinel Error: Something went wrong in the Neural Matrix.' });
});

// MongoDB Connection — cache connection across warm invocations
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('--- SYNAPSE DATA LINK ESTABLISHED ---');
  } catch (err) {
    console.error('--- NEURAL DATA SYNC FAILED:', err);
    throw err;
  }
};

// Wrap with DB connection for serverless
module.exports = async (req, res) => {
  console.log(`--- INCOMING REQUEST: ${req.method} ${req.url} ---`);
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('--- SERVERLESS WRAPPER ERROR:', err);
    res.status(500).json({ 
      error: 'Sentinel Error: Matrix connection failed.',
      details: err.message
    });
  }
};
