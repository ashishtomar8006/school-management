const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const StudentCategory = sequelize.define('StudentCategory', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  status:      { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  principalId: { type: DataTypes.UUID, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ['name', 'principalId'] }],
})

module.exports = StudentCategory
