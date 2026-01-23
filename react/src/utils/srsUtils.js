// ============================================
// 🎯 SM-2 Algorithm Utilities (Frontend)
// متطابقة مع Backend Logic
// ============================================

/**
 * ثوابت SM-2 (نفسها من Backend)
 */
export const SM2_CONSTANTS = {
  DEFAULT_INTERVAL: 0,
  DEFAULT_EASE_FACTOR: 2.5,
  DEFAULT_REPETITIONS: 0,
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 3.0,
  MAX_INTERVAL_DAYS: 365,
  MIN_INTERVAL_DAYS: 1,
  IMMEDIATE_REVIEW_MINUTES: 10
};

/**
 * مستويات المراجعة (نفسها من Backend)
 */
export const REVIEW_LEVELS = {
  NEW: { threshold: 0, label: 'new', emoji: '🆕', color: '#6366f1', text: 'جديد' },
  LEARNING: { threshold: 1, label: 'learning', emoji: '📚', color: '#8b5cf6', text: 'تعلّم' },
  HARD: { threshold: 4, label: 'hard', emoji: '😅', color: '#f59e0b', text: 'صعب' },
  GOOD: { threshold: 10, label: 'good', emoji: '👍', color: '#10b981', text: 'جيد' },
  EXCELLENT: { threshold: 30, label: 'excellent', emoji: '⭐', color: '#3b82f6', text: 'ممتاز' },
  MASTERED: { threshold: 365, label: 'mastered', emoji: '🏆', color: '#ef4444', text: 'مُتقن' }
};

/**
 * حساب حالة البطاقة الجديدة بناءً على SM-2 (نفس منطق Backend)
 * @param {Object} sentence - الجملة الحالية
 * @param {number} quality - التقييم (0-3)
 * @returns {Object} الحالة الجديدة
 */
export const calculateNextState = (sentence, quality) => {
  if (quality < 0 || quality > 3) {
    throw new Error('Quality must be between 0 and 3');
  }

  const currentInterval = sentence.interval || SM2_CONSTANTS.DEFAULT_INTERVAL;
  const currentEase = sentence.easeFactor || SM2_CONSTANTS.DEFAULT_EASE_FACTOR;
  const currentReps = sentence.repetitions || SM2_CONSTANTS.DEFAULT_REPETITIONS;

  let newInterval = currentInterval;
  let newEase = currentEase;
  let newReps = currentReps;

  // حالة الفشل (quality 0 أو 1)
  if (quality === 0 || quality === 1) {
    newReps = 0;
    newInterval = SM2_CONSTANTS.MIN_INTERVAL_DAYS;

    if (quality === 0) {
      newEase = Math.max(SM2_CONSTANTS.MIN_EASE_FACTOR, currentEase - 0.2);
    } else {
      newEase = Math.max(SM2_CONSTANTS.MIN_EASE_FACTOR, currentEase - 0.15);
    }
  }
  // حالة النجاح (quality 2 أو 3)
  else {
    if (currentReps === 0) {
      newInterval = 1;
    } else if (currentReps === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(currentInterval * currentEase);
    }

    newReps = currentReps + 1;

    if (quality === 2) {
      newEase = currentEase + 0.05;
    } else if (quality === 3) {
      newEase = currentEase + 0.15;
    }

    newInterval = Math.max(SM2_CONSTANTS.MIN_INTERVAL_DAYS, newInterval);
    newInterval = Math.min(SM2_CONSTANTS.MAX_INTERVAL_DAYS, newInterval);
  }

  newEase = Math.min(SM2_CONSTANTS.MAX_EASE_FACTOR, Math.max(SM2_CONSTANTS.MIN_EASE_FACTOR, newEase));

  return {
    interval: newInterval,
    easeFactor: newEase,
    repetitions: newReps
  };
};

/**
 * حساب الفترة القادمة فقط بناءً على التقييم
 */
