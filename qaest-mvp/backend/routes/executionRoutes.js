const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get executions
router.get('/', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Test execution endpoint - Coming soon'
  });
});

module.exports = router;
