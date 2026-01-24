// ============================================
// 🎯 SRS Statistics & Analysis Functions
// ============================================

import { getLevelDetails, getDueSentences as getSRSDueSentences, formatInterval } from './srsUtils';

/**
 * حساب جميع الإحصائيات
 */
export const calculateStats = (sentences) => {
  if (!sentences || sentences.length === 0) {
    return {
      total: 0,
      new: 0,
      hard: 0,
      good: 0,
      excellent: 0,
      mastered: 0,
      due: 0,
      masteryPercentage: 0
    };
  }

  const stats = {
    total: sentences.length,
    new: 0,
    hard: 0,
    good: 0,
    excellent: 0,
    mastered: 0,
    due: 0
  };

  sentences.forEach(sentence => {
    const interval = sentence.interval || 0;
    const level = getLevelDetails(interval);
    
    // حساب المستويات
    switch (level.label) {
      case 'new':
        stats.new++;
        break;
      case 'learning':
        stats.new++;
        break;
      case 'hard':
        stats.hard++;
        break;
      case 'good':
        stats.good++;
        break;
      case 'excellent':
        stats.excellent++;
        break;
      case 'mastered':
        stats.mastered++;
        break;
    }

    // حساب الجمل المستحقة
    if (!sentence.nextReview || new Date(sentence.nextReview) <= new Date()) {
      stats.due++;
    }
  });

  // حساب نسبة التعلم النشط
  // أي جملة راجعتها مرة واحدة على الأقل بنجاح (interval >= 1)
  const activeLearning = stats.learning + stats.hard + stats.good + stats.excellent + stats.mastered;
  stats.masteryPercentage = stats.total > 0 
    ? Math.round((activeLearning / stats.total) * 100) 
    : 0;

  return stats;
};

/**
 * الحصول على الجمل المستحقة
 */
export const getDueSentences = (sentences) => {
  return getSRSDueSentences(sentences);
};

/**
 * الحصول على اقتراحات ذكية
 */
export const getSmartSuggestions = (stats) => {
  const suggestions = [];

  // إذا كان هناك جمل مستحقة للمراجعة
  if (stats.due > 0) {
    suggestions.push({
      type: 'info',
      icon: '⏰',
      message: `لديك ${stats.due} جملة تنتظر المراجعة`,
      action: 'ابدأ المراجعة الآن'
    });
  }

  // إذا كان هناك الكثير من الجمل الجديدة
  if (stats.new > 20) {
    suggestions.push({
      type: 'warning',
      icon: '📚',
      message: `لديك ${stats.new} جملة جديدة. ابدأ بمراجعتها لتحسين الإتقان`,
      action: 'راجع الآن'
    });
  }

  // إذا كانت نسبة الإتقان منخفضة
  if (stats.masteryPercentage < 30 && stats.total > 10) {
    suggestions.push({
      type: 'tip',
      icon: '💡',
      message: `نسبة إتقانك ${stats.masteryPercentage}%. راجع بانتظام لتحسين النتائج`,
      action: null
    });
  }

  // إذا كانت نسبة الإتقان عالية
  if (stats.masteryPercentage >= 80) {
    suggestions.push({
      type: 'success',
      icon: '🎉',
      message: `رائع! نسبة إتقانك ${stats.masteryPercentage}%. استمر في المحافظة على هذا المستوى`,
      action: null
    });
  }

  // إذا لم يكن هناك جمل مستحقة
  if (stats.due === 0 && stats.total > 0) {
    suggestions.push({
      type: 'success',
      icon: '✅',
      message: 'ممتاز! لا توجد مراجعات مستحقة اليوم. عد غداً',
      action: null
    });
  }

  // إذا لم يكن هناك جمل على الإطلاق
  if (stats.total === 0) {
    suggestions.push({
      type: 'info',
      icon: '🚀',
      message: 'ابدأ رحلتك في تعلم الألمانية بإضافة جملك الأولى',
      action: null
    });
  }

  // إذا لم يكن هناك اقتراحات، أضف رسالة تحفيزية
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'info',
      icon: '💪',
      message: 'استمر في التعلم والمراجعة المنتظمة',
      action: null
    });
  }

  return suggestions;
};

/**
 * التنبؤ بموعد الإتقان الكامل
 */
export const predictMastery = (sentences) => {
  if (!sentences || sentences.length === 0) {
    return {
      daysNeeded: 0,
      weeksNeeded: 0,
      estimatedDate: new Date()
    };
  }

  // حساب الجمل التي لم يتم إتقانها بعد
  const notMastered = sentences.filter(s => {
    const interval = s.interval || 0;
    const level = getLevelDetails(interval);
    return level.label !== 'excellent' && level.label !== 'mastered';
  }).length;

  if (notMastered === 0) {
    return {
      daysNeeded: 0,
      weeksNeeded: 0,
      estimatedDate: new Date()
    };
  }

  // افتراض: 15 مراجعة يومياً
  // كل جملة تحتاج في المتوسط 5 مراجعات للوصول للإتقان
  const reviewsPerDay = 15;
  const reviewsNeeded = notMastered * 5;
  const daysNeeded = Math.ceil(reviewsNeeded / reviewsPerDay);
  const weeksNeeded = Math.ceil(daysNeeded / 7);

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);

  return {
    daysNeeded,
    weeksNeeded,
    estimatedDate
  };
};

export default {
  calculateStats,
  getDueSentences,
  getSmartSuggestions,
  predictMastery
};
