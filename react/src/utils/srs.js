/**
 * 🧠 نظام Spaced Repetition System (SRS)
 * خوارزمية ذكية لتحديد موعد المراجعة التالي
 */

// فترات المراجعة بالأيام
const INTERVALS = {
  new: 0.007,      // 10 دقائق (للاختبار السريع)
  failed: 1,       // يوم واحد
  hard: 3,         // 3 أيام
  good: 7,         // أسبوع
  excellent: 15,   // أسبوعين
  mastered: 30     // شهر
};

/**
 * حساب موعد المراجعة التالي
 * @param {string} reviewLevel - مستوى المراجعة الحالي
 * @param {number} correctStreak - عدد المرات الصحيحة المتتالية
 * @param {Date} lastReviewed - آخر مراجعة
 * @returns {Date} موعد المراجعة التالي
 */
export const calculateNextReview = (reviewLevel, correctStreak = 0, lastReviewed = new Date()) => {
  let days = INTERVALS[reviewLevel] || INTERVALS.new;
  
  // مكافأة الـ streak
  if (correctStreak >= 5) {
    days = days * 2; // ضعف المدة للمتميزين
  } else if (correctStreak >= 3) {
    days = days * 1.5;
  }
  
  const nextDate = new Date(lastReviewed);
  nextDate.setTime(nextDate.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return nextDate;
};

/**
 * تحديد مستوى المراجعة بناءً على الأداء
 * @param {boolean} knewIt - هل عرف الإجابة؟
 * @param {string} currentLevel - المستوى الحالي
 * @param {number} consecutiveCorrect - عدد الإجابات الصحيحة المتتالية
 * @returns {string} المستوى الجديد
 */
export const calculateNewLevel = (knewIt, currentLevel, consecutiveCorrect = 0) => {
  if (!knewIt) {
    // أخطأ - يرجع للمستوى الأول
    return 'new';
  }
  
  // تقدّم في المستويات
  const progression = {
    'new': consecutiveCorrect >= 2 ? 'hard' : 'new',
    'hard': consecutiveCorrect >= 2 ? 'good' : 'hard',
    'good': consecutiveCorrect >= 3 ? 'excellent' : 'good',
    'excellent': consecutiveCorrect >= 3 ? 'mastered' : 'excellent',
    'mastered': 'mastered' // مُتقن
  };
  
  return progression[currentLevel] || 'new';
};

/**
 * الحصول على الجمل المستحقة للمراجعة اليوم
 * @param {Array} sentences - جميع الجمل
 * @returns {Array} الجمل المستحقة
 */
export const getDueSentences = (sentences) => {
  const now = new Date();
  
  return sentences.filter(sentence => {
    // الجمل الجديدة دائماً مستحقة
    if (!sentence.nextReview) return true;
    
    const nextReview = new Date(sentence.nextReview);
    return nextReview <= now;
  }).sort((a, b) => {
    // ترتيب حسب الأولوية: الجديدة أولاً، ثم الأقدم
    if (!a.nextReview) return -1;
    if (!b.nextReview) return 1;
    return new Date(a.nextReview) - new Date(b.nextReview);
  });
};

/**
 * حساب الإحصائيات
 * @param {Array} sentences - جميع الجمل
 * @returns {Object} الإحصائيات
 */
export const calculateStats = (sentences) => {
  const total = sentences.length;
  const levelCounts = {
    new: 0,
    hard: 0,
    good: 0,
    excellent: 0,
    mastered: 0
  };
  
  sentences.forEach(s => {
    const level = s.reviewLevel || 'new';
    levelCounts[level] = (levelCounts[level] || 0) + 1;
  });
  
  const masteryPercentage = total > 0 
    ? ((levelCounts.excellent + levelCounts.mastered) / total * 100).toFixed(1)
    : 0;
  
  const due = getDueSentences(sentences).length;
  
  return {
    total,
    ...levelCounts,
    masteryPercentage,
    due,
    completed: levelCounts.mastered,
    inProgress: total - levelCounts.new - levelCounts.mastered
  };
};

/**
 * تتبع الـ Streak (الأيام المتتالية)
 * @param {Array} reviewHistory - سجل المراجعات
 * @returns {number} عدد الأيام المتتالية
 */
export const calculateStreak = (reviewHistory) => {
  if (!reviewHistory || reviewHistory.length === 0) return 0;
  
  let streak = 1;
  const today = new Date().setHours(0, 0, 0, 0);
  const yesterday = today - 24 * 60 * 60 * 1000;
  
  // التحقق من المراجعة اليوم
  const hasReviewedToday = reviewHistory.some(date => {
    const reviewDate = new Date(date).setHours(0, 0, 0, 0);
    return reviewDate === today;
  });
  
  if (!hasReviewedToday) {
    // التحقق من الأمس
    const hasReviewedYesterday = reviewHistory.some(date => {
      const reviewDate = new Date(date).setHours(0, 0, 0, 0);
      return reviewDate === yesterday;
    });
    
    if (!hasReviewedYesterday) return 0;
  }
  
  // حساب الأيام المتتالية
  const sortedDates = reviewHistory
    .map(d => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = (sortedDates[i] - sortedDates[i + 1]) / (24 * 60 * 60 * 1000);
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }
  
  return streak;
};

/**
 * توقع الوقت حتى الإتقان
 * @param {Array} sentences - جميع الجمل
 * @param {number} dailyReviews - عدد المراجعات اليومية
 * @returns {Object} التوقعات
 */
export const predictMastery = (sentences, dailyReviews = 15) => {
  const stats = calculateStats(sentences);
  const remaining = stats.total - stats.mastered;
  
  // متوسط 5 مراجعات لإتقان جملة واحدة
  const reviewsNeeded = remaining * 5;
  const daysNeeded = Math.ceil(reviewsNeeded / dailyReviews);
  
  return {
    daysNeeded,
    weeksNeeded: Math.ceil(daysNeeded / 7),
    monthsNeeded: Math.ceil(daysNeeded / 30),
    estimatedDate: new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000)
  };
};

/**
 * اقتراحات ذكية للمستخدم
 * @param {Object} stats - الإحصائيات
 * @returns {Array} الاقتراحات
 */
export const getSmartSuggestions = (stats) => {
  const suggestions = [];
  
  if (stats.due === 0) {
    suggestions.push({
      type: 'success',
      icon: '🎉',
      message: 'رائع! لا توجد مراجعات اليوم',
      action: 'تعلم جمل جديدة'
    });
  } else if (stats.due > 20) {
    suggestions.push({
      type: 'warning',
      icon: '⚠️',
      message: `لديك ${stats.due} جملة للمراجعة!`,
      action: 'ابدأ المراجعة الآن'
    });
  } else {
    suggestions.push({
      type: 'info',
      icon: '📚',
      message: `${stats.due} جمل تنتظر المراجعة`,
      action: 'راجع الآن'
    });
  }
  
  if (stats.masteryPercentage < 30) {
    suggestions.push({
      type: 'tip',
      icon: '💡',
      message: 'ركّز على المراجعة اليومية',
      action: null
    });
  }
  
  if (stats.new > stats.total * 0.5) {
    suggestions.push({
      type: 'tip',
      icon: '🎯',
      message: 'لديك جمل جديدة كثيرة، راجعها تدريجياً',
      action: null
    });
  }
  
  return suggestions;
};

export default {
  calculateNextReview,
  calculateNewLevel,
  getDueSentences,
  calculateStats,
  calculateStreak,
  predictMastery,
  getSmartSuggestions
};
