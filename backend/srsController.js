// ============================================
// SM-2 Algorithm Controller (FIXED VERSION)
// ============================================
const { SM2, REVIEW_LEVELS } = require('./config/constants');

// ============================================
// Helper Functions
// ============================================
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

// ============================================
// SM-2 Algorithm Core Implementation (FIXED)
// ============================================
const updateCardState = (sentence, quality, now = new Date()) => {
  // Validate quality input
  if (quality < 0 || quality > 3) {
    throw new Error('Quality must be between 0 and 3');
  }

  const currentInterval = sentence.interval || SM2.DEFAULT_INTERVAL;
  const currentEase = sentence.easeFactor || SM2.DEFAULT_EASE_FACTOR;
  const currentReps = sentence.repetitions || SM2.DEFAULT_REPETITIONS;

  let nextReview;
  let newInterval = currentInterval;
  let newEase = currentEase;
  let newReps = currentReps;

  // ============================================
  // 🔴 QUALITY 0: Again (إعادة كاملة)
  // ============================================
  if (quality === 0) {
    newReps = 0;  // إعادة تعيين التكرارات
    newInterval = 0;  // صفر = نفس اليوم (10 دقائق)
    newEase = Math.max(SM2.MIN_EASE_FACTOR, currentEase - 0.2);  // تقليل السهولة
    nextReview = addMinutes(now, SM2.IMMEDIATE_REVIEW_MINUTES);  // 10 دقائق
  }
  
  // ============================================
  // 🟡 QUALITY 1: Hard (صعب - فاصل قصير)
  // ============================================
  else if (quality === 1) {
    newReps = 0;  // إعادة تعيين التكرارات
    newInterval = 1;  // يوم واحد
    newEase = Math.max(SM2.MIN_EASE_FACTOR, currentEase - 0.15);  // تقليل بسيط
    nextReview = addDays(now, 1);  // بعد يوم واحد
  }
  
  // ============================================
  // 🟢 QUALITY 2: Good (جيد - فاصل عادي)
  // ============================================
  else if (quality === 2) {
    // حساب الفاصل حسب SM-2 القياسي
    if (currentReps === 0) {
      newInterval = 1;  // أول مراجعة = 1 يوم
    } else if (currentReps === 1) {
      newInterval = 3;  // ثاني مراجعة = 3 أيام
    } else {
      newInterval = Math.round(currentInterval * currentEase);  // SM-2 formula
    }
    
    newReps = currentReps + 1;
    newEase = currentEase + 0.0;  // لا تغيير في السهولة (أو +0.05 للتحسن البسيط)
    
    // تطبيق الحدود
    newInterval = Math.max(SM2.MIN_INTERVAL_DAYS, newInterval);
    newInterval = Math.min(SM2.MAX_INTERVAL_DAYS, newInterval);
    
    nextReview = addDays(now, newInterval);
  }
  
  // ============================================
  // 🔵 QUALITY 3: Excellent (ممتاز - فاصل طويل)
  // ============================================
  else if (quality === 3) {
    // حساب الفاصل مع مضاعف إضافي
    if (currentReps === 0) {
      newInterval = 3;  // أول مراجعة = 3 أيام (أطول من Good)
    } else if (currentReps === 1) {
      newInterval = 7;  // ثاني مراجعة = أسبوع
    } else {
      // استخدام معامل أعلى للممتاز (1.5x)
      newInterval = Math.round(currentInterval * currentEase * 1.5);
    }
    
    newReps = currentReps + 1;
    newEase = currentEase + 0.15;  // زيادة السهولة للكروت السهلة
    
    // تطبيق الحدود
    newInterval = Math.max(SM2.MIN_INTERVAL_DAYS, newInterval);
    newInterval = Math.min(SM2.MAX_INTERVAL_DAYS, newInterval);
    
    nextReview = addDays(now, newInterval);
  }

  // ============================================
  // Apply Ease Factor Constraints
  // ============================================
  newEase = Math.min(SM2.MAX_EASE_FACTOR, Math.max(SM2.MIN_EASE_FACTOR, newEase));

  // ============================================
  // Calculate Review Level
  // ============================================
  const reviewLevel = calculateReviewLevel(newInterval);

  return {
    interval: newInterval,
    easeFactor: newEase,
    repetitions: newReps,
    nextReview,
    reviewLevel
  };
};

// ============================================
// Calculate Review Level Based on Interval
// ============================================
const calculateReviewLevel = (interval) => {
  const levels = Object.values(REVIEW_LEVELS).reverse();
  
  for (const level of levels) {
    if (interval >= level.threshold) {
      return level.label;
    }
  }
  
  return REVIEW_LEVELS.NEW.label;
};

// ============================================
// Get Level Details for UI
// ============================================
const getLevelDetails = (interval) => {
  const levels = Object.values(REVIEW_LEVELS).reverse();
  
  for (const level of levels) {
    if (interval >= level.threshold) {
      return level;
    }
  }
  
  return REVIEW_LEVELS.NEW;
};

// ============================================
// Calculate Sentence Statistics
// ============================================
const calculateSentenceStats = (sentence) => {
  const totalReviews = sentence.reviewCount || 0;
  const correct = sentence.correctCount || 0;
  const wrong = sentence.wrongCount || 0;

  const accuracy = totalReviews > 0 
    ? Math.round((correct / totalReviews) * 100) 
    : 0;

  const level = getLevelDetails(sentence.interval || 0);

  return {
    totalReviews,
    correct,
    wrong,
    accuracy,
    level: level.label,
    levelEmoji: level.emoji,
    levelColor: level.color,
    interval: sentence.interval || 0,
    easeFactor: sentence.easeFactor || SM2.DEFAULT_EASE_FACTOR,
    repetitions: sentence.repetitions || 0,
    nextReview: sentence.nextReview
  };
};

// ============================================
// Get Next Review Schedule
// ============================================
const getNextReviewSchedule = (interval) => {
  const now = new Date();
  const nextReview = addDays(now, interval);
  
  return {
    nextReview,
    daysUntilReview: interval,
    formattedDate: nextReview.toLocaleDateString('ar-EG'),
    formattedTime: nextReview.toLocaleTimeString('ar-EG')
  };
};

module.exports = {
  updateCardState,
  calculateReviewLevel,
  getLevelDetails,
  calculateSentenceStats,
  getNextReviewSchedule,
  addDays,
  addMinutes
};
