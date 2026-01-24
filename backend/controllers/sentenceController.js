const Sentence = require('../models/Sentence');
const { updateCardState, calculateSentenceStats } = require('../srsController');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { HTTP_STATUS, ERRORS, PAGINATION } = require('../config/constants');
const { Logger } = require('../utils/logger');

// ============================================
// Helper: Validate and parse pagination params
// ============================================
const getPaginationParams = (query) => {
  const page = Math.max(PAGINATION.DEFAULT_PAGE, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(PAGINATION.MIN_LIMIT, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

// ============================================
// Helper: Build filters from query params
// ============================================
const buildFilters = (query, userId = null) => {
  const filters = {};
  
  if (userId) {
    filters.userId = userId;
  }
  
  if (query.level) {
    filters.reviewLevel = query.level;
  }
  
  if (query.favorite === 'true') {
    filters.favorite = true;
  }
  
  if (query.due === 'true') {
    filters.nextReview = { $lte: new Date() };
  }
  
  return filters;
};

// ============================================
// Helper: Get sort criteria
// ============================================
const getSortCriteria = (sortParam) => {
  const sortOptions = {
    nextReview: { nextReview: 1 },
    interval: { interval: -1 },
    german: { german: 1 },
    default: { createdAt: -1 }
  };
  
  return sortOptions[sortParam] || sortOptions.default;
};

// ============================================
// Helper: Format interval for display
// ============================================
const formatInterval = (interval) => {
  if (interval === 0 || interval < 0.01) {
    return { value: 10, unit: 'minutes' };
  }
  
  if (interval < 1) {
    const minutes = Math.round(interval * 24 * 60);
    if (minutes < 60) {
      return { value: minutes, unit: 'minutes' };
    }
    const hours = Math.round(minutes / 60);
    return { value: hours, unit: 'hours' };
  }
  
  if (interval === 1) {
    return { value: 1, unit: 'day' };
  }
  
  return { value: Math.round(interval), unit: 'days' };
};

// ============================================
// Helper: Get quality label
// ============================================
const getQualityLabel = (quality) => {
  const labels = {
    0: 'Again',
    1: 'Hard', 
    2: 'Good',
    3: 'Excellent'
  };
  return labels[quality] || 'Unknown';
};

// ============================================
// @desc    جلب جميع الجمل مع Pagination
// @route   GET /api/sentences
// @access  Private
// ============================================
exports.getSentences = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filters = buildFilters(req.query);
  const sort = getSortCriteria(req.query.sort);

  // Parallel execution for better performance
  const [sentences, total] = await Promise.all([
    Sentence.find(filters)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select('-reviewHistory') // Optimize by excluding large arrays
      .lean(),
    Sentence.countDocuments(filters)
  ]);

  // Add stats and ownership info
  const sentencesWithStats = sentences.map(s => {
    const stats = calculateSentenceStats(s);
    const isOwner = s.userId && req.user._id && 
                    s.userId.toString() === req.user._id.toString();
    return { ...s, stats, isOwner };
  });

  res.json({
    success: true,
    count: sentencesWithStats.length,
    data: sentencesWithStats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// ============================================
// @desc    جلب جمل المستخدم فقط
// @route   GET /api/sentences/my-sentences
// @access  Private
// ============================================
exports.getMySentences = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const filters = buildFilters(req.query, req.user._id);
  const sort = getSortCriteria(req.query.sort);

  const [sentences, total] = await Promise.all([
    Sentence.find(filters)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select('-reviewHistory') // Optimize by excluding large arrays
      .lean(),
    Sentence.countDocuments(filters)
  ]);

  const sentencesWithStats = sentences.map(s => ({
    ...s,
    stats: calculateSentenceStats(s),
    isOwner: true
  }));

  res.json({
    success: true,
    count: sentencesWithStats.length,
    data: sentencesWithStats,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  });
});

// ============================================
// @desc    إضافة جملة جديدة
// @route   POST /api/sentences
// @access  Private
// ============================================
exports.createSentence = asyncHandler(async (req, res, next) => {
  const { german, arabic } = req.body;

  // Normalize text for better duplicate detection
  const normalizedGerman = german.trim().toLowerCase();

  // Check for duplicate (case-insensitive)
  const existingSentence = await Sentence.findOne({
    userId: req.user._id,
    german: { $regex: new RegExp(`^${normalizedGerman.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  });

  if (existingSentence) {
    return next(new AppError(ERRORS.SENTENCE_EXISTS, HTTP_STATUS.BAD_REQUEST));
  }

  const newSentence = await Sentence.create({
    userId: req.user._id,
    german: german.trim(),
    arabic: arabic.trim()
  });

  Logger.info('Sentence created', {
    userId: req.user._id,
    sentenceId: newSentence._id
  });

  const stats = calculateSentenceStats(newSentence.toObject());

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: '✅ تم إضافة الجملة بنجاح',
    data: { ...newSentence.toObject(), stats }
  });
});

// ============================================
// @desc    مراجعة الجملة بنظام SM-2
// @route   POST /api/sentences/:id/review
// @access  Private
// ============================================
exports.reviewSentence = asyncHandler(async (req, res, next) => {
  const { quality } = req.body;

  // Find original sentence
  const originalSentence = await Sentence.findById(req.params.id);

  if (!originalSentence) {
    return next(new AppError(ERRORS.SENTENCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
  }

  if (!originalSentence.userId) {
    return next(new AppError('خطأ في بيانات الجملة - userId مفقود', HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }

  // Check ownership
  const isOwner = originalSentence.userId.toString() === req.user._id.toString();

  let sentence;
  let wasCreated = false;

  if (isOwner) {
    // User owns this sentence - update directly
    sentence = originalSentence;
  } else {
    // User doesn't own it - find or create their copy
    let userSentence = await Sentence.findOne({
      userId: req.user._id,
      german: originalSentence.german,
      arabic: originalSentence.arabic
    });

    if (!userSentence) {
      userSentence = await Sentence.create({
        userId: req.user._id,
        german: originalSentence.german,
        arabic: originalSentence.arabic
      });
      wasCreated = true;
    }

    sentence = userSentence;
  }

  // Store previous state before update
  const previousInterval = sentence.interval || 0;
  const previousEaseFactor = sentence.easeFactor || 2.5;
  const previousRepetitions = sentence.repetitions || 0;
  const previousLevel = sentence.reviewLevel || 'new';

  // Apply SM-2 algorithm
  const newState = updateCardState(sentence, quality);

  // Update sentence using instance method
  sentence.updateReviewState(newState, quality);
  await sentence.save();

  Logger.info('Sentence reviewed', {
    userId: req.user._id,
    sentenceId: sentence._id,
    quality,
    newLevel: newState.reviewLevel
  });

  const stats = calculateSentenceStats(sentence.toObject());

  // Format intervals for display
  const previousFormatted = formatInterval(previousInterval);
  const newFormatted = formatInterval(newState.interval);

  res.json({
    success: true,
    message: wasCreated
      ? '✅ تم إنشاء نسخة خاصة بك وتحديثها'
      : '✅ تم تحديث البطاقة بنجاح',
    data: {
      ...sentence.toObject(),
      stats,
      isOwner: isOwner || wasCreated
    },
    sm2Result: {
      // Full SM-2 calculation results
      interval: newState.interval,
      intervalFormatted: newFormatted,
      nextReview: newState.nextReview,
      nextReviewDate: newState.nextReview.toISOString(),
      easeFactor: newState.easeFactor,
      repetitions: newState.repetitions,
      reviewLevel: newState.reviewLevel,
      quality: quality,
      qualityLabel: getQualityLabel(quality),
      
      // Previous state for comparison
      previousState: {
        interval: previousInterval,
        intervalFormatted: previousFormatted,
        easeFactor: previousEaseFactor,
        repetitions: previousRepetitions,
        reviewLevel: previousLevel
      }
    },
    changes: {
      intervalChange: `${previousFormatted.value} ${previousFormatted.unit} → ${newFormatted.value} ${newFormatted.unit}`,
      levelChange: `${previousLevel} → ${newState.reviewLevel}`,
      nextReviewDate: newState.nextReview.toLocaleDateString('ar-EG'),
      nextReviewTime: newState.nextReview.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    },
    wasCreated
  });
});

// ============================================
// @desc    الجمل المستحقة للمراجعة
// @route   GET /api/sentences/due
// @access  Private
// ============================================
exports.getDueSentences = asyncHandler(async (req, res) => {
  const limit = Math.min(PAGINATION.MAX_LIMIT, parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT);

  const dueSentences = await Sentence.find({
    userId: req.user._id,
    nextReview: { $lte: new Date() }
  })
    .sort({ nextReview: 1, easeFactor: 1 }) // Prioritize harder cards
    .limit(limit)
    .select('-reviewHistory')
    .lean();

  const sentencesWithStats = dueSentences.map(s => ({
    ...s,
    stats: calculateSentenceStats(s),
    isOwner: true
  }));

  res.json({
    success: true,
    count: sentencesWithStats.length,
    data: sentencesWithStats,
    message: sentencesWithStats.length === 0 ? 'لا توجد جمل للمراجعة الآن' : undefined
  });
});

// ============================================
// @desc    تعديل الجملة
// @route   PUT /api/sentences/:id
// @access  Private (Owner only)
// ============================================
exports.updateSentence = asyncHandler(async (req, res) => {
  const { german, arabic, favorite } = req.body;

  // req.sentence is set by checkOwnership middleware
  const sentence = req.sentence;

  if (german !== undefined) sentence.german = german;
  if (arabic !== undefined) sentence.arabic = arabic;
  if (favorite !== undefined) sentence.favorite = favorite;

  await sentence.save();

  const stats = calculateSentenceStats(sentence.toObject());

  res.json({
    success: true,
    message: '✅ تم تعديل الجملة بنجاح',
    data: { ...sentence.toObject(), stats }
  });
});

// ============================================
// @desc    حذف الجملة
// @route   DELETE /api/sentences/:id
// @access  Private (Owner only)
// ============================================
exports.deleteSentence = asyncHandler(async (req, res) => {
  const sentenceId = req.params.id;
  
  await Sentence.findByIdAndDelete(sentenceId);

  Logger.info('Sentence deleted', {
    userId: req.user._id,
    sentenceId
  });

  res.json({
    success: true,
    message: '🗑️ تم حذف الجملة بنجاح'
  });
});

// ============================================
// @desc    إعادة تعيين البطاقات
// @route   POST /api/sentences/reset
// @access  Private
// ============================================
exports.resetSentences = asyncHandler(async (req, res) => {
  const result = await Sentence.updateMany(
    { userId: req.user._id },
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
});

// ============================================
// @desc    الإحصائيات
// @route   GET /api/stats
// @access  Private
// ============================================
exports.getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Run all queries in parallel for better performance
  const [total, levelCounts, dueCount, allSentences] = await Promise.all([
    Sentence.countDocuments({ userId }),
    Sentence.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$reviewLevel',
          count: { $sum: 1 }
        }
      }
    ]),
    Sentence.countDocuments({
      userId,
      nextReview: { $lte: new Date() }
    }),
    Sentence.find({ userId }).select('reviewCount correctCount').lean()
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

  stats.due = dueCount;

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
});
