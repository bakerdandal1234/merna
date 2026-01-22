const mongoose = require('mongoose');

/**
 * Middleware للتحقق من أن المستخدم يملك الجملة
 * يُستخدم قبل عمليات UPDATE و DELETE
 */
const checkSentenceOwnership = (Sentence) => {
  return async (req, res, next) => {
    try {
      const sentenceId = req.params.id;
      const userId = req.user._id; // من protect middleware

      // التحقق من صحة الـ ID
      if (!mongoose.Types.ObjectId.isValid(sentenceId)) {
        return res.status(400).json({
          success: false,
          message: 'معرّف الجملة غير صالح'
        });
      }

      // البحث عن الجملة
      const sentence = await Sentence.findById(sentenceId);

      if (!sentence) {
        return res.status(404).json({
          success: false,
          message: 'الجملة غير موجودة'
        });
      }

      // التحقق من الملكية
      if (!sentence.userId || !userId || sentence.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: '🚫 غير مسموح! يمكنك فقط تعديل/حذف الجمل التي أضفتها أنت'
        });
      }

      // حفظ الجملة في request للاستخدام في الـ controller
      req.sentence = sentence;
      next();
    } catch (error) {
      console.error('Ownership Check Error:', error);
      return res.status(500).json({
        success: false,
        message: 'حدث خطأ في التحقق من الصلاحيات',
        error: error.message
      });
    }
  };
};

module.exports = { checkSentenceOwnership };
