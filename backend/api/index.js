const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('../config/database');

// Load environment variables from multiple sources
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = express();

// Initialize database connection with error handling
let dbConnection = null;
const initializeDB = async () => {
  if (!dbConnection) {
    try {
      dbConnection = await connectDB();
      console.log('✅ Database initialized successfully');
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
    }
  }
  return dbConnection;
};

// CORS configuration - Updated with current domains
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://ukriti-jewells.vercel.app',
    'https://ukriti-jewells-git-main-aashis-jhas-projects.vercel.app',
    'https://ukriti-jewells-ib3c.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database initialization middleware
app.use(async (req, res, next) => {
  try {
    await initializeDB();
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(503).json({ 
      message: 'Database connection unavailable',
      status: 'error'
    });
  }
});

// Session middleware
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET || 'The Alankriti-jewells-session-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/products', require('../routes/products'));
app.use('/api/orders', require('../routes/orders'));
app.use('/api/admin', require('../routes/admin'));

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = dbConnection ? 'connected' : 'disconnected';
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'The Alankriti API',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'The Alankriti API',
      database: 'error',
      error: error.message
    });
  }
});

// API health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = dbConnection ? 'connected' : 'disconnected';
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'The Alankriti API',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'The Alankriti API',
      database: 'error',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
