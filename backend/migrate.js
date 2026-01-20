// ============================================
// 🔄 Script لترحيل البيانات القديمة
// ============================================
// استخدم هذا Script إذا كان لديك بيانات قديمة تريد تحديثها

require('dotenv').config();
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    migrateSentences();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Schema
const sentenceSchema = new mongoose.Schema({}, { strict: false });
const Sentence = mongoose.model('Sentence', sentenceSchema);

async function migrateSentences() {
  try {
    console.log('🔄 بدء الترحيل...');
    
    const sentences = await Sentence.find();
    console.log(`📊 عدد الجمل: ${sentences.length}`);
    
    let updated = 0;
    
    for (const sentence of sentences) {
      // تحديد القيم الافتراضية للحقول الجديدة
      const updates = {};
      
      // SM-2 Fields
      if (sentence.interval === undefined) {
        updates.interval = 0;
      }
      
      if (sentence.easeFactor === undefined) {
        updates.easeFactor = 2.5;
      }
      
      if (sentence.repetitions === undefined) {
        updates.repetitions = 0;
      }
      
      if (!sentence.nextReview) {
        updates.nextReview = new Date();
      }
      
      // تحويل reviewLevel القديم إلى النظام الجديد
      if (sentence.reviewLevel) {
        // الاحتفاظ بالمستوى القديم ولكن إضافة interval مناسب
        const levelToInterval = {
          'new': 0,
          'hard': 3,
          'good': 7,
          'excellent': 15,
          'mastered': 30
        };
        
        if (!sentence.interval) {
          updates.interval = levelToInterval[sentence.reviewLevel] || 0;
        }
      } else {
        updates.reviewLevel = 'new';
      }
      
      // Statistics
      if (sentence.reviewCount === undefined) {
        updates.reviewCount = 0;
      }
      
      if (sentence.correctCount === undefined) {
        updates.correctCount = 0;
      }
      
      if (sentence.wrongCount === undefined) {
        updates.wrongCount = 0;
      }
      
      if (!sentence.reviewHistory || sentence.reviewHistory.length === 0) {
        updates.reviewHistory = [];
      }
      
      // تحديث إذا كانت هناك تغييرات
      if (Object.keys(updates).length > 0) {
        await Sentence.updateOne(
          { _id: sentence._id },
          { $set: updates }
        );
        updated++;
      }
    }
    
    console.log(`✅ تم تحديث ${updated} جملة بنجاح!`);
    console.log('');
    
    // عرض إحصائيات
    const stats = await Sentence.aggregate([
      {
        $group: {
          _id: '$reviewLevel',
          count: { $sum: 1 },
          avgInterval: { $avg: '$interval' }
        }
      }
    ]);
    
    console.log('📊 الإحصائيات بعد الترحيل:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} جملة (متوسط الفاصل: ${Math.round(stat.avgInterval)} يوم)`);
    });
    
    console.log('');
    console.log('🎉 الترحيل مكتمل!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطأ في الترحيل:', error.message);
    process.exit(1);
  }
}
