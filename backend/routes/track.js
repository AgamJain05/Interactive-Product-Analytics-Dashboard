const express = require('express');
const router = express.Router();
const { trackClick } = require('../controllers/trackController');
const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateToken } = require('../middleware/auth');

// POST /api/track  (protected)
router.post('/', authenticateToken, asyncHandler(trackClick));

module.exports = router;
