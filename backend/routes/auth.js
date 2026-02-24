const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { asyncHandler } = require('../middleware/asyncHandler');

// POST /api/auth/register
router.post('/register', asyncHandler(register));

// POST /api/auth/login
router.post('/login', asyncHandler(login));

module.exports = router;
