const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./config/db');

const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB (or auto in-memory fallback)
    await connectDB();

    // Auto-seed if database is fresh / empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Bootstrapping realistic campus seed data...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        // Run seed function directly
        const seedModule = require('./seed/seedDataDirect');
        if (seedModule?.seedDataDirect) {
          await seedModule.seedDataDirect();
        }
      } catch (seedErr) {
        console.warn('[Server] Auto-seed notice:', seedErr.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` Campus Lost & Found Backend Server`);
      console.log(` Running on port: http://localhost:${PORT}`);
      console.log(` API Endpoint:    http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error(`Failed to start server:`, err);
    process.exit(1);
  }
};

startServer();
