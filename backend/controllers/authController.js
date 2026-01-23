const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse, generateAccessToken } = require('../utils/generateToken');
const { sendEmail, getVerificationEmailTemplate, getResetPasswordEmailTemplate } = require('../utils/sendEmail');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, ERRORS } = require('../config/constants');
const jwt = require('jsonwebtoken');

// ============================================
// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
// @access  Public
// ============================================
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new AppError(ERRORS.EMAIL_EXISTS, HTTP_STATUS.BAD_REQUEST));
  }

  // Create user (password will be hashed automatically)
  const user = await User.create({ name, email, password });

  // Generate verification token
  const verificationToken = user.createVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  // Send email
  try {
    await sendEmail({
      email: user.email,
      subject: 'تفعيل حساب Merna',
      html: getVerificationEmailTemplate(verificationUrl, user.name)
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من إيميلك لتفعيل الحساب'
    });
  } catch (error) {
    // If email fails, remove verification tokens
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('حدث خطأ في إرسال إيميل التفعيل', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// ============================================
// @desc    تفعيل الحساب
// @route   GET /api/auth/verify-email/:token
// @access  Public
// ============================================
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  // Hash the token to compare with database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('رابط التفعيل غير صالح أو منتهي الصلاحية', HTTP_STATUS.BAD_REQUEST));
  }

  // Activate user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpire = undefined;
  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول'
  });
});

// ============================================
// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  Public
// ============================================
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError('يرجى إدخال الإيميل وكلمة المرور', HTTP_STATUS.BAD_REQUEST));
  }

  // Use static method for authentication
  const result = await User.findByCredentials(email, password);

  if (!result.success) {
    return next(new AppError(
      result.message,
      result.locked ? HTTP_STATUS.FORBIDDEN : HTTP_STATUS.UNAUTHORIZED
    ));
  }

  // Update last login
  await result.user.updateLastLogin();

  // Send tokens
  sendTokenResponse(result.user, HTTP_STATUS.OK, res);
});

// ============================================
// @desc    تجديد Access Token
// @route   POST /api/auth/refresh-token
// @access  Public
// ============================================
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new AppError('Refresh token غير موجود', HTTP_STATUS.UNAUTHORIZED));
  }

  // Verify refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // Find user
  const user = await User.findById(decoded.id);

  if (!user || !user.isVerified) {
    return next(new AppError(ERRORS.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED));
  }

  // Check if password was changed after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('تم تغيير كلمة المرور. يرجى تسجيل الدخول مرة أخرى', HTTP_STATUS.UNAUTHORIZED));
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user._id, user.role);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    accessToken: newAccessToken
  });
});

// ============================================
// @desc    تسجيل الخروج
// @route   POST /api/auth/logout
// @access  Private
// ============================================
exports.logout = asyncHandler(async (req, res) => {
  // Clear refresh token cookie
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
});

// ============================================
// @desc    نسيت كلمة المرور
// @route   POST /api/auth/forgot-password
// @access  Public
// ============================================
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // For security, always return same message
  const successMessage = 'إذا كان الإيميل موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور';

  if (!user) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: successMessage
    });
  }

  // Generate reset token
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'إعادة تعيين كلمة المرور - Merna',
      html: getResetPasswordEmailTemplate(resetUrl, user.name)
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: successMessage
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('حدث خطأ في إرسال الإيميل', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
});

// ============================================
// @desc    إعادة تعيين كلمة المرور
// @route   PUT /api/auth/reset-password/:token
// @access  Public
// ============================================
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  // Hash token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('رابط إعادة التعيين غير صالح أو منتهي الصلاحية', HTTP_STATUS.BAD_REQUEST));
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول'
  });
});

// ============================================
// @desc    الحصول على بيانات المستخدم
// @route   GET /api/auth/me
// @access  Private
// ============================================
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
  });
});
