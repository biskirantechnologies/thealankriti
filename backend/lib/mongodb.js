const { MongoClient } = require('mongodb');
const { attachDatabasePool } = require('@vercel/functions');

const uri = process.env.MONGODB_URI;
const options = {
  appName: "ukriti-jewells-vercel",
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise = null;

if (uri) {
  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global;

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClient = client;
      globalWithMongo._mongoClientPromise = client.connect();
      
      // Attach the client to ensure proper cleanup on function suspension
      attachDatabasePool(client);
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    
    // Attach the client to ensure proper cleanup on function suspension
    attachDatabasePool(client);
    
    clientPromise = client.connect();
  }
} else {
  throw new Error('MongoDB URI is not defined in environment variables');
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
module.exports = clientPromise;