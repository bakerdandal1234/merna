// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { updateCardState, getLevelDetails, calculateSentenceStats } = require('./srsController');

const app = express();

// ============================================
// Middleware
// ============================================

// Security Middleware
app.use(helmet()); // حماية HTTP headers

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true // للسماح بإرسال cookies
}));

// Body Parser
app.use(express.json({ limit: '10kb' })); // حد أقصى 10kb للـ JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie Parser
app.use(cookieParser());

// ============================================
// MongoDB Connection
// ============================================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ============================================
// 📦 Sentence Schema مع حقول SM-2 + userId
// ============================================
const sentenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  german: {
    type: String,
    required: true,
    trim: true
  },
  arabic: {
    type: String,
    required: true,
    trim: true
  },
  
  // ===== حقول SM-2 =====
  interval: {
    type: Number,
    default: 0
  },
  
  easeFactor: {
    type: Number,
    default: 2.5
  },
  
  repetitions: {
    type: Number,
    default: 0
  },
  
  nextReview: {
    type: Date,
    default: () => new Date()
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
    quality: { type: Number, min: 0, max: 3 },
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

// Index للبحث السريع
sentenceSchema.index({ userId: 1, createdAt: -1 });
sentenceSchema.index({ userId: 1, nextReview: 1 });

const Sentence = mongoose.model('Sentence', sentenceSchema);

// ============================================
// 🔐 Import Authentication Routes & Middleware
// ============================================
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/auth');
const { generalLimiter } = require('./middleware/rateLimiter');

// ============================================
// 🌐 Routes
// ============================================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running! 🚀',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('🎓 مرحبًا بك في API لتعلم اللغة الألمانية مع نظام SM-2!');
});

// Rate Limiting عام للـ API
// app.use('/api', generalLimiter);

// Authentication Routes (Public)
app.use('/api/auth', authRoutes);

// ============================================
// 📚 Sentence Routes (Protected)
// ============================================

// GET - جلب جمل المستخدم فقط
app.get('/api/sentences', protect, async (req, res) => {
  try {
    const sentences = await Sentence.find({ userId: req.user.id }).sort({ createdAt: -1 });
    
    const sentencesWithStats = sentences.map(s => {
      const stats = calculateSentenceStats(s);
      return { ...s.toObject(), stats };
    });
    
    res.json(sentencesWithStats);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الجمل', error: error.message });
  }
});

// POST - إضافة جملة جديدة
app.post('/api/sentences', protect, async (req, res) => {
  try {
    const { german, arabic } = req.body;

    // التحقق من وجود الجملة للمستخدم الحالي
    const existingSentence = await Sentence.findOne({ 
      userId: req.user.id, 
      german 
    });
    
    if (existingSentence) {
      return res.status(400).json({
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }

    const newSentence = new Sentence({
      userId: req.user.id,
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
    res.status(500).json({ message: 'خطأ في إضافة الجملة', error: error.message });
  }
});

// POST - مراجعة الجملة بنظام SM-2
app.post('/api/sentences/:id/review', protect, async (req, res) => {
  try {
    const { quality } = req.body;
    
    if (quality < 0 || quality > 3) {
      return res.status(400).json({ message: 'التقييم يجب أن يكون بين 0 و 3' });
    }

    const sentence = await Sentence.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!sentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    const intervalBefore = sentence.interval;
    const newState = updateCardState(sentence, quality);

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

    sentence.reviewHistory.push({
      date: new Date(),
      quality: quality,
      intervalBefore: intervalBefore,
      intervalAfter: newState.interval
    });

    await sentence.save();

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

// GET - الجمل المستحقة للمراجعة
app.get('/api/sentences/due', protect, async (req, res) => {
  try {
    const now = new Date();
    
    const dueSentences = await Sentence.find({
      userId: req.user.id,
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

// GET - الإحصائيات
app.get('/api/stats', protect, async (req, res) => {
  try {
    const total = await Sentence.countDocuments({ userId: req.user.id });
    
    const levelCounts = await Sentence.aggregate([
      { $match: { userId: req.user._id } },
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
    
    stats.masteryPercentage = total > 0 
      ? (((stats.excellent + stats.mastered) / total) * 100).toFixed(1)
      : 0;
    
    const now = new Date();
    stats.due = await Sentence.countDocuments({
      userId: req.user.id,
      nextReview: { $lte: now }
    });
    
    const allSentences = await Sentence.find({ userId: req.user.id });
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

// POST - إعادة تعيين البطاقات
app.post('/api/sentences/reset', protect, async (req, res) => {
  try {
    await Sentence.updateMany(
      { userId: req.user.id },
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

// PUT - تعديل الجملة
app.put('/api/sentences/:id', protect, async (req, res) => {
  try {
    const { german, arabic, favorite } = req.body;

    const updateData = {};
    
    if (german) updateData.german = german;
    if (arabic) updateData.arabic = arabic;
    if (favorite !== undefined) updateData.favorite = favorite;

    const updatedSentence = await Sentence.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    const stats = calculateSentenceStats(updatedSentence);
    res.json({ ...updatedSentence.toObject(), stats });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تعديل الجملة', error: error.message });
  }
});

// DELETE - حذف الجملة
app.delete('/api/sentences/:id', protect, async (req, res) => {
  try {
    const deletedSentence = await Sentence.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!deletedSentence) {
      return res.status(404).json({ message: 'الجملة غير موجودة' });
    }

    res.json({ message: '🗑️ تم حذف الجملة بنجاح', sentence: deletedSentence });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في حذف الجملة', error: error.message });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// 🚀 Server
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🚀 Server Running on Port ${PORT}      ║
  ║   🌍 Environment: ${process.env.NODE_ENV}          ║
  ║   🔐 Authentication: Enabled           ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:${PORT}/api    ║
  ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
