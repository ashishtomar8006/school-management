const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Notice = sequelize.define('Notice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM('general', 'academic', 'event', 'urgent'), defaultValue: 'general' },
  audience: { type: DataTypes.ENUM('all', 'teachers', 'students', 'parents', 'staff'), defaultValue: 'all' },
  createdById: { type: DataTypes.UUID, allowNull: false },
  expiryDate: { type: DataTypes.DATEONLY },
  attachments: { type: DataTypes.JSON, defaultValue: [] },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true },
  principalId: { type: DataTypes.UUID, allowNull: true },
})

module.exports = Notice
