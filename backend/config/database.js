// ============================================
// Database Configuration - Enhanced
// ============================================
const mongoose = require('mongoose');
const config = require('./config');
const { Logger } = require('../utils/logger');

const connectDB = async () => {
  try {
    const options = config.database.options;

    const conn = await mongoose.connect(config.database.uri, options);

    Logger.info('MongoDB Connected', {
      host: conn.connection.host,
      database: conn.connection.name,
      poolSize: options.maxPoolSize
    });

    // Enhanced event listeners
    mongoose.connection.on('error', (err) => {
      Logger.error('MongoDB connection error', err);
    });

    mongoose.connection.on('disconnected', () => {
      Logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      Logger.info('MongoDB reconnected successfully');
    });

    // Graceful shutdown handlers moved to server.js for centralization

  } catch (error) {
    Logger.error('MongoDB connection failed', error);
    throw error; // Let the caller handle the error
  }
};

// ============================================
// Close Database Connection
// ============================================
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    Logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    Logger.error('Error closing MongoDB connection', error);
    throw error;
  }
};

module.exports = { connectDB, closeDB };
