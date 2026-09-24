const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

  mongoose.set('strictQuery', false);

  // In production (e.g. on Render), strictly connect to MongoDB Atlas
  if (isProduction) {
    if (!mongoURI) {
      console.error('================================================================');
      console.error('[MongoDB] Critical Error: MONGO_URI (or MONGODB_URI) is not defined in production.');
      console.error('[MongoDB] Please set MONGO_URI in your Render service environment variables.');
      console.error('================================================================');
      process.exit(1);
    }

    try {
      console.log('[MongoDB] Connecting to production MongoDB Atlas database...');
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[MongoDB] Successfully connected to Atlas instance at: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (prodErr) {
      console.error(`[MongoDB] Critical Production Connection Error: ${prodErr.message}`);
      process.exit(1);
    }
  }

  // In development / local testing:
  const devURI = mongoURI || 'mongodb://127.0.0.1:27017/campus_lost_found';

  try {
    const conn = await mongoose.connect(devURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to instance at: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    return conn;
  } catch (primaryErr) {
    console.warn(`[MongoDB] Primary connection to ${devURI} failed (${primaryErr.message}).`);
    console.log('[MongoDB] Attempting in-memory fallback database for local development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();

      const conn = await mongoose.connect(memUri);
      console.log(`[MongoDB Memory Server] Connected in-memory at: ${memUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] In-memory database startup error: ${memErr.message}`);
      console.error('[MongoDB] Please ensure MONGO_URI is set in your .env file or local MongoDB is running.');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
      mongod = null;
    }
    console.log('[MongoDB] Disconnected successfully.');
  } catch (err) {
    console.error('[MongoDB] Error during disconnection:', err);
  }
};

module.exports = { connectDB, disconnectDB };

