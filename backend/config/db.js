const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let usesMockDB = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Using mock in-memory database for testing');
    console.warn('📖 To use real MongoDB: https://www.mongodb.com/cloud/atlas');

    try {
      const mongoServer = await MongoMemoryServer.create();
      const conn = await mongoose.connect(mongoServer.getUri());
      usesMockDB = true;
      console.log(`🧪 In-memory MongoDB Connected: ${conn.connection.host}`);
      console.log('🚀 Server running with mock database (data will be lost on restart)\n');
    } catch (mockError) {
      console.error(`❌ Failed to start mock database: ${mockError.message}`);
      process.exit(1);
    }
  }
};

module.exports = { connectDB, usesMockDB: () => usesMockDB };
