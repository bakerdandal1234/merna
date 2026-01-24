// نموذج قاعدة البيانات لحفظ اشتراكات الإشعارات الفورية
const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  // معرف المستخدم
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // كل مستخدم له اشتراك واحد فقط
  },
  // بيانات الاشتراك من المتصفح
  subscription: {
    type: Object,
    required: true
  },
  // هل الإشعارات مفعلة أم لا
  enabled: {
    type: Boolean,
    default: true
  },
  // تاريخ آخر إشعار تم إرساله
  lastNotificationSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // إضافة createdAt و updatedAt تلقائياً
});

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
