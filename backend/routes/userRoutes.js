const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticate, authorize(['qa_lead']), (req, res) => {
  res.json({
    success: true,
    message: 'User management endpoint - Coming soon'
  });
});

module.exports = router; 