const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse, generateAccessToken } = require('../utils/generateToken');
const {
  sendEmail,
  getVerificationEmailTemplate,
  getResetPasswordEmailTemplate
} = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// @desc    تسجيل مستخدم جديد
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // التحقق من وجود المستخدم
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'هذا الإيميل مسجل بالفعل'
      });
    }

    // إنشاء المستخدم
    const user = await User.create({
      name,
      email,
      password // سيتم تشفيره تلقائياً في الـ pre-save hook
    });

    // إنشاء verification token
    const verificationToken = user.createVerificationToken();
    await user.save({ validateBeforeSave: false });

    // إنشاء رابط التفعيل
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    // إرسال الإيميل
    try {
      await sendEmail({
        email: user.email,
        subject: 'تفعيل حساب Merna',
        html: getVerificationEmailTemplate(verificationUrl, user.name)
      });

      res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من إيميلك لتفعيل الحساب'
      });
    } catch (error) {
      // إذا فشل إرسال الإيميل، نحذف الـ tokens
      user.verificationToken = undefined;
      user.verificationTokenExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email Error:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال إيميل التفعيل'
      });
    }
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في التسجيل',
      error: error.message
    });
  }
};

// @desc    تفعيل الحساب
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    // Hash الـ token المرسل للمقارنة
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // البحث عن المستخدم بالـ token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'رابط التفعيل غير صالح أو منتهي الصلاحية'
      });
    }

    // تفعيل المستخدم
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول'
    });
  } catch (error) {
    console.error('Verify Email Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في التفعيل'
    });
  }
};

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود البيانات
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال الإيميل وكلمة المرور'
      });
    }

    // جلب المستخدم مع الباسورد (select: false بشكل افتراضي)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }
    console.log("req.body:", req.body);
    console.log("hashed password from DB:", user.password);
    // التحقق من الباسورد
    const isPasswordMatch = await user.comparePassword(password);
    console.log("bcrypt.compare result:", isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة'
      });
    }

    // التحقق من تفعيل الحساب
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'يرجى تفعيل حسابك أولاً. تحقق من إيميلك'
      });
    }

    // إرسال الـ tokens
    sendTokenResponse(user, 200, res);
    console.log("sendTokenResponse", sendTokenResponse);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل الدخول'
    });
  }
};

// @desc    تجديد Access Token باستخدام Refresh Token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    console.log('🔄 محاولة تجديد Access Token...');
    console.log('🍪 Cookies:', req.cookies);
    
    // جلب الـ refresh token من الـ cookie
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      console.log('❌ Refresh Token غير موجود في cookies');
      return res.status(401).json({
        success: false,
        message: 'Refresh token غير موجود'
      });
    }
    
    console.log('✅ Refresh Token موجود');

    // التحقق من صحة الـ token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log('✅ Token valid, User ID:', decoded.id);

    // جلب المستخدم
    const user = await User.findById(decoded.id);

    if (!user || !user.isVerified) {
      console.log('❌ مستخدم غير صالح أو غير مفعّل');
      return res.status(401).json({
        success: false,
        message: 'مستخدم غير صالح'
      });
    }

    // إنشاء access token جديد
    const newAccessToken = generateAccessToken(user._id);
    console.log('✅ تم إنشاء Access Token جديد');

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    console.error('Refresh Token Error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى',
        expired: true
      });
    }

    res.status(401).json({
      success: false,
      message: 'Refresh token غير صالح'
    });
  }
};

// @desc    تسجيل الخروج
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // حذف الـ refresh token cookie
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10 ثواني
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'تم تسجيل الخروج بنجاح'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل الخروج'
    });
  }
};

// @desc    نسيت كلمة المرور
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // لأسباب أمنية، نرجع نفس الرسالة حتى لو المستخدم غير موجود
      return res.status(200).json({
        success: true,
        message: 'إذا كان الإيميل موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور'
      });
    }

    // إنشاء reset token
    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // إنشاء رابط إعادة التعيين
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'إعادة تعيين كلمة المرور - Merna',
        html: getResetPasswordEmailTemplate(resetUrl, user.name)
      });

      res.status(200).json({
        success: true,
        message: 'إذا كان الإيميل موجوداً، ستتلقى رسالة لإعادة تعيين كلمة المرور'
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email Error:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في إرسال الإيميل'
      });
    }
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ'
    });
  }
};

// @desc    إعادة تعيين كلمة المرور
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    // Hash الـ token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // البحث عن المستخدم
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية'
      });
    }

    // تعيين كلمة المرور الجديدة
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول'
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تغيير كلمة المرور'
    });
  }
};

// @desc    الحصول على بيانات المستخدم الحالي
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // req.user تم تعيينه في الـ protect middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
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
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ'
    });
  }
};
