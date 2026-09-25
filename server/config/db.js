const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
  const rawURI = (
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL ||
    ''
  ).trim().replace(/^["']|["']$/g, '');

  const mongoURI = rawURI || null;

  mongoose.set('strictQuery', false);

  // In production (Render, Cloud VPS, etc.), strictly require MONGO_URI / MONGODB_URI (e.g. MongoDB Atlas)
  if (isProduction) {
    if (!mongoURI) {
      console.error('================================================================');
      console.error('[MongoDB] Critical Error: MONGO_URI environment variable is missing in Render.');
      console.error('[MongoDB] Detected environment keys: ' + Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', '));
      console.error('[MongoDB] Please configure MONGO_URI in your Render Environment Variables dashboard.');
      console.error('[MongoDB] Expected format: mongodb+srv://<username>:<password>@<cluster-url>/<database-name>');
      console.error('================================================================');
      process.exit(1);
    }

    try {
      console.log('[MongoDB] Connecting to production MongoDB Atlas database...');
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[MongoDB] Successfully connected to Atlas database: ${conn.connection.name}`);
      return conn;
    } catch (prodErr) {
      console.error('================================================================');
      console.error(`[MongoDB] Critical Production Connection Error: ${prodErr.message}`);
      console.error('[MongoDB] Please verify that:');
      console.error('  1. MongoDB Atlas Network Access allows connections from anywhere (0.0.0.0/0).');
      console.error('  2. Database user credentials and database name in MONGO_URI are correct.');
      console.error('================================================================');
      process.exit(1);
    }
  }

  // If a URI is explicitly defined in non-production (e.g. Atlas URI in .env file)
  if (mongoURI) {
    try {
      console.log('[MongoDB] Connecting to database using environment variable URI...');
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[MongoDB] Successfully connected to database: ${conn.connection.name}`);
      return conn;
    } catch (uriErr) {
      console.error(`[MongoDB] Connection failed using provided MONGO_URI: ${uriErr.message}`);
      process.exit(1);
    }
  }

  // Local development fallback: Only attempted when NO mongoURI is provided and NOT in production
  const localURI = 'mongodb://127.0.0.1:27017/campus_lost_found';
  try {
    console.log('[MongoDB] Attempting connection to local MongoDB at 127.0.0.1:27017...');
    const conn = await mongoose.connect(localURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected to local MongoDB database: ${conn.connection.name}`);
    return conn;
  } catch (localErr) {
    console.warn(`[MongoDB] Local MongoDB connection failed (${localErr.message}).`);
    console.log('[MongoDB] Attempting in-memory fallback database for local development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();

      const conn = await mongoose.connect(memUri);
      console.log('[MongoDB Memory Server] Connected to in-memory database.');
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] In-memory database startup error: ${memErr.message}`);
      console.error('[MongoDB] Please set MONGO_URI in your .env file or ensure local MongoDB is running.');
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

