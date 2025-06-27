const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorizeMinRole } = require('../middleware/auth');
const {
  getTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getMyTestCases,
  duplicateTestCase
} = require('../controllers/testCaseController');

const router = express.Router();

// Validation rules
const testCaseValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title is required and must be max 200 characters'),
  body('priority')
    .optional()
    .isIn(['critical', 'high', 'medium', 'low'])
    .withMessage('Invalid priority'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'deprecated', 'archived', 'passed', 'failed', 'blocked', 'not_executed'])
    .withMessage('Invalid status'),
  body('appType')
    .optional()
    .isIn(['web', 'mobile', 'desktop', 'api'])
    .withMessage('Invalid app type'),
  body('osType')
    .optional()
    .isIn(['windows', 'macos', 'linux', 'ios', 'android', 'cross_platform'])
    .withMessage('Invalid OS type'),
  body('testSteps')
    .optional()
    .isArray()
    .withMessage('Test steps must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('estimatedTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated time must be a positive integer')
];

// Routes
router.get('/', authenticate, getTestCases);
router.get('/my', authenticate, getMyTestCases);
router.get('/:id', authenticate, getTestCase);
router.post('/', authenticate, authorizeMinRole('junior_qa'), testCaseValidation, createTestCase);
router.put('/:id', authenticate, authorizeMinRole('junior_qa'), testCaseValidation, updateTestCase);
router.delete('/:id', authenticate, authorizeMinRole('junior_qa'), deleteTestCase);
router.post('/:id/duplicate', authenticate, authorizeMinRole('junior_qa'), duplicateTestCase);

module.exports = router; 