const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for quick testing if PostgreSQL is not available
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './qaest_database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

module.exports = { sequelize };
