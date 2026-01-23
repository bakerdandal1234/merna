// ============================================
// Input Validation Utilities
// ============================================
const { body, param, query, validationResult } = require('express-validator');
const { PASSWORD } = require('../config/constants');

// ============================================
// Validation Error Handler
// ============================================
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// ============================================
// Common Validation Rules
// ============================================

// Email validation
const emailValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('الإيميل مطلوب')
    .isEmail().withMessage('يرجى إدخال إيميل صالح')
    .normalizeEmail()
];

// Password validation
const passwordValidation = [
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
    .isLength({ min: PASSWORD.MIN_LENGTH }).withMessage(`كلمة المرور يجب أن تكون ${PASSWORD.MIN_LENGTH} أحرف على الأقل`)
    .matches(PASSWORD.REGEX).withMessage(PASSWORD.ERROR_MESSAGE)
];

// Name validation
const nameValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 50 }).withMessage('الاسم يجب أن يكون بين 2 و 50 حرفاً')
];

// ============================================
// Auth Validations
// ============================================

const registerValidation = [
  ...nameValidation,
  ...emailValidation,
  ...passwordValidation
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('الإيميل مطلوب')
    .isEmail().withMessage('يرجى إدخال إيميل صالح'),
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
];

// ============================================
// Sentence Validations
// ============================================

const sentenceValidation = [
  body('german')
    .trim()
    .notEmpty().withMessage('الجملة الألمانية مطلوبة')
    .isLength({ min: 1, max: 500 }).withMessage('الجملة يجب أن تكون بين 1 و 500 حرف'),
  body('arabic')
    .trim()
    .notEmpty().withMessage('الترجمة العربية مطلوبة')
    .isLength({ min: 1, max: 500 }).withMessage('الترجمة يجب أن تكون بين 1 و 500 حرف')
];

const reviewValidation = [
  body('quality')
    .isInt({ min: 0, max: 3 }).withMessage('التقييم يجب أن يكون بين 0 و 3')
];

// ============================================
// ID Validation
// ============================================

const mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('معرّف غير صالح')
];

// ============================================
// Pagination Validation
// ============================================

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('رقم الصفحة يجب أن يكون رقماً موجباً'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('الحد يجب أن يكون بين 1 و 100')
];

module.exports = {
  validateRequest,
  emailValidation,
  passwordValidation,
  nameValidation,
  registerValidation,
  loginValidation,
  sentenceValidation,
  reviewValidation,
  mongoIdValidation,
  paginationValidation
};
