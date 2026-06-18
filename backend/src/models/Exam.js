const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Exam = sequelize.define('Exam', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:         { type: DataTypes.STRING(150), allowNull: false },
  examType:     { type: DataTypes.ENUM('unit_test', 'midterm', 'final', 'quarterly', 'half_yearly', 'annual', 'other'), defaultValue: 'final' },
  class:        { type: DataTypes.STRING(20) },
  section:      { type: DataTypes.STRING(10) },
  academicYear: { type: DataTypes.STRING(20) },
  startDate:    { type: DataTypes.DATEONLY },
  endDate:      { type: DataTypes.DATEONLY },
  totalMarks:   { type: DataTypes.INTEGER, defaultValue: 100 },
  passingMarks: { type: DataTypes.INTEGER, defaultValue: 35 },
  status:       { type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'), defaultValue: 'upcoming' },
  description:  { type: DataTypes.TEXT },
  principalId:  { type: DataTypes.UUID, allowNull: true },
})

module.exports = Exam
