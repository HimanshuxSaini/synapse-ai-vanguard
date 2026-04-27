const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/,
  /\.netlify\.app$/
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}. Add it to FRONTEND_URL in Render.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);

// Health Check
app.get('/', (req, res) => res.json({ status: 'Synapse AI Neural Link Active', timestamp: new Date() }));
app.get('/api', (req, res) => res.json({ message: 'Vanguard API Gateway Operational' }));

// Global Error Handling
app.use((err, req, res, next) => {
  console.error('SYSTEM ERROR LOG:', err.message);
  res.status(500).json({ error: 'Sentinel Error: Something went wrong in the Neural Matrix.' });
});

// MongoDB Connection & Server Start
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('--- SYNAPSE DATA LINK ESTABLISHED ---');
    app.listen(PORT, () => console.log(`--- VANGUARD SERVER RUNNING ON PORT ${PORT} ---`));
  })
  .catch(err => console.error('--- NEURAL DATA SYNC FAILED:', err));
