// ============================================
// 🧠 SM-2 Algorithm Controller (بدون Luxon)
// ============================================

// دالة مساعدة لإضافة أيام لتاريخ
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// دالة مساعدة لإضافة دقائق لتاريخ
const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

// ============================================
// 🎯 الخوارزمية الأساسية (SM-2 المُحسّن)
// ============================================
const updateCardState = (sentence, quality, now = new Date()) => {
  // القيم الافتراضية
  const currentInterval = sentence.interval || 0;
  const currentEase = sentence.easeFactor || 2.5;
  const currentReps = sentence.repetitions || 0;

  let nextReview;
  let newInterval = currentInterval;
  let newEase = currentEase;
  let newReps = currentReps;

  // ============================================
  // 1️⃣ حالة الفشل (0 = خطأ كامل، 1 = صعب)
  // ============================================
  if (quality === 0 || quality === 1) {
    newReps = 0;
    newInterval = 1; // إعادة تعيين الفاصل ليوم واحد
    
    // تعديل عامل السهولة
    if (quality === 0) {
      newEase = Math.max(1.3, currentEase - 0.2); // خطأ كامل: تقليل أكبر
    } else {
      newEase = Math.max(1.3, currentEase - 0.15); // صعب: تقليل متوسط
    }

    // تحديد وقت المراجعة التالية
    if (quality === 0) {
      // مراجعة فورية بعد 10 دقائق للأخطاء الكاملة
      nextReview = addMinutes(now, 10);
    } else {
      // مراجعة بعد يوم للمستوى الصعب
      nextReview = addDays(now, 1);
    }
  } 
  // ============================================
  // 2️⃣ حالة النجاح (2 = جيد، 3 = ممتاز)
  // ============================================
  else {
    // حساب الفاصل الجديد
    if (currentReps === 0) {
      newInterval = 1; // أول نجاح: يوم واحد
    } else if (currentReps === 1) {
      newInterval = 3; // ثاني نجاح: 3 أيام
    } else {
      // نمو أُسي بناءً على عامل السهولة
      newInterval = Math.round(currentInterval * currentEase);
    }

    // زيادة عدد التكرارات
    newReps = currentReps + 1;

    // تعديل عامل السهولة بناءً على الجودة
    if (quality === 2) {
      newEase = currentEase + 0.05; // جيد: زيادة طفيفة
    } else if (quality === 3) {
      newEase = currentEase + 0.15; // ممتاز: زيادة أكبر
    }

    // ضمان الحد الأدنى للفاصل = 1 يوم
    newInterval = Math.max(1, newInterval);
    
    // ضمان الحد الأقصى للفاصل = 365 يوم (سنة واحدة)
    newInterval = Math.min(365, newInterval);

    // تحديد وقت المراجعة
    nextReview = addDays(now, newInterval);
  }

  // ============================================
  // 3️⃣ ضبط حدود عامل السهولة (1.3 - 3.0)
  // ============================================
  newEase = Math.min(3.0, Math.max(1.3, newEase));

  // ============================================
  // 4️⃣ حساب المستوى (Level) بناءً على الفاصل
  // ============================================
  let reviewLevel = 'new';
  
  if (newInterval === 0) {
    reviewLevel = 'new';
  } else if (newInterval <= 1) {
    reviewLevel = 'learning'; // تعلّم (مراجعة فورية/يومية)
  } else if (newInterval <= 4) {
    reviewLevel = 'hard'; // صعب
  } else if (newInterval <= 10) {
    reviewLevel = 'good'; // جيد
  } else if (newInterval <= 30) {
    reviewLevel = 'excellent'; // ممتاز
  } else {
    reviewLevel = 'mastered'; // متقن
  }

  return {
    interval: newInterval,
    easeFactor: newEase,
    repetitions: newReps,
    nextReview: nextReview,
    reviewLevel: reviewLevel
  };
};

// ============================================
// 🎨 دالة للحصول على تفاصيل المستوى (للواجهة)
// ============================================
const getLevelDetails = (interval) => {
  const levelMap = [
    { threshold: 0, label: 'new', emoji: '🆕', color: '#6366f1' },
    { threshold: 1, label: 'learning', emoji: '📚', color: '#8b5cf6' },
    { threshold: 4, label: 'hard', emoji: '😅', color: '#f59e0b' },
    { threshold: 10, label: 'good', emoji: '👍', color: '#10b981' },
    { threshold: 30, label: 'excellent', emoji: '⭐', color: '#3b82f6' },
    { threshold: 365, label: 'mastered', emoji: '🏆', color: '#ef4444' }
  ];

  for (let i = levelMap.length - 1; i >= 0; i--) {
    if (interval >= levelMap[i].threshold) {
      return levelMap[i];
    }
  }
  
  return levelMap[0];
};

// ============================================
// 📊 حساب الإحصائيات للجملة
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
    easeFactor: sentence.easeFactor || 2.5,
    repetitions: sentence.repetitions || 0,
    nextReview: sentence.nextReview
  };
};

// ============================================
// 🔄 Exports
// ============================================
module.exports = {
  updateCardState,
  getLevelDetails,
  calculateSentenceStats,
  addDays,
  addMinutes
};
