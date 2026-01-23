// ============================================
// Constants and Configuration
// ============================================

module.exports = {
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    COOKIE_EXPIRY_DAYS: 7
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
    ERROR_MESSAGE: 'كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص'
  },

  // Email Configuration
  EMAIL: {
    VERIFICATION_TOKEN_EXPIRY_HOURS: 24,
    RESET_PASSWORD_TOKEN_EXPIRY_MINUTES: 10
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
  },

  // SM-2 Algorithm
  SM2: {
    DEFAULT_INTERVAL: 0,
    DEFAULT_EASE_FACTOR: 2.5,
    DEFAULT_REPETITIONS: 0,
    MIN_EASE_FACTOR: 1.3,
    MAX_EASE_FACTOR: 3.0,
    MAX_INTERVAL_DAYS: 365,
    MIN_INTERVAL_DAYS: 1,
    IMMEDIATE_REVIEW_MINUTES: 10
  },

  // Review Levels
  REVIEW_LEVELS: {
    NEW: { threshold: 0, label: 'new', emoji: '🆕', color: '#6366f1' },
    LEARNING: { threshold: 1, label: 'learning', emoji: '📚', color: '#8b5cf6' },
    HARD: { threshold: 4, label: 'hard', emoji: '😅', color: '#f59e0b' },
    GOOD: { threshold: 10, label: 'good', emoji: '👍', color: '#10b981' },
    EXCELLENT: { threshold: 30, label: 'excellent', emoji: '⭐', color: '#3b82f6' },
    MASTERED: { threshold: 365, label: 'mastered', emoji: '🏆', color: '#ef4444' }
  },

  // Rate Limiting
  RATE_LIMIT: {
    AUTH_WINDOW_MS: 15 * 60 * 1000,
    AUTH_MAX_REQUESTS: 200,
    RESET_PASSWORD_WINDOW_MS: 60 * 60 * 1000,
    RESET_PASSWORD_MAX_REQUESTS: 3,
    GENERAL_WINDOW_MS: 10 * 60 * 1000,
    GENERAL_MAX_REQUESTS: 100
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },

  // Error Messages
  ERRORS: {
    INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
    ACCOUNT_NOT_VERIFIED: 'يرجى تفعيل حسابك أولاً. تحقق من إيميلك',
    UNAUTHORIZED: 'غير مصرح. يرجى تسجيل الدخول',
    TOKEN_EXPIRED: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
    INVALID_TOKEN: 'Token غير صالح',
    EMAIL_EXISTS: 'هذا الإيميل مسجل بالفعل',
    USER_NOT_FOUND: 'المستخدم غير موجود',
    FORBIDDEN: 'لا تملك الصلاحيات للوصول لهذا المورد',
    NOT_OWNER: '🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت',
    SENTENCE_EXISTS: 'الجملة موجودة مسبقًا',
    SENTENCE_NOT_FOUND: 'الجملة غير موجودة',
    INVALID_ID: 'معرّف غير صالح',
    SERVER_ERROR: 'حدث خطأ في الخادم'
  }
};
