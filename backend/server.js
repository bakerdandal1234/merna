// ============================================
// MERN Authentication Starter Template
// Server Configuration - Production-Ready & Optimized
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { connectDB, closeDB } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { Logger, requestLogger } = require('./utils/logger');
const config = require('./config/config');

// ============================================
// Validate Configuration
// ============================================
try {
  config.validate();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

// ============================================
// Initialize Express App
// ============================================
const app = express();

// Trust proxy for production environments (Render, Heroku, etc.)
app.set('trust proxy', 1);

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// ============================================
// Security Middleware
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ============================================
// CORS Configuration
// ============================================
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin in development only
    if (!origin && config.isDevelopment) {
      return callback(null, true);
    }

    if (config.cors.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      Logger.warn('CORS blocked request', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// ============================================
// Body Parsing Middleware
// ============================================
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================
// Cookie Parser
// ============================================
app.use(cookieParser());

// ============================================
// Request Logging
// ============================================
if (config.isDevelopment) {
  app.use(requestLogger);
}

// ============================================
// Import Routes
// ============================================
const authRoutes = require('./routes/authRoutes');

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
  const healthData = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.env,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    },
    database: {
      connected: require('mongoose').connection.readyState === 1
    }
  };

  res.status(200).json(healthData);
});

// ============================================
// Root Endpoint
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Welcome to MERN Authentication Starter Template',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/health'
    }
  });
});

// ============================================
// Apply General Rate Limiting (Optional - Uncomment to Enable)
// ============================================
// app.use('/api', generalLimiter);

// ============================================
// Mount Routes - Authentication Only
// ============================================
app.use('/api/auth', authRoutes);

// ============================================
// 404 Handler
// ============================================
app.use(notFoundHandler);

// ============================================
// Global Error Handler (Must be last)
// ============================================
app.use(errorHandler);

// ============================================
// Database Connection & Server Start
// ============================================
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const server = app.listen(config.port, () => {
      Logger.info('Server Started', {
        port: config.port,
        environment: config.env,
        nodeVersion: process.version,
        pid: process.pid
      });

      console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 Server Running on Port ${config.port}      ║
  ║   🌍 Environment: ${config.env.padEnd(17)}║
  ║   🔐 Authentication: Enabled           ║
  ║   🛡️  Authorization: Active            ║
  ║   🔗 API: http://localhost:${config.port}/api    ║
  ╚════════════════════════════════════════╝
      `);
    });

    // ============================================
    // Graceful Shutdown
    // ============================================
    const gracefulShutdown = async (signal) => {
      Logger.info(`${signal} received - initiating graceful shutdown`);
      
      server.close(async () => {
        Logger.info('HTTP server closed');
        
        try {
          await closeDB();
          Logger.info('All resources cleaned up successfully');
          process.exit(0);
        } catch (error) {
          Logger.error('Error during shutdown', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        Logger.error('Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    Logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// ============================================
// Handle Unhandled Rejections & Exceptions
// ============================================
process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION', err);
  if (config.isProduction) {
    Logger.error('Shutting down due to unhandled rejection');
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION', err);
  Logger.error('Shutting down due to uncaught exception');
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;
