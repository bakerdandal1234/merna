const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware للتحقق من Access Token
const protect = async (req, res, next) => {
  let token;

  // التحقق من وجود Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // إذا لم يكن هناك token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح. يرجى تسجيل الدخول'
    });
  }

  try {
    // التحقق من صحة الـ token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // جلب المستخدم (بدون الباسورد)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // التحقق من تفعيل الحساب
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'يرجى تفعيل حسابك أولاً'
      });
    }

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token غير صالح'
    });
  }
};

// Middleware للتحقق من الصلاحيات (Admin only)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'لا تملك الصلاحيات للوصول لهذا المورد'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
