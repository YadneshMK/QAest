const { sequelize } = require('../config/database');
const User = require('./User');
const TestCase = require('./TestCase');

// Define associations
User.hasMany(TestCase, {
  foreignKey: 'createdBy',
  as: 'createdTestCases'
});

User.hasMany(TestCase, {
  foreignKey: 'updatedBy',
  as: 'updatedTestCases'
});

TestCase.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

TestCase.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater'
});

module.exports = {
  sequelize,
  User,
  TestCase
}; 