const express = require('express');
const {
  getSentences,
  getMySentences,
  createSentence,
  reviewSentence,
  getDueSentences,
  updateSentence,
  deleteSentence,
  resetSentences,
  getStats
} = require('../controllers/sentenceController');
const { protect } = require('../middleware/auth');
const { checkSentenceOwnership } = require('../middleware/checkOwnership');
const {
  sentenceValidation,
  reviewValidation,
  validateRequest
} = require('../utils/validation');
const Sentence = require('../models/Sentence');

const router = express.Router();

// ============================================
// All routes are protected
// ============================================
router.use(protect);

// ============================================
// GET Routes
// ============================================

// Get all sentences with pagination and filters
router.get('/', getSentences);

// Get current user's sentences only
router.get('/my-sentences', getMySentences);

// Get sentences due for review
router.get('/due', getDueSentences);

// Get statistics
router.get('/stats', getStats);

// ============================================
// POST Routes
// ============================================

// Create new sentence
router.post(
  '/',
  sentenceValidation,
  validateRequest,
  createSentence
);

// Review sentence with SM-2
router.post(
  '/:id/review',
  reviewValidation,
  validateRequest,
  reviewSentence
);

// Reset all sentences
router.post('/reset', resetSentences);

// ============================================
// PUT Routes (Owner Only)
// ============================================

// Update sentence
router.put(
  '/:id',
  checkSentenceOwnership(Sentence),
  updateSentence
);

// ============================================
// DELETE Routes (Owner Only)
// ============================================

// Delete sentence
router.delete(
  '/:id',
  checkSentenceOwnership(Sentence),
  deleteSentence
);

module.exports = router;
