const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API routes (your existing routes go here)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'The Alankriti API is running',
    timestamp: new Date().toISOString()
  });
});

// Add your existing API routes here
// app.use('/api/products', require('./routes/products'));
// app.use('/api/auth', require('./routes/auth'));
// etc.

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 The Alankriti server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Server: http://localhost:${PORT}`);
});
