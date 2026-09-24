const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';
    
    // Try connecting to specified MongoDB URI with short timeout
    mongoose.set('strictQuery', false);
    
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 2500,
      });
      console.log(`[MongoDB] Connected to instance at: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
      return conn;
    } catch (primaryErr) {
      console.warn(`[MongoDB] Primary connection to ${mongoURI} failed (${primaryErr.message}).`);
      console.log('[MongoDB] Spawning in-memory fallback database for seamless zero-config local operation...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      
      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Memory Server] Connected in-memory at: ${memUri}`);
      return conn;
    }
  } catch (err) {
    console.error(`[MongoDB] Critical Database Connection Error: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[MongoDB] Disconnected successfully.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnection:', err);
  }
};

module.exports = { connectDB, disconnectDB };
