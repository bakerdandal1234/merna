// ============================================
// 🎯 SM-2 Algorithm Utilities (Frontend)
// ============================================

// دالة لحساب الجمل المستحقة
export const getDueSentences = (sentences) => {
  const now = new Date();
  return sentences.filter(s => {
    if (!s.nextReview) return true; // جمل جديدة
    return new Date(s.nextReview) <= now;
  });
};

// دالة للحصول على تفاصيل المستوى
export const getLevelDetails = (interval) => {
  const levels = [
    { threshold: 0, label: 'new', emoji: '🆕', color: '#6366f1', text: 'جديد' },
    { threshold: 1, label: 'learning', emoji: '📚', color: '#8b5cf6', text: 'تعلّم' },
    { threshold: 4, label: 'hard', emoji: '😅', color: '#f59e0b', text: 'صعب' },
    { threshold: 10, label: 'good', emoji: '👍', color: '#10b981', text: 'جيد' },
    { threshold: 30, label: 'excellent', emoji: '⭐', color: '#3b82f6', text: 'ممتاز' },
    { threshold: 365, label: 'mastered', emoji: '🏆', color: '#ef4444', text: 'مُتقن' }
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (interval >= levels[i].threshold) {
      return levels[i];
    }
  }
  
  return levels[0];
};

// دالة لحساب الأداء العام
export const calculateOverallStats = (sentences) => {
  if (!sentences || sentences.length === 0) {
    return {
      totalSentences: 0,
      totalReviews: 0,
      accuracy: 0,
      averageInterval: 0,
      levelDistribution: {
        new: 0,
        learning: 0,
        hard: 0,
        good: 0,
        excellent: 0,
        mastered: 0
      }
    };
  }

  const totalReviews = sentences.reduce((sum, s) => sum + (s.reviewCount || 0), 0);
  const totalCorrect = sentences.reduce((sum, s) => sum + (s.correctCount || 0), 0);
  const totalInterval = sentences.reduce((sum, s) => sum + (s.interval || 0), 0);

  const levelDistribution = {
    new: 0,
    learning: 0,
    hard: 0,
    good: 0,
    excellent: 0,
    mastered: 0
  };

  sentences.forEach(s => {
    const level = s.reviewLevel || 'new';
    if (levelDistribution.hasOwnProperty(level)) {
      levelDistribution[level]++;
    }
  });

  return {
    totalSentences: sentences.length,
    totalReviews,
    accuracy: totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0,
    averageInterval: sentences.length > 0 ? Math.round(totalInterval / sentences.length) : 0,
    levelDistribution
  };
};

// دالة لتحويل الأيام إلى نص مفهوم
export const formatInterval = (days) => {
  if (days === 0) return 'جديد';
  if (days === 1) return 'يوم واحد';
  if (days === 2) return 'يومين';
  if (days < 10) return `${days} أيام`;
  if (days < 30) return `${days} يوم`;
  if (days < 60) return 'شهر تقريباً';
  if (days < 90) return 'شهرين تقريباً';
  if (days < 180) return `${Math.round(days / 30)} أشهر`;
  if (days < 365) return `${Math.round(days / 30)} شهر`;
  return 'سنة أو أكثر';
};

// دالة لتنسيق التاريخ
export const formatDate = (date) => {
  if (!date) return '-';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = d - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'مستحق الآن';
  if (diffDays === 0) return 'اليوم';
  if (diffDays === 1) return 'غداً';
  if (diffDays === 2) return 'بعد يومين';
  if (diffDays < 7) return `بعد ${diffDays} أيام`;
  if (diffDays < 14) return 'بعد أسبوع تقريباً';
  if (diffDays < 30) return `بعد ${Math.round(diffDays / 7)} أسابيع`;
  if (diffDays < 60) return 'بعد شهر تقريباً';
  
  return d.toLocaleDateString('ar-EG', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// دالة للحصول على رسالة تحفيزية بناءً على التقييم
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

  // رسائل خاصة للـ Streak
  if (streak >= 5) {
    return `🔥 Streak مذهل: ${streak} إجابة صحيحة متتالية!`;
  } else if (streak >= 3) {
    return `⚡ أداء ممتاز! ${streak} متتالية!`;
  }

  const messageList = messages[quality] || messages[0];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

// دالة لحساب النسبة المئوية للتقدم
export const calculateProgress = (sentences) => {
  if (!sentences || sentences.length === 0) return 0;
  
  const mastered = sentences.filter(s => 
    s.reviewLevel === 'excellent' || s.reviewLevel === 'mastered'
  ).length;
  
  return Math.round((mastered / sentences.length) * 100);
};

export default {
  getDueSentences,
  getLevelDetails,
  calculateOverallStats,
  formatInterval,
  formatDate,
  getMotivationalMessage,
  calculateProgress
};
