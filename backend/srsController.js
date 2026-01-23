// ============================================
// SM-2 Algorithm Controller (Improved & Optimized)
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
// SM-2 Algorithm Core Implementation
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
  // Case 1: Failed Review (quality 0 or 1)
  // ============================================
  if (quality === 0 || quality === 1) {
    newReps = 0;
    newInterval = SM2.MIN_INTERVAL_DAYS;

    // Adjust ease factor
    if (quality === 0) {
      newEase = Math.max(SM2.MIN_EASE_FACTOR, currentEase - 0.2);
    } else {
      newEase = Math.max(SM2.MIN_EASE_FACTOR, currentEase - 0.15);
    }

    // Set next review time
    if (quality === 0) {
      nextReview = addMinutes(now, SM2.IMMEDIATE_REVIEW_MINUTES);
    } else {
      nextReview = addDays(now, 1);
    }
  }
  // ============================================
  // Case 2: Successful Review (quality 2 or 3)
  // ============================================
  else {
    // Calculate new interval
    if (currentReps === 0) {
      newInterval = 1;
    } else if (currentReps === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(currentInterval * currentEase);
    }

    newReps = currentReps + 1;

    // Adjust ease factor based on quality
    if (quality === 2) {
      newEase = currentEase + 0.05;
    } else if (quality === 3) {
      newEase = currentEase + 0.15;
    }

    // Apply interval constraints
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
