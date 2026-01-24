const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PASSWORD, EMAIL } = require('../config/constants');
const config = require('../config/config');

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
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.resetPasswordToken;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      }
    }
  }
);

// ============================================
// Indexes for Performance
// ============================================
userSchema.index({ email: 1, isVerified: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

// ============================================
// Pre-save Hook: Hash Password & Track Changes
// ============================================
userSchema.pre('save', async function (next) {
  // Track password changes
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1s to ensure token is valid
  }

  // Only hash if password is modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
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
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  await this.save({ validateBeforeSave: false });
};

// ============================================
// Instance Method: Increment Login Attempts
// ============================================
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset lock if expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    
    // Lock account after max attempts
    if (this.loginAttempts >= config.security.maxLoginAttempts && !this.lockUntil) {
      this.lockUntil = Date.now() + config.security.lockoutDuration;
    }
  }
  
  await this.save({ validateBeforeSave: false });
};

// ============================================
// Virtual: Check if Account is Locked
// ============================================
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ============================================
// Instance Method: Check if Password Changed After Token
// ============================================
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// ============================================
// Static Method: Find by Credentials
// ============================================
userSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email }).select('+password');
  
  if (!user) {
    return { success: false, message: 'بيانات الدخول غير صحيحة' };
  }

  // Check if account is locked
  if (user.isLocked) {
    const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
    return { 
      success: false, 
      message: `الحساب مقفل. حاول مرة أخرى بعد ${remainingTime} دقيقة`,
      locked: true 
    };
  }

  // Check if verified
  if (!user.isVerified) {
    return { success: false, message: 'يرجى تفعيل حسابك أولاً' };
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    return { success: false, message: 'بيانات الدخول غير صحيحة' };
  }

  return { success: true, user };
};

module.exports = mongoose.model('User', userSchema);
