const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, AppError } = require('./errorHandler');
const { HTTP_STATUS, ERRORS } = require('../config/constants');

// ============================================
// Middleware للتحقق من Access Token
// ============================================
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(ERRORS.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED));
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

  // Get user (exclude password)
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    return next(new AppError(ERRORS.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if account is verified
  if (!user.isVerified) {
    return next(new AppError(ERRORS.ACCOUNT_NOT_VERIFIED, HTTP_STATUS.FORBIDDEN));
  }

  // Attach user to request
  req.user = user;
  next();
});

// ============================================
// Middleware للتحقق من الصلاحيات
// ============================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(ERRORS.FORBIDDEN, HTTP_STATUS.FORBIDDEN));
    }
    next();
  };
};

module.exports = { protect, authorize };
