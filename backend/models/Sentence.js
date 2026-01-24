const mongoose = require('mongoose');
const { SM2 } = require('../config/constants');

// ============================================
// Sentence Schema مع SM-2 Algorithm
// ============================================
const sentenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId مطلوب'],
      index: true
    },
    german: {
      type: String,
      required: [true, 'الجملة الألمانية مطلوبة'],
      trim: true,
      maxlength: [500, 'الجملة لا يمكن أن تتجاوز 500 حرف']
    },
    arabic: {
      type: String,
      required: [true, 'الترجمة العربية مطلوبة'],
      trim: true,
      maxlength: [500, 'الترجمة لا يمكن أن تتجاوز 500 حرف']
    },
    // ===== SM-2 Fields =====
    interval: {
      type: Number,
      default: SM2.DEFAULT_INTERVAL,
      min: [0, 'الفاصل الزمني لا يمكن أن يكون سالباً']
    },
    easeFactor: {
      type: Number,
      default: SM2.DEFAULT_EASE_FACTOR,
      min: [SM2.MIN_EASE_FACTOR, `عامل السهولة لا يمكن أن يكون أقل من ${SM2.MIN_EASE_FACTOR}`],
      max: [SM2.MAX_EASE_FACTOR, `عامل السهولة لا يمكن أن يتجاوز ${SM2.MAX_EASE_FACTOR}`]
    },
    repetitions: {
      type: Number,
      default: SM2.DEFAULT_REPETITIONS,
      min: [0, 'التكرارات لا يمكن أن تكون سالبة']
    },
    nextReview: {
      type: Date,
      default: () => new Date(),
      index: true
    },
    reviewLevel: {
      type: String,
      enum: ['new', 'learning', 'hard', 'good', 'excellent', 'mastered'],
      default: 'new',
      index: true
    },
    // ===== Review Statistics =====
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'عدد المراجعات لا يمكن أن يكون سالباً']
    },
    correctCount: {
      type: Number,
      default: 0,
      min: [0, 'عدد الإجابات الصحيحة لا يمكن أن يكون سالباً']
    },
    wrongCount: {
      type: Number,
      default: 0,
      min: [0, 'عدد الإجابات الخاطئة لا يمكن أن يكون سالباً']
    },
    reviewHistory: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        quality: {
          type: Number,
          min: 0,
          max: 3,
          required: true
        },
        intervalBefore: {
          type: Number,
          min: 0
        },
        intervalAfter: {
          type: Number,
          min: 0
        }
      }
    ],
    // ===== Additional Fields =====
    favorite: {
      type: Boolean,
      default: false
    },
    lastReviewed: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ============================================
// Compound Indexes for Performance
// ============================================
sentenceSchema.index({ userId: 1, createdAt: -1 });
sentenceSchema.index({ userId: 1, nextReview: 1 });
sentenceSchema.index({ userId: 1, reviewLevel: 1 });
sentenceSchema.index({ userId: 1, favorite: 1 });
sentenceSchema.index({ german: 'text', arabic: 'text' });

// ============================================
// Virtual Fields
// ============================================
sentenceSchema.virtual('accuracy').get(function () {
  if (this.reviewCount === 0) return 0;
  return Math.round((this.correctCount / this.reviewCount) * 100);
});

sentenceSchema.virtual('isDue').get(function () {
  return this.nextReview <= new Date();
});

sentenceSchema.virtual('daysUntilReview').get(function () {
  const now = new Date();
  const diff = this.nextReview - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ============================================
// Pre-save Middleware
// ============================================

sentenceSchema.pre('save', async function () {
  if (this.isModified('reviewHistory') && this.reviewHistory.length > 100) {
    this.reviewHistory = this.reviewHistory.slice(-100);
  }
  // لا حاجة لاستدعاء next()
});


// ============================================
// Static Methods
// ============================================

// Get user statistics
sentenceSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$reviewLevel',
        count: { $sum: 1 },
        avgInterval: { $avg: '$interval' },
        avgEaseFactor: { $avg: '$easeFactor' }
      }
    }
  ]);

  const total = await this.countDocuments({ userId });
  const dueCount = await this.countDocuments({
    userId,
    nextReview: { $lte: new Date() }
  });

  return {
    total,
    dueCount,
    levelBreakdown: stats
  };
};

// Get due sentences
sentenceSchema.statics.getDueSentences = async function (userId, limit = 20) {
  return this.find({
    userId,
    nextReview: { $lte: new Date() }
  })
    .sort({ nextReview: 1 })
    .limit(limit)
    .lean();
};

// ============================================
// Instance Methods
// ============================================

// Update review state
sentenceSchema.methods.updateReviewState = function (newState, quality) {
  const intervalBefore = this.interval;

  this.interval = newState.interval;
  this.easeFactor = newState.easeFactor;
  this.repetitions = newState.repetitions;
  this.nextReview = newState.nextReview;
  this.reviewLevel = newState.reviewLevel;
  this.lastReviewed = new Date();
  this.reviewCount += 1;

  if (quality >= 2) {
    this.correctCount += 1;
  } else {
    this.wrongCount += 1;
  }

  this.reviewHistory.push({
    date: new Date(),
    quality,
    intervalBefore,
    intervalAfter: newState.interval
  });

  return this;
};

// Reset sentence
sentenceSchema.methods.reset = function () {
  this.interval = SM2.DEFAULT_INTERVAL;
  this.easeFactor = SM2.DEFAULT_EASE_FACTOR;
  this.repetitions = SM2.DEFAULT_REPETITIONS;
  this.reviewLevel = 'new';
  this.nextReview = new Date();
  this.reviewCount = 0;
  this.correctCount = 0;
  this.wrongCount = 0;
  this.reviewHistory = [];
  this.lastReviewed = null;
  return this;
};

module.exports = mongoose.model('Sentence', sentenceSchema);
