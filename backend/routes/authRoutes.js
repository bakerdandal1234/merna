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
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('الاسم مطلوب')
    .isLength({ min: 2, max: 50 }).withMessage('الاسم يجب أن يكون بين 2 و 50 حرفاً'),
  body('email')
    .trim()
    .notEmpty().withMessage('الإيميل مطلوب')
    .isEmail().withMessage('يرجى إدخال إيميل صالح')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('الإيميل مطلوب')
    .isEmail().withMessage('يرجى إدخال إيميل صالح'),
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
];

const emailValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('الإيميل مطلوب')
    .isEmail().withMessage('يرجى إدخال إيميل صالح')
];

const passwordValidation = [
  body('password')
    .notEmpty().withMessage('كلمة المرور مطلوبة')
    .isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .withMessage('كلمة المرور يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، ورمز خاص')
];

// Routes
router.post('/register', authLimiter, registerValidation, validateRequest, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, loginValidation, validateRequest, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', resetPasswordLimiter, emailValidation, validateRequest, forgotPassword);
router.put('/reset-password/:token', passwordValidation, validateRequest, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
