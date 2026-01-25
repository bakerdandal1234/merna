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
    SERVER_ERROR: 'حدث خطأ في الخادم'
  }
};
