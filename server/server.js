const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./config/db');

const User = require('./models/User');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  try {
    // Connect to MongoDB (strictly requires MONGO_URI in production)
    await connectDB();

    // Auto-seed if database is fresh / empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Bootstrapping realistic campus seed data...');
      try {
        const seedModule = require('./seed/seedDataDirect');
        if (seedModule?.seedDataDirect) {
          await seedModule.seedDataDirect();
        }
      } catch (seedErr) {
        console.warn('[Server] Auto-seed notice:', seedErr.message);
      }
    }

    app.listen(PORT, HOST, () => {
      console.log(`====================================================`);
      console.log(` Campus Lost & Found Backend Server`);
      console.log(` Running on:      http://${HOST}:${PORT}`);
      console.log(` Port:            ${PORT}`);
      console.log(` Environment:     ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Health:      http://${HOST}:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`[Server] Failed to start server:`, err);
    process.exit(1);
  }
};

startServer();
