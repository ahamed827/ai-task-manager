const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeTaskWithAI } = require('../controllers/aiController');

// POST /api/ai/analyze
router.post('/analyze', protect, analyzeTaskWithAI);

module.exports = router;