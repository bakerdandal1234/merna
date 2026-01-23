const mongoose = require('mongoose');
const { asyncHandler, AppError } = require('./errorHandler');
const { HTTP_STATUS, ERRORS } = require('../config/constants');

/**
 * Middleware للتحقق من أن المستخدم يملك الجملة
 * يُستخدم قبل عمليات UPDATE و DELETE
 */
const checkSentenceOwnership = (Sentence) => {
  return asyncHandler(async (req, res, next) => {
    const sentenceId = req.params.id;
    const userId = req.user._id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(sentenceId)) {
      return next(new AppError(ERRORS.INVALID_ID, HTTP_STATUS.BAD_REQUEST));
    }

    // Find sentence
    const sentence = await Sentence.findById(sentenceId);

    if (!sentence) {
      return next(new AppError(ERRORS.SENTENCE_NOT_FOUND, HTTP_STATUS.NOT_FOUND));
    }

    // Check ownership
    if (!sentence.userId || sentence.userId.toString() !== userId.toString()) {
      return next(new AppError(ERRORS.NOT_OWNER, HTTP_STATUS.FORBIDDEN));
    }

    // Attach sentence to request for use in controller
    req.sentence = sentence;
    next();
  });
};

module.exports = { checkSentenceOwnership };
