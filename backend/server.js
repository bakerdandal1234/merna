// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { updateCardState, getLevelDetails, calculateSentenceStats } = require('./srsController');

const app = express();
app.set('trust proxy', 1);
// ============================================
// Middleware
// ============================================

// Security Middleware
app.use(helmet()); // حماية HTTP headers

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://baker12.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // السماح للطلبات بدون origin (Postman مثلاً)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // ✅ ضروري لإرسال الـ cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie'] // ✅ ضروري للسماح بقراءة cookies
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
const { checkSentenceOwnership } = require('./middleware/checkOwnership');

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
// 📚 Sentence Routes (Protected) - مع توحيد الاستجابات
// ============================================

// GET - جلب جميع الجمل (جمل المستخدم + جمل المستخدمين الآخرين)
app.get('/api/sentences', protect, async (req, res) => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح. يرجى تسجيل الدخول'
      });
    }

    // ✅ جلب جميع الجمل بدون تصفية userId
    const sentences = await Sentence.find({}).sort({ createdAt: -1 });
    
    // ✅ إضافة معلومة isOwner لكل جملة للتحكم في الصلاحيات من جانب الـ Frontend
    const sentencesWithStats = sentences.map(s => {
      const stats = calculateSentenceStats(s);
      // استخدام _id بدلاً من id للتوافق
      const isOwner = s.userId && req.user._id && s.userId.toString() === req.user._id.toString();
      return { ...s.toObject(), stats, isOwner };
    });
    
    res.json({
      success: true,
      count: sentencesWithStats.length,
      sentences: sentencesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الجمل',
      error: error.message
    });
  }
});

// GET - جلب جمل المستخدم فقط (optional - في حال احتجت فيلتر بالجمل الخاصة بك)
app.get('/api/sentences/my-sentences', protect, async (req, res) => {
  try {
    // التحقق من وجود المستخدم
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح. يرجى تسجيل الدخول'
      });
    }

    const sentences = await Sentence.find({ userId: req.user._id }).sort({ createdAt: -1 });
    
    const sentencesWithStats = sentences.map(s => {
      const stats = calculateSentenceStats(s);
      return { ...s.toObject(), stats, isOwner: true };
    });
    
    res.json({
      success: true,
      count: sentencesWithStats.length,
      sentences: sentencesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب جملك',
      error: error.message
    });
  }
});

// POST - إضافة جملة جديدة
app.post('/api/sentences', protect, async (req, res) => {
  try {
    const { german, arabic } = req.body;

    // التحقق من وجود المستخدم
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح. يرجى تسجيل الدخول'
      });
    }

    // التحقق من وجود الجملة للمستخدم الحالي
    const existingSentence = await Sentence.findOne({ 
      userId: req.user._id, 
      german 
    });
    
    if (existingSentence) {
      return res.status(400).json({
        success: false,
        message: 'الجملة موجودة مسبقًا',
        exists: true
      });
    }

    const newSentence = new Sentence({
      userId: req.user._id,
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
    res.status(201).json({
      success: true,
      message: '✅ تم إضافة الجملة بنجاح',
      sentence: { ...newSentence.toObject(), stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة الجملة',
      error: error.message
    });
  }
});

// POST - مراجعة الجملة بنظام SM-2 (متاح لجميع المستخدمين) - ✅ FIXED
app.post('/api/sentences/:id/review', protect, async (req, res) => {
  try {
    const { quality } = req.body;
    
    if (quality < 0 || quality > 3) {
      return res.status(400).json({
        success: false,
        message: 'التقييم يجب أن يكون بين 0 و 3'
      });
    }

    // البحث عن الجملة الأصلية
    const originalSentence = await Sentence.findById(req.params.id);
    
    if (!originalSentence) {
      return res.status(404).json({
        success: false,
        message: 'الجملة غير موجودة'
      });
    }

    // ✅ التحقق من وجود userId في الجملة الأصلية
    if (!originalSentence.userId) {
      return res.status(500).json({
        success: false,
        message: 'خطأ في بيانات الجملة - userId مفقود'
      });
    }

    // ✅ التحقق من وجود المستخدم الحالي
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح. يرجى تسجيل الدخول'
      });
    }

    // التحقق من الملكية
    const isOwner = originalSentence.userId.toString() === req.user._id.toString();
    
    let sentence;
    let intervalBefore;
    
    if (isOwner) {
      // ✅ المستخدم هو المالك - تحديث الجملة الأصلية
      sentence = originalSentence;
      intervalBefore = sentence.interval;
    } else {
      // ✅ المستخدم ليس المالك - البحث عن نسخته الخاصة أو إنشائها
      let userSentence = await Sentence.findOne({
        userId: req.user._id,
        german: originalSentence.german,
        arabic: originalSentence.arabic
      });
      
      if (!userSentence) {
        // إنشاء نسخة جديدة للمستخدم
        userSentence = new Sentence({
          userId: req.user._id,
          german: originalSentence.german,
          arabic: originalSentence.arabic,
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
      }
      
      sentence = userSentence;
      intervalBefore = sentence.interval;
    }
    
    // تطبيق خوارزمية SM-2
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
      success: true,
      message: isOwner ? '✅ تم تحديث البطاقة بنجاح' : '✅ تم إنشاء نسخة خاصة بك وتحديثها',
      sentence: { ...sentence.toObject(), stats, isOwner: true },
      changes: {
        intervalChange: `${intervalBefore} → ${newState.interval} أيام`,
        levelChange: newState.reviewLevel,
        nextReviewDate: newState.nextReview.toLocaleDateString('ar-EG')
      },
      wasCreated: !isOwner
    });
  } catch (error) {
    console.error('❌ خطأ في المراجعة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في المراجعة',
      error: error.message
    });
  }
});

