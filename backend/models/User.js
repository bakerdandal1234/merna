const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false // لا تُرجع الباسورد في الـ queries العادية
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    refreshToken: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

// Hash password قبل الحفظ


userSchema.pre('save', async function () {
  // إذا لم يتم تعديل الباسورد، تخطى
  if (!this.isModified('password')) return;

  // Hash الباسورد (12 round آمن)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method للتحقق من الباسورد
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method لإنشاء verification token
userSchema.methods.createVerificationToken = function () {
  // توليد token عشوائي
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash وحفظ في الداتابيز
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // صلاحية 24 ساعة
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;

  // إرجاع الـ token الأصلي (غير الـ hashed) لإرساله بالإيميل
  return verificationToken;
};

// Method لإنشاء reset password token
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // صلاحية 10 دقائق فقط
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
