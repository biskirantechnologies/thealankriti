const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Database connection function
const connectDB = async () => {
  try {
    if (mongoose.connections[0].readyState === 1) {
      console.log('✅ MongoDB already connected');
      return;
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
};

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://ukriti-jewells.vercel.app',
    'https://ukriti-jewells-git-main-oracle-brain.vercel.app',
    'https://ukriti-jewells-h20a98oim-oracle-brain.vercel.app',
    'https://thealankriti.com',
    'https://www.thealankriti.com',
    /\.vercel\.app$/,
    /\.oracle-brain\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database connection
let dbInitialized = false;

const initializeDB = async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await connectDB();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: error.message 
      });
    }
  }
  next();
};

app.use(initializeDB);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connections[0].readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbStatus,
    timestamp: new Date().toISOString(),
    message: dbStatus === 'connected' ? 'Backend Online' : 'Backend Offline'
  });
});

// API Health check endpoint  
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connections[0].readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbStatus,
    timestamp: new Date().toISOString(),
    message: dbStatus === 'connected' ? 'Backend Online' : 'Backend Offline'
  });
});

// Basic API routes for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Ukriti Jewells API Server',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Admin authentication endpoint
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple admin authentication (you can enhance this with proper auth later)
  const adminEmail = process.env.ADMIN_EMAIL || 'bewithu.aj@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (email === adminEmail && password === adminPassword) {
    // Generate a simple token (in production, use proper JWT)
    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    
    res.json({
      success: true,
      data: {
        user: {
          id: 'admin',
          email: adminEmail,
          role: 'admin',
          name: 'Administrator'
        },
        token: token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid admin credentials'
    });
  }
});

// Admin dashboard data endpoint
app.get('/api/admin/dashboard', (req, res) => {
  // Mock dashboard data (you can enhance this with real data later)
  res.json({
    success: true,
    data: {
      stats: {
        totalOrders: 156,
        totalProducts: 24,
        totalUsers: 89,
        revenue: 45600
      },
      recentOrders: [],
      lowStock: []
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Placeholder for other routes - will implement step by step
app.use('/api/*', (req, res) => {
  res.json({ 
    message: 'API endpoint under development',
    endpoint: req.originalUrl,
    method: req.method
  });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;