// GET - الجمل المستحقة للمراجعة (جميع الجمل)
app.get('/api/sentences/due', protect, async (req, res) => {
  try {
    const now = new Date();
    
    // جلب جميع الجمل المستحقة بدون تصفية userId
    const dueSentences = await Sentence.find({
      nextReview: { $lte: now }
    }).sort({ nextReview: 1 });
    
    const sentencesWithStats = dueSentences.map(s => {
      const stats = calculateSentenceStats(s);
      return { ...s.toObject(), stats };
    });
    
    res.json({
      success: true,
      count: sentencesWithStats.length,
      sentences: sentencesWithStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الجمل المستحقة',
      error: error.message
    });
  }
});

// GET - الإحصائيات (جميع الجمل)
app.get('/api/stats', protect, async (req, res) => {
  try {
    // حساب الإحصائيات لجميع الجمل
    const total = await Sentence.countDocuments({});
    
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
    
    stats.masteryPercentage = total > 0 
      ? (((stats.excellent + stats.mastered) / total) * 100).toFixed(1)
      : 0;
    
    const now = new Date();
    stats.due = await Sentence.countDocuments({
      nextReview: { $lte: now }
    });
    
    const allSentences = await Sentence.find({});
    const totalReviews = allSentences.reduce((sum, s) => sum + (s.reviewCount || 0), 0);
    const totalCorrect = allSentences.reduce((sum, s) => sum + (s.correctCount || 0), 0);
    
    stats.totalReviews = totalReviews;
    stats.overallAccuracy = totalReviews > 0 
      ? ((totalCorrect / totalReviews) * 100).toFixed(1)
      : 0;
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حساب الإحصائيات',
      error: error.message
    });
  }
});

// POST - إعادة تعيين البطاقات (جميع الجمل)
app.post('/api/sentences/reset', protect, async (req, res) => {
  try {
    // إعادة تعيين جميع الجمل بدون تصفية userId
    const result = await Sentence.updateMany(
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
    
    res.json({
      success: true,
      message: `✅ تم إعادة تعيين ${result.modifiedCount} جملة بنجاح`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إعادة التعيين',
      error: error.message
    });
  }
});

// PUT - تعديل الجملة (للمالك فقط)
app.put('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), async (req, res) => {
  try {
    const { german, arabic, favorite } = req.body;

    // استخدام req.sentence من middleware
    const sentence = req.sentence;
    
    if (german) sentence.german = german;
    if (arabic) sentence.arabic = arabic;
    if (favorite !== undefined) sentence.favorite = favorite;

    await sentence.save();

    const stats = calculateSentenceStats(sentence);
    res.json({
      success: true,
      message: '✅ تم تعديل الجملة بنجاح',
      sentence: { ...sentence.toObject(), stats }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تعديل الجملة',
      error: error.message
    });
  }
});

// DELETE - حذف الجملة (للمالك فقط)
app.delete('/api/sentences/:id', protect, checkSentenceOwnership(Sentence), async (req, res) => {
  try {
    // استخدام req.sentence من middleware
    await Sentence.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '🗑️ تم حذف الجملة بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الجملة',
      error: error.message
    });
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
// Global Error Handler - محسّن
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // التعامل مع أخطاء Mongoose Validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'خطأ في التحقق من البيانات',
      errors
    });
  }

  // التعامل مع أخطاء Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'معرّف غير صالح'
    });
  }

  // التعامل مع أخطاء Duplicate Key
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'البيانات مكررة'
    });
  }

  // خطأ عام
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
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
  ║   🛡️  Authorization: Active            ║
  ║   🧠 SM-2 Algorithm: Active            ║
  ║   🔗 API: http://localhost:${PORT}/api    ║
  ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // في الإنتاج، يمكنك إغلاق الـ server هنا
  // process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // في الإنتاج، يجب إغلاق الـ server
  // process.exit(1);
});
