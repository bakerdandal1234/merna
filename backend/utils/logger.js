// ============================================
// Logger Utility
// ============================================

const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

class Logger {
  static log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  static info(message, meta = {}) {
    this.log(LogLevel.INFO, message, meta);
  }

  static warn(message, meta = {}) {
    this.log(LogLevel.WARN, message, meta);
  }

  static error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        ...error
      },
      ...meta
    } : meta;

    this.log(LogLevel.ERROR, message, errorMeta);
  }

  static debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  static http(req, res, duration) {
    const logEntry = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip
    };

    if (res.statusCode >= 400) {
      this.warn('HTTP Request Failed', logEntry);
    } else {
      this.info('HTTP Request', logEntry);
    }
  }
}

// ============================================
// Request Logger Middleware
// ============================================
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.http(req, res, duration);
  });

  next();
};

module.exports = { Logger, requestLogger };
