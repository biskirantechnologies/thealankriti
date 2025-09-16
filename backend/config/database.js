const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log(`🔗 Connection string: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📊 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📋 Database Name: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected');
    });

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
    
    // Don't exit the process in development, allow server to start without DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('⚠️ Running in development mode without database connection');
      console.log('📝 To fix this issue:');
      console.log('   1. Check your MongoDB Atlas IP whitelist');
      console.log('   2. Add your current IP address to the whitelist');
      console.log('   3. Or add 0.0.0.0/0 for development (not recommended for production)');
    }
  }
};

module.exports = connectDB;
