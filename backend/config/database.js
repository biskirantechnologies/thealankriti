const mongoose = require('mongoose');
const { attachDatabasePool } = require('@vercel/functions');

const connectDB = async () => {
  try {
    // Connection options optimized for both local and serverless environments
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1,  // Maintain at least 1 socket connection
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false // Disable mongoose buffering
      // Removed deprecated bufferMaxEntries option
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Attach the database pool for proper cleanup on function suspension (only in Vercel environment)
    if (typeof attachDatabasePool === 'function') {
      attachDatabasePool(conn.connection.getClient());
    }

    console.log(`📊 MongoDB Connected (Optimized): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error; // Don't exit process in serverless environment
  }
};

module.exports = connectDB;
