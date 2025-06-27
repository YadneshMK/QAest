const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get epics
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Epic management endpoint - Coming soon'
  });
});

module.exports = router;
