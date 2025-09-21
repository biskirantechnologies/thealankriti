// keepalive.js - Prevents Render service from sleeping
const https = require('https');

const BACKEND_URL = 'https://thealankriti-backend.onrender.com/health';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes (before 15-minute sleep)

function pingBackend() {
  https.get(BACKEND_URL, (res) => {
    console.log(`✅ Keepalive ping successful: ${res.statusCode} at ${new Date().toISOString()}`);
  }).on('error', (err) => {
    console.error(`❌ Keepalive ping failed: ${err.message} at ${new Date().toISOString()}`);
  });
}

// Only run keepalive in production
if (process.env.NODE_ENV === 'production') {
  console.log('🔄 Starting keepalive service...');
  
  // Initial ping after 1 minute
  setTimeout(pingBackend, 60000);
  
  // Regular pings every 14 minutes
  setInterval(pingBackend, PING_INTERVAL);
} else {
  console.log('🏠 Keepalive disabled in development mode');
}

module.exports = { pingBackend };