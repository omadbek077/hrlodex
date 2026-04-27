const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-lodex');
    console.log(`MongoDB ulandi: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB ulanishda xato:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
