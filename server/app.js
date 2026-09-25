const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const lostItemRoutes = require('./routes/lostItemRoutes');
const foundItemRoutes = require('./routes/foundItemRoutes');
const claimRoutes = require('./routes/claimRoutes');
const matchRoutes = require('./routes/matchRoutes');
const handoverRoutes = require('./routes/handoverRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://campus-lost-found-system-1-82js.onrender.com'
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (server-to-server, curl, Postman, health checks)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow explicitly configured origins
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow all Vercel preview and production deployments
    if (
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('vercel.app') ||
      cleanOrigin.includes('vercel.com')
    ) {
      return callback(null, true);
    }

    // Allow all localhost and 127.0.0.1 variations
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow Render service domains
    if (cleanOrigin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    // Safe fallback allowing origin with credentials support
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static directory for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root API welcome endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Lost & Found Platform API Server is active and running',
    version: '1.0.0',
    documentation: {
      health: '/api/health',
      clientApp: process.env.CLIENT_URL || 'http://localhost:5173',
      endpoints: [
        '/api/auth',
        '/api/lost-items',
        '/api/found-items',
        '/api/claims',
        '/api/matches',
        '/api/handovers',
        '/api/notifications',
        '/api/admin'
      ]
    }
  });
});

// Health check endpoint with Live Database Status
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const stateMap = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  
  let stats = {};
  if (dbState === 1) {
    try {
      const User = require('./models/User');
      const FoundItem = require('./models/FoundItem');
      const LostItem = require('./models/LostItem');
      stats = {
        usersCount: await User.countDocuments(),
        foundItemsCount: await FoundItem.countDocuments(),
        lostItemsCount: await LostItem.countDocuments()
      };
    } catch (e) {
      stats.error = e.message;
    }
  }

  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      status: stateMap[dbState] || 'Unknown',
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'campus_lost_found',
      isAtlas: mongoose.connection.host?.includes('mongodb.net') || false,
      records: stats
    },
    service: 'Campus Lost & Found Verified Item Recovery Platform API'
  });
});

// API Routes mount
app.use('/api/auth', authRoutes);
app.use('/api/lost-items', lostItemRoutes);
app.use('/api/found-items', foundItemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/handovers', handoverRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    error: 'NOT_FOUND'
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
