const mongoose = require('mongoose');
// Mongoose library ko import karti hai.

let usesMockDB = false;

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/auth_db';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    // MongoDB connection string
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️  Using mock in-memory database for testing');
    console.warn('📖 To use real MongoDB: https://www.mongodb.com/cloud/atlas');
    console.log('🚀 Server running with mock database (data will be lost on restart)\n');
    usesMockDB = true;
  }
};

module.exports = { connectDB, usesMockDB: () => usesMockDB };