export const calculateNextInterval = (currentInterval, currentEaseFactor, quality) => {
  const state = calculateNextState(
    { interval: currentInterval, easeFactor: currentEaseFactor, repetitions: 0 },
    quality
  );
  return state.interval;
};

/**
 * حساب تاريخ المراجعة القادم
 */
export const calculateNextReviewDate = (days) => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

/**
 * تحديد مستوى المراجعة بناءً على الفترة
 */
export const getLevelDetails = (interval) => {
  const levels = Object.values(REVIEW_LEVELS).reverse();
  
  for (const level of levels) {
    if (interval >= level.threshold) {
      return level;
    }
  }
  
  return REVIEW_LEVELS.NEW;
};

/**
 * تحديد الجمل المستحقة
 */
export const getDueSentences = (sentences) => {
  const now = new Date();
  return sentences.filter(s => {
    if (!s.nextReview) return true;
    return new Date(s.nextReview) <= now;
  });
};

/**
 * تنسيق الفترة الزمنية
 */
export const formatInterval = (days) => {
  if (days === 0) return 'الآن';
  if (days === 1) return 'يوم';
  if (days === 2) return 'يومين';
  if (days < 10) return `${days} أيام`;
  if (days < 30) return `${days} يوم`;
  if (days < 60) return 'شهر';
  if (days < 90) return 'شهرين';
  if (days < 180) return `${Math.round(days / 30)} أشهر`;
  if (days < 365) return `${Math.round(days / 30)} شهر`;
  return 'سنة+';
};

/**
 * تنسيق التاريخ
 */
export const formatDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'الآن';
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'غداً';
  if (diffDays === 2) return 'بعد يومين';
  if (diffDays < 7) return `بعد ${diffDays} أيام`;
  if (diffDays < 14) return 'بعد أسبوع';
  if (diffDays < 30) return `بعد ${Math.round(diffDays / 7)} أسابيع`;
  if (diffDays < 60) return 'بعد شهر';
  
  return d.toLocaleDateString('ar-EG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * رسائل تحفيزية
 */
export const getMotivationalMessage = (quality, streak = 0) => {
  const messages = {
    0: [
      'لا بأس! التعلم يحتاج وقت 💪',
      'حاول مرة أخرى، أنت تتقدم! 🌟',
      'كل خطأ هو فرصة للتعلم! 📚',
      'استمر! النجاح قريب 🎯'
    ],
    1: [
      'جيد! واصل المحاولة 👍',
      'تحسن ملحوظ، أكمل! 📈',
      'أنت على الطريق الصحيح! 🛤️',
      'ممتاز، قريباً ستتقنها! ⭐'
    ],
    2: [
      'رائع! أنت تتقدم بشكل جيد! 🎉',
      'عمل ممتاز، استمر هكذا! ✨',
      'أداء رائع! 🌟',
      'تقدم مذهل! 🚀'
    ],
    3: [
      'مذهل! إتقان كامل! 🏆',
      'ممتاز جداً! أنت بطل! 🌟',
      'عبقري! واصل التميز! 💎',
      'إبداع خارق! 🔥'
    ]
  };

  if (streak >= 5) {
    return `🔥 Streak مذهل: ${streak} إجابة صحيحة متتالية!`;
  } else if (streak >= 3) {
    return `⚡ أداء ممتاز! ${streak} متتالية!`;
  }

  const messageList = messages[quality] || messages[0];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

/**
 * حساب التقدم الإجمالي
 */
export const calculateProgress = (sentences) => {
  if (!sentences || sentences.length === 0) return 0;
  
  const mastered = sentences.filter(s => 
    s.reviewLevel === 'excellent' || s.reviewLevel === 'mastered'
  ).length;
  
  return Math.round((mastered / sentences.length) * 100);
};

export default {
  SM2_CONSTANTS,
  REVIEW_LEVELS,
  calculateNextState,
  calculateNextInterval,
  calculateNextReviewDate,
  getLevelDetails,
  getDueSentences,
  formatInterval,
  formatDate,
  getMotivationalMessage,
  calculateProgress
};
