const express = require('express');
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  emailValidation,
  passwordValidation,
  validateRequest
} = require('../utils/validation');

const router = express.Router();

// ============================================
// Public Routes
// ============================================

// Register new user
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validateRequest,
  register
);

// Verify email
router.get('/verify-email/:token', verifyEmail);

// Login
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validateRequest,
  login
);

// Refresh access token
router.post('/refresh-token', refreshToken);

// Forgot password
router.post(
  '/forgot-password',
  resetPasswordLimiter,
  emailValidation,
  validateRequest,
  forgotPassword
);

// Reset password
router.put(
  '/reset-password/:token',
  passwordValidation,
  validateRequest,
  resetPassword
);

// ============================================
// Protected Routes
// ============================================

// Get current user profile
router.get('/me', protect, getMe);

// Logout
router.post('/logout', protect, logout);

module.exports = router;
