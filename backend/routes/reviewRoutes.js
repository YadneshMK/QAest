const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get reviews
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Review system endpoint - Coming soon'
  });
});

module.exports = router; 