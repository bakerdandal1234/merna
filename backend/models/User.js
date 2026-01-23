const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PASSWORD, EMAIL } = require('../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [2, 'الاسم يجب أن يكون حرفين على الأقل'],
      maxlength: [50, 'الاسم لا يمكن أن يتجاوز 50 حرفاً']
    },
    email: {
      type: String,
      required: [true, 'الإيميل مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'يرجى إدخال إيميل صالح'
      ],
      index: true
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [PASSWORD.MIN_LENGTH, `كلمة المرور يجب أن تكون ${PASSWORD.MIN_LENGTH} أحرف على الأقل`],
      select: false
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// ============================================
// Indexes for Performance
// ============================================
userSchema.index({ email: 1, isVerified: 1 });

// ============================================
// Pre-save Hook: Hash Password
// ============================================
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// Instance Method: Compare Password
// ============================================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================
// Instance Method: Create Verification Token
// ============================================
userSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationTokenExpire = Date.now() + EMAIL.VERIFICATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000;

  return verificationToken;
};

// ============================================
// Instance Method: Create Reset Password Token
// ============================================
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + EMAIL.RESET_PASSWORD_TOKEN_EXPIRY_MINUTES * 60 * 1000;

  return resetToken;
};

// ============================================
// Instance Method: Update Last Login
// ============================================
userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);
