const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Complaint = sequelize.define('Complaint', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  complaintCode: { type: DataTypes.STRING(20), unique: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM('academic', 'discipline', 'bullying', 'facilities', 'other'), allowNull: false },
  status: { type: DataTypes.ENUM('open', 'in-progress', 'resolved', 'closed'), defaultValue: 'open' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  createdById: { type: DataTypes.UUID, allowNull: false },
  assignedToId: { type: DataTypes.UUID },
  resolution: { type: DataTypes.TEXT },
  resolvedAt:   { type: DataTypes.DATE },
  principalId:  { type: DataTypes.UUID, allowNull: true },
})

Complaint.beforeCreate((complaint) => {
  if (!complaint.complaintCode) {
    complaint.complaintCode = `CMP-${Date.now().toString().slice(-6)}`
  }
})

module.exports = Complaint
