const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Homework = sequelize.define('Homework', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  subject: { type: DataTypes.STRING(100), allowNull: false },
  class: { type: DataTypes.STRING(20), allowNull: false },
  section: { type: DataTypes.STRING(10) },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  assignedById: { type: DataTypes.UUID, allowNull: false },
  attachments: { type: DataTypes.JSON, defaultValue: [] },
  maxMarks:     { type: DataTypes.INTEGER, defaultValue: 100 },
  principalId:  { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'Homework' })

module.exports = Homework
