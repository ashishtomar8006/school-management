const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

// Standalone section identifiers — A, B, C, D, E
// Used as a reference when creating actual ClassSection records
const Section = sequelize.define('Section', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(20), allowNull: false },
  status:      { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  principalId: { type: DataTypes.UUID, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ['name', 'principalId'] }],
})

module.exports = Section
