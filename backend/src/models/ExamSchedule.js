const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ExamSchedule = sequelize.define('ExamSchedule', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  examId:      { type: DataTypes.UUID, allowNull: false },
  subject:     { type: DataTypes.STRING(100), allowNull: false },
  date:        { type: DataTypes.DATEONLY, allowNull: false },
  startTime:   { type: DataTypes.STRING(10) },
  endTime:     { type: DataTypes.STRING(10) },
  room:        { type: DataTypes.STRING(50) },
  maxMarks:    { type: DataTypes.INTEGER, defaultValue: 100 },
  invigilator: { type: DataTypes.STRING(100) },
})

module.exports = ExamSchedule
