const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

exports.sendTokenResponse = (user, statusCode, res) => {
  try {
    const accessToken = this.generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // ✅ إعدادات صحيحة للتطوير
    const cookieOptions = {
      httpOnly: true, // ✅ يمنع JavaScript من الوصول (أمن ضد XSS)
      secure: true,      // Render = HTTPS
      sameSite: 'none',  // Cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 أيام
      path: '/' // ✅ متاح لكل المسارات
    };

    // ✅ تحقق من وجود الـ secret
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET غير مضبوط في .env');
    }

    console.log('🍪 إرسال Refresh Token كـ Cookie');
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(statusCode).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ خطأ في إرسال الـ Tokens:', error.message);
    throw error;
  }
};
