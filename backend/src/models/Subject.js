const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Subject = sequelize.define('Subject', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  subjectCode: { type: DataTypes.STRING(20), allowNull: false },
  subjectName: { type: DataTypes.STRING(100), allowNull: false },
  subjectType: { type: DataTypes.ENUM('theoretical', 'practical', 'both'), defaultValue: 'theoretical' },
  credits: { type: DataTypes.INTEGER, defaultValue: 1 },
  department: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  principalId: { type: DataTypes.UUID, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ['subjectCode', 'principalId'] }],
})

module.exports = Subject
