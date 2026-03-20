const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');

// ============================================
// Rate Limiter: Login & Registration
// ============================================
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Zu viele Versuche. Bitte versuchen Sie es in 15 Minuten erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// ============================================
// Rate Limiter: Password Reset
// ============================================
const resetPasswordLimiter = rateLimit({
  windowMs: RATE_LIMIT.RESET_PASSWORD_WINDOW_MS,
  max: RATE_LIMIT.RESET_PASSWORD_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Zu viele Versuche. Bitte versuchen Sie es in einer Stunde erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// Rate Limiter: General API
// ============================================
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS,
  max: RATE_LIMIT.GENERAL_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Anfragelimit überschritten. Bitte versuchen Sie es später erneut.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  resetPasswordLimiter,
  generalLimiter
};
