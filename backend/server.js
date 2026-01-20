// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { updateCardState, getLevelDetails, calculateSentenceStats } = require('./srsController');

const app = express();
console.log('ENV MONGODB_URI =', process.env.MONGODB_URI);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ============================================
// 📦 Sentence Schema مع حقول SM-2 الجديدة
// ============================================
const sentenceSchema = new mongoose.Schema({
  german: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  arabic: {
    type: String,
    required: true,
    trim: true
  },
  
  // ===== حقول SM-2 الجديدة =====
  interval: {
    type: Number,
    default: 0  // عدد الأيام حتى المراجعة التالية
  },
  
  easeFactor: {
    type: Number,
    default: 2.5  // عامل السهولة (1.3 - 3.0)
  },
  
  repetitions: {
    type: Number,
    default: 0  // عدد التكرارات الناجحة المتتالية
  },
  
  nextReview: {
    type: Date,
    default: () => new Date()  // موعد المراجعة التالية
  },
  
  reviewLevel: {
    type: String,
    enum: ['new', 'learning', 'hard', 'good', 'excellent', 'mastered'],
    default: 'new'
  },
  
  // ===== إحصائيات المراجعة =====
  reviewCount: {
    type: Number,
    default: 0
  },
  
  correctCount: {
    type: Number,
    default: 0
  },
  
  wrongCount: {
    type: Number,
    default: 0
  },
  
  reviewHistory: [{
    date: { type: Date, default: Date.now },
    quality: { type: Number, min: 0, max: 3 }, // 0=خطأ، 1=صعب، 2=جيد، 3=ممتاز
    intervalBefore: Number,
    intervalAfter: Number
  }],
  
  // ===== حقول إضافية =====
  favorite: {
    type: Boolean,
    default: false
  },
  
  lastReviewed: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sentence = mongoose.model('Sentence', sentenceSchema);

// ============================================
// 🌐 Routes
// ============================================

app.get('/', (req, res) => {
  res.send('🎓 مرحبًا بك في API لتعلم اللغة الألمانية مع نظام SM-2!');
});

// ============================================
// 📚 CRUD Operations
// ============================================

// GET - جلب جميع الجمل
app.get('/api/sentences', async (req, res) => {
  try {
    const sentences = await Sentence.find().sort({ createdAt: -1 });
    
    // إضافة تفاصيل المستوى لكل جملة
    const sentencesWithLevels = sentences.map(s => {
      const stats = calculateSentenceStats(s);
      return {
        ...s.toObject(),
        stats
      };
    });
    
    res.json(sentencesWithLevels);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الجمل', error: error.message });
  }
});

// POST - إضافة جملة جديدة
app.post('/api/sentences', async (req, res) => {
  try {
    const { german, arabic } = req.body;

    const existingSentence = await Sentence.findOne({ german });
    if (existingSentence) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }

    const newSentence = new Sentence({
      german,
      arabic,
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
      reviewLevel: 'new',
      nextReview: new Date(),
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      reviewHistory: []
    });

    await newSentence.save();
    
    const stats = calculateSentenceStats(newSentence);
    res.status(201).json({ ...newSentence.toObject(), stats });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }
    res.status(500).json({ message: 'خطأ في إضافة الجملة', error: error.message });
  }
});

