const express = require('express');
const router = express.Router();
const { getAnalytics, getFeatureTrend } = require('../controllers/analyticsController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// GET /api/analytics  (protected — requires valid JWT)
router.get('/', authenticateToken, asyncHandler(getAnalytics));

// GET /api/analytics/trend/:feature  (protected)
router.get('/trend/:feature', authenticateToken, asyncHandler(getFeatureTrend));

module.exports = router;
