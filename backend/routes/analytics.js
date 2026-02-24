const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// GET /api/analytics  (protected — requires valid JWT)
router.get('/', authenticateToken, asyncHandler(getAnalytics));

module.exports = router;
