// ============================================
// Server Configuration - Improved & Production-Ready
// ============================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// ============================================
// Initialize Express App
// ============================================
const app = express();

// Trust proxy for production environments (Render, Heroku, etc.)
app.set('trust proxy', 1);

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://baker12.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development only
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
// Request Logging (Development Only)
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Import Routes
// ============================================
const authRoutes = require('./routes/authRoutes');
const sentenceRoutes = require('./routes/sentenceRoutes');

// ============================================
// Health Check Endpoint
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running! 🚀',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// Root Endpoint
// ============================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎓 مرحبًا بك في API لتعلم اللغة الألمانية مع نظام SM-2!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      sentences: '/api/sentences',
      stats: '/api/stats',
      health: '/health'
    }
  });
});

// ============================================
// Apply General Rate Limiting (Optional - Uncomment to Enable)
// ============================================
// app.use('/api', generalLimiter);

// ============================================
// Mount Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/sentences', sentenceRoutes);
app.use('/api/stats', sentenceRoutes);

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
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 Server Running on Port ${PORT}      ║
  ║   🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(17)}║
  ║   🔐 Authentication: Enabled           ║
  ║   🛡️  Authorization: Active            ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:${PORT}/api    ║
  ╚════════════════════════════════════════╝
      `);
    });

    // ============================================
    // Graceful Shutdown
    // ============================================
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================
// Handle Unhandled Rejections & Exceptions
// ============================================
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Start the server
startServer();

module.exports = app;
