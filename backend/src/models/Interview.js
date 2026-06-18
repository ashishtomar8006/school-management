const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Interview = sequelize.define('Interview', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  position: { type: DataTypes.STRING(100), allowNull: false },
  department: { type: DataTypes.STRING(100) },
  qualifications: { type: DataTypes.TEXT },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  resume: { type: DataTypes.STRING(500) },
  appliedDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  status: {
    type: DataTypes.ENUM('applied', 'shortlisted', 'interview_scheduled', 'offered', 'rejected', 'selected'),
    defaultValue: 'applied',
  },
  interviewDate: { type: DataTypes.DATEONLY },
  interviewTime: { type: DataTypes.STRING(10) },
  interviewerId: { type: DataTypes.UUID },
  feedback: { type: DataTypes.TEXT },
  rating:        { type: DataTypes.INTEGER, validate: { min: 1, max: 5 } },
  principalId:   { type: DataTypes.UUID, allowNull: true },
})

module.exports = Interview
