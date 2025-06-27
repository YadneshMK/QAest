const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TestCase = sequelize.define('TestCase', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  testCaseId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'deprecated', 'archived', 'passed', 'failed', 'blocked', 'not_executed'),
    allowNull: false,
    defaultValue: 'draft'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  module: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  appType: {
    type: DataTypes.ENUM('web', 'mobile', 'desktop', 'api'),
    allowNull: false,
    defaultValue: 'web'
  },
  osType: {
    type: DataTypes.ENUM('windows', 'macos', 'linux', 'ios', 'android', 'cross_platform'),
    allowNull: false,
    defaultValue: 'cross_platform'
  },
  environment: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'test'
  },
  prerequisites: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testSteps: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  expectedResults: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  testData: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estimatedTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  prdLink: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  externalLinks: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  epicId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'epics',
      key: 'id'
    }
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  lockReason: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'test_cases',
  indexes: [
    {
      fields: ['test_case_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['epic_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['module']
    },
    {
      fields: ['app_type']
    },
    {
      fields: ['os_type']
    },
    {
      fields: ['is_locked']
    }
  ],
  hooks: {
    beforeCreate: async (testCase) => {
      if (!testCase.testCaseId) {
        // Generate test case ID
        const count = await TestCase.count();
        testCase.testCaseId = `TC-${String(count + 1).padStart(6, '0')}`;
      }
    },
    beforeUpdate: async (testCase) => {
      if (testCase.changed() && !testCase.changed('updatedAt')) {
        testCase.version += 1;
      }
    }
  }
});

// Instance methods
TestCase.prototype.canBeEditedBy = function(user) {
  if (this.isLocked) {
    return user.role === 'qa_lead';
  }
  return this.createdBy === user.id || ['qa_lead', 'senior_qa'].includes(user.role);
};

TestCase.prototype.canBeExecutedBy = function(user) {
  return ['qa_lead', 'senior_qa', 'junior_qa'].includes(user.role);
};

TestCase.prototype.getStepsCount = function() {
  return Array.isArray(this.testSteps) ? this.testSteps.length : 0;
};

module.exports = TestCase; 