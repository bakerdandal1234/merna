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
    ERROR_MESSAGE: 'Das Passwort muss mindestens 8 Zeichen lang sein und eine Kombination aus Kleinbuchstaben, Großbuchstaben, Zahlen und Sonderzeichen enthalten'
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
    INVALID_CREDENTIALS: 'Ungültige Anmeldedaten',
    ACCOUNT_NOT_VERIFIED: 'Bitte verifizieren Sie Ihr Konto zuerst. Überprüfen Sie Ihre E-Mail',
    UNAUTHORIZED: 'Nicht autorisiert. Bitte melden Sie sich an',
    TOKEN_EXPIRED: 'Die Sitzung ist abgelaufen. Bitte melden Sie sich erneut an',
    INVALID_TOKEN: 'Ungültiger Token',
    EMAIL_EXISTS: 'Diese E-Mail-Adresse ist bereits registriert',
    USER_NOT_FOUND: 'Der Benutzer wurde nicht gefunden',
    FORBIDDEN: 'Sie haben keine Berechtigung, auf diese Ressource zuzugreifen',
    NOT_OWNER: '🚫 Nicht erlaubt! Sie können nur Sätze bearbeiten/löschen, die Sie selbst hinzugefügt haben',
    SENTENCE_EXISTS: 'Der Satz existiert bereits',
    SENTENCE_NOT_FOUND: 'Der Satz wurde nicht gefunden',
    INVALID_ID: 'Ungültige ID',
    SERVER_ERROR: 'Ein Fehler ist auf dem Server aufgetreten. '
  }
};
