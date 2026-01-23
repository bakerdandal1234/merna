const jwt = require('jsonwebtoken');
const { JWT, HTTP_STATUS } = require('../config/constants');

// ============================================
// Generate Access Token
// ============================================
const generateAccessToken = (userId, role) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET غير موجود في ملف .env');
  }

  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || JWT.ACCESS_TOKEN_EXPIRY }
  );
};

// ============================================
// Generate Refresh Token
// ============================================
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET غير موجود في ملف .env');
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || JWT.REFRESH_TOKEN_EXPIRY }
  );
};

// ============================================
// Send Token Response
// ============================================
const sendTokenResponse = (user, statusCode, res) => {
  try {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Cookie options
    const cookieOptions = {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: JWT.COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      path: '/'
    };

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Send response
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
    console.error('❌ Error generating tokens:', error.message);
    throw error;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  sendTokenResponse
};