// ============================================
// 🎯 NEW: مراجعة الجملة بنظام SM-2
// ============================================
app.post('/api/sentences/:id/review', async (req, res) => {
  try {
    const { quality } = req.body; // 0 = خطأ، 1 = صعب، 2 = جيد، 3 = ممتاز
    
    if (quality < 0 || quality > 3) {
      return res.status(400).json({ message: 'التقييم يجب أن يكون بين 0 و 3' });
    }

    const sentence = await Sentence.findById(req.params.id);
    if (!sentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    // حفظ الفاصل القديم للتاريخ
    const intervalBefore = sentence.interval;

    // حساب الحالة الجديدة بالخوارزمية
    const newState = updateCardState(sentence, quality);

    // تحديث الإحصائيات
    sentence.interval = newState.interval;
    sentence.easeFactor = newState.easeFactor;
    sentence.repetitions = newState.repetitions;
    sentence.nextReview = newState.nextReview;
    sentence.reviewLevel = newState.reviewLevel;
    sentence.lastReviewed = new Date();
    sentence.reviewCount += 1;
    
    if (quality >= 2) {
      sentence.correctCount += 1;
    } else {
      sentence.wrongCount += 1;
    }

    // إضافة السجل التاريخي
    sentence.reviewHistory.push({
      date: new Date(),
      quality: quality,
      intervalBefore: intervalBefore,
      intervalAfter: newState.interval
    });

    await sentence.save();

    // إضافة الإحصائيات المحسوبة
    const stats = calculateSentenceStats(sentence);
    
    res.json({
      message: 'تم تحديث البطاقة بنجاح',
      sentence: { ...sentence.toObject(), stats },
      changes: {
        intervalChange: `${intervalBefore} → ${newState.interval} أيام`,
        levelChange: newState.reviewLevel,
        nextReviewDate: newState.nextReview.toLocaleDateString('ar-EG')
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في المراجعة', error: error.message });
  }
});

// ============================================
// 📊 الجمل المستحقة للمراجعة
// ============================================
app.get('/api/sentences/due', async (req, res) => {
  try {
    const now = new Date();
    
    const dueSentences = await Sentence.find({
      nextReview: { $lte: now }
    }).sort({ nextReview: 1 });
    
    const sentencesWithStats = dueSentences.map(s => {
      const stats = calculateSentenceStats(s);
      return { ...s.toObject(), stats };
    });
    
    res.json({
      count: sentencesWithStats.length,
      sentences: sentencesWithStats
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الجمل المستحقة', error: error.message });
  }
});

// ============================================
// 📈 الإحصائيات العامة
// ============================================
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Sentence.countDocuments();
    
    // حساب عدد الجمل لكل مستوى
    const levelCounts = await Sentence.aggregate([
      {
        $group: {
          _id: '$reviewLevel',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {
      total,
      new: 0,
      learning: 0,
      hard: 0,
      good: 0,
      excellent: 0,
      mastered: 0
    };
    
    levelCounts.forEach(item => {
      if (stats.hasOwnProperty(item._id)) {
        stats[item._id] = item.count;
      }
    });
    
    // حساب نسبة الإتقان
    stats.masteryPercentage = total > 0 
      ? (((stats.excellent + stats.mastered) / total) * 100).toFixed(1)
      : 0;
    
    // الجمل المستحقة
    const now = new Date();
    stats.due = await Sentence.countDocuments({
      nextReview: { $lte: now }
    });
    
    // إحصائيات إضافية
    const allSentences = await Sentence.find();
    const totalReviews = allSentences.reduce((sum, s) => sum + (s.reviewCount || 0), 0);
    const totalCorrect = allSentences.reduce((sum, s) => sum + (s.correctCount || 0), 0);
    
    stats.totalReviews = totalReviews;
    stats.overallAccuracy = totalReviews > 0 
      ? ((totalCorrect / totalReviews) * 100).toFixed(1)
      : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حساب الإحصائيات', error: error.message });
  }
});

// ============================================
// 🔄 إعادة تعيين البطاقات
// ============================================
app.post('/api/sentences/reset', async (req, res) => {
  try {
    await Sentence.updateMany(
      {},
      {
        $set: {
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          reviewLevel: 'new',
          nextReview: new Date(),
          reviewCount: 0,
          correctCount: 0,
          wrongCount: 0,
          reviewHistory: [],
          lastReviewed: null
        }
      }
    );
    
    res.json({ message: '✅ تم إعادة تعيين جميع الجمل بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إعادة التعيين', error: error.message });
  }
});

// ============================================
// 🗑️ حذف وتعديل
// ============================================

// PUT - تعديل الجملة
app.put('/api/sentences/:id', async (req, res) => {
  try {
    const { german, arabic, favorite } = req.body;

    const updateData = {};
    
    if (german) updateData.german = german;
    if (arabic) updateData.arabic = arabic;
    if (favorite !== undefined) updateData.favorite = favorite;

    const updatedSentence = await Sentence.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    const stats = calculateSentenceStats(updatedSentence);
    res.json({ ...updatedSentence.toObject(), stats });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }
    res.status(500).json({ message: 'خطأ في تعديل الجملة', error: error.message });
  }
});

// DELETE - حذف الجملة
app.delete('/api/sentences/:id', async (req, res) => {
  try {
    const deletedSentence = await Sentence.findByIdAndDelete(req.params.id);

    if (!deletedSentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    res.json({ message: '🗑️ تم حذف الجملة بنجاح', sentence: deletedSentence });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف الجملة', error: error.message });
  }
});

// ============================================
// 🚀 Server
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🧠 SM-2 Algorithm: Active`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
  console.log(`📚 Due Cards: http://localhost:${PORT}/api/sentences/due`);
});
