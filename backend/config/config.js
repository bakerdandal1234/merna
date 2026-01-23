// ============================================
// Centralized Configuration Management
// ============================================

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  
  // Database
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      w: 'majority',
      retryWrites: true,
      autoIndex: process.env.NODE_ENV === 'development',
    }
  },

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
    cookieExpireDays: parseInt(process.env.COOKIE_EXPIRE, 10) || 7
  },

  // Email
  email: {
    fromAddress: process.env.EMAIL_FROM_ADDRESS,
    fromName: process.env.EMAIL_FROM_NAME || 'Merna App',
    brevoApiKey: process.env.BREVO_API_KEY,
    verificationTokenExpiryHours: 24,
    resetPasswordTokenExpiryMinutes: 10
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // CORS
  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://baker12.netlify.app'
    ]
  },

  // Security
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Validation
  validate() {
    const required = [
      'MONGODB_URI',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'EMAIL_FROM_ADDRESS',
      'BREVO_API_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `❌ Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file.'
      );
    }

    // Validate JWT secrets strength
    if (this.jwt.accessSecret.length < 32) {
      throw new Error('❌ JWT_ACCESS_SECRET must be at least 32 characters');
    }
    if (this.jwt.refreshSecret.length < 32) {
      throw new Error('❌ JWT_REFRESH_SECRET must be at least 32 characters');
    }

    console.log('✅ Configuration validated successfully');
  }
};

module.exports = config;
