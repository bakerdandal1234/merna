// التحكم في الإشعارات الفورية (Push Notifications)
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// إعداد VAPID Keys من ملف البيئة
webpush.setVapidDetails(
  'mailto:' + (process.env.ADMIN_EMAIL || 'admin@example.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 1️⃣ حفظ اشتراك الإشعارات للمستخدم
exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id; // من middleware المصادقة

    // التحقق من وجود بيانات الاشتراك
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'بيانات الاشتراك غير صحيحة'
      });
    }

    // حفظ أو تحديث الاشتراك
    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId },
      { 
        subscription,
        enabled: true
      },
      { 
        upsert: true, // إنشاء جديد إذا لم يكن موجود
        new: true 
      }
    );

    res.json({
      success: true,
      message: 'تم تفعيل الإشعارات بنجاح! 🔔',
      data: {
        enabled: pushSubscription.enabled
      }
    });

  } catch (error) {
    console.error('❌ خطأ في حفظ الاشتراك:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ الإشعارات'
    });
  }
};

// 2️⃣ تفعيل/تعطيل الإشعارات
exports.toggleNotifications = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    // البحث عن الاشتراك وتحديث حالته
    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId },
      { enabled },
      { new: true }
    );

    if (!pushSubscription) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على اشتراك للإشعارات'
      });
    }

    res.json({
      success: true,
      message: enabled ? 'تم تفعيل الإشعارات ✅' : 'تم تعطيل الإشعارات ⏸️',
      data: {
        enabled: pushSubscription.enabled
      }
    });

  } catch (error) {
    console.error('❌ خطأ في تبديل حالة الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحديث الإشعارات'
    });
  }
};

// 3️⃣ الحصول على حالة الإشعارات للمستخدم
exports.getNotificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const pushSubscription = await PushSubscription.findOne({ userId });

    res.json({
      success: true,
      data: {
        subscribed: !!pushSubscription,
        enabled: pushSubscription ? pushSubscription.enabled : false
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب حالة الإشعارات:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب حالة الإشعارات'
    });
  }
};

// 4️⃣ إرسال إشعار لمستخدم معين
exports.sendNotification = async (userId, title, body, data = {}) => {
  try {
    // البحث عن اشتراك المستخدم
    const pushSubscription = await PushSubscription.findOne({ 
      userId,
      enabled: true // فقط المستخدمين الذين فعّلوا الإشعارات
    });

    if (!pushSubscription) {
      console.log(`ℹ️ المستخدم ${userId} لم يفعّل الإشعارات`);
      return false;
    }

    // محتوى الإشعار
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png', // أيقونة الإشعار
      badge: '/badge-72x72.png',
      data: {
        url: '/', // الصفحة التي سيفتحها عند النقر
        ...data
      }
    });

    // إرسال الإشعار
    await webpush.sendNotification(pushSubscription.subscription, payload);

    // تحديث تاريخ آخر إشعار
    await PushSubscription.findByIdAndUpdate(pushSubscription._id, {
      lastNotificationSent: new Date()
    });

    console.log(`✅ تم إرسال إشعار للمستخدم ${userId}`);
    return true;

  } catch (error) {
    // إذا كان الاشتراك منتهي أو غير صالح
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`⚠️ اشتراك منتهي للمستخدم ${userId}، جاري الحذف...`);
      await PushSubscription.deleteOne({ userId });
    } else {
      console.error('❌ خطأ في إرسال الإشعار:', error);
    }
    return false;
  }
};

// 5️⃣ إلغاء الاشتراك من الإشعارات
exports.unsubscribe = async (req, res) => {
  try {
    const userId = req.user.id;

    await PushSubscription.deleteOne({ userId });

    res.json({
      success: true,
      message: 'تم إلغاء الاشتراك من الإشعارات بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في إلغاء الاشتراك:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إلغاء الاشتراك'
    });
  }
};
