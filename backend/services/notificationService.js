// خدمة فحص الجمل المستحقة للمراجعة وإرسال الإشعارات
const User = require('../models/User');
const Sentence = require('../models/Sentence');
const { sendNotification } = require('../controllers/notificationController');

// 🔔 فحص المستخدمين الذين لديهم جمل مستحقة للمراجعة
exports.checkDueSentencesAndNotify = async () => {
  try {
    console.log('⏰ بدء فحص الجمل المستحقة للمراجعة...');

    const now = new Date();

    // الحصول على جميع المستخدمين النشطين
    const users = await User.find({ isActive: true }).select('_id');

    if (!users || users.length === 0) {
      console.log('ℹ️ لا يوجد مستخدمين نشطين');
      return;
    }

    let notificationsSent = 0;

    // فحص كل مستخدم على حدة
    for (const user of users) {
      try {
        // البحث عن الجمل المستحقة للمراجعة
        const dueSentences = await Sentence.find({
          userId: user._id,
          nextReview: { $lte: now } // الجمل التي حان وقت مراجعتها
        });

        // إذا كان لديه جمل مستحقة، أرسل له إشعار
        if (dueSentences.length > 0) {
          const success = await sendNotification(
            user._id,
            'وقت المراجعة! 📚',
            `لديك ${dueSentences.length} ${dueSentences.length === 1 ? 'جملة جاهزة' : 'جمل جاهزة'} للمراجعة`,
            {
              type: 'review_due',
              count: dueSentences.length,
              url: '/' // سيفتح الموقع الرئيسي
            }
          );

          if (success) {
            notificationsSent++;
          }
        }
      } catch (error) {
        console.error(`❌ خطأ في فحص المستخدم ${user._id}:`, error.message);
      }
    }

    console.log(`✅ تم فحص ${users.length} مستخدم، وإرسال ${notificationsSent} إشعار`);

  } catch (error) {
    console.error('❌ خطأ في فحص الجمل المستحقة:', error);
  }
};

// 📊 الحصول على إحصائيات الجمل المستحقة لمستخدم معين
exports.getDueStats = async (userId) => {
  try {
    const now = new Date();

    const dueSentences = await Sentence.countDocuments({
      userId,
      nextReview: { $lte: now }
    });

    return {
      dueCount: dueSentences,
      hasDue: dueSentences > 0
    };

  } catch (error) {
    console.error('❌ خطأ في جلب إحصائيات المراجعة:', error);
    return {
      dueCount: 0,
      hasDue: false
    };
  }
};
