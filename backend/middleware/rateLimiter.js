const rateLimit = require('express-rate-limit');

// Rate limiter للتسجيل والدخول (لمنع Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 200, // 20 محاولات فقط
  message: {
    success: false,
    message: 'تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter لإعادة تعيين كلمة المرور
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 محاولات فقط
  message: {
    success: false,
    message: 'تم تجاوز عدد المحاولات. يرجى المحاولة بعد ساعة'
  }
});

// Rate limiter عام للـ API
const generalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 دقائق
  max: 100, // 100 طلب
  message: {
    success: false,
    message: 'تم تجاوز الحد المسموح من الطلبات'
  }
});

module.exports = {
  authLimiter,
  resetPasswordLimiter,
  generalLimiter
};
