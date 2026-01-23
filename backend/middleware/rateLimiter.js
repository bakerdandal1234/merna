const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');

// ============================================
// Rate Limiter للتسجيل والدخول
// ============================================
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: 'تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// ============================================
// Rate Limiter لإعادة تعيين كلمة المرور
// ============================================
const resetPasswordLimiter = rateLimit({
  windowMs: RATE_LIMIT.RESET_PASSWORD_WINDOW_MS,
  max: RATE_LIMIT.RESET_PASSWORD_MAX_REQUESTS,
  message: {
    success: false,
    message: 'تم تجاوز عدد المحاولات. يرجى المحاولة بعد ساعة'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================
// Rate Limiter عام للـ API
// ============================================
const generalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GENERAL_WINDOW_MS,
  max: RATE_LIMIT.GENERAL_MAX_REQUESTS,
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  resetPasswordLimiter,
  generalLimiter
};
