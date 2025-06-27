const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const TestCase = require('../models/TestCase');
const User = require('../models/User');

// Get all test cases with filtering and pagination
const getTestCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      module,
      appType,
      osType,
      createdBy,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (module) where.module = module;
    if (appType) where.appType = appType;
    if (osType) where.osType = osType;
    if (createdBy) where.createdBy = createdBy;

    // Search functionality
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { testCaseId: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await TestCase.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        testCases: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single test case by ID
const getTestCase = async (req, res) => {
  try {
    const { id } = req.params;

    const testCase = await TestCase.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    res.json({
      success: true,
      data: { testCase }
    });
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new test case
const createTestCase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const testCaseData = {
      ...req.body,
      createdBy: req.user.id,
      updatedBy: req.user.id
    };

    const testCase = await TestCase.create(testCaseData);

    // Fetch the created test case with associations
    const createdTestCase = await TestCase.findByPk(testCase.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Test case created successfully',
      data: { testCase: createdTestCase }
    });
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update test case
const updateTestCase = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const testCase = await TestCase.findByPk(id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    // Check if user can edit this test case
    if (!testCase.canBeEditedBy(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this test case'
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id
    };

    await testCase.update(updateData);

    // Fetch updated test case with associations
    const updatedTestCase = await TestCase.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Test case updated successfully',
      data: { testCase: updatedTestCase }
    });
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete test case
const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const testCase = await TestCase.findByPk(id);

    if (!testCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    // Check if user can delete this test case
    if (!testCase.canBeEditedBy(req.user)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this test case'
      });
    }

    // Check if test case is locked
    if (testCase.isLocked && req.user.role !== 'qa_lead') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete locked test case. Contact QA Lead for permission.'
      });
    }

    await testCase.destroy();

    res.json({
      success: true,
      message: 'Test case deleted successfully'
    });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get test cases by user
const getMyTestCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { createdBy: req.user.id };

    if (status) where.status = status;
    if (priority) where.priority = priority;

    const { count, rows } = await TestCase.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        testCases: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my test cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Duplicate test case
const duplicateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const originalTestCase = await TestCase.findByPk(id);

    if (!originalTestCase) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found'
      });
    }

    // Create duplicate with modified title
    const duplicateData = {
      ...originalTestCase.toJSON(),
      id: undefined,
      testCaseId: undefined, // Will be auto-generated
      title: `${originalTestCase.title} (Copy)`,
      createdBy: req.user.id,
      updatedBy: req.user.id,
      version: 1,
      isLocked: false,
      lockReason: null
    };

    const duplicatedTestCase = await TestCase.create(duplicateData);

    // Fetch with associations
    const result = await TestCase.findByPk(duplicatedTestCase.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Test case duplicated successfully',
      data: { testCase: result }
    });
  } catch (error) {
    console.error('Duplicate test case error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  deleteTestCase,
  getMyTestCases,
  duplicateTestCase
}; 