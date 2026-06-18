const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ExamResult = sequelize.define('ExamResult', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  examId:         { type: DataTypes.UUID, allowNull: false },
  studentId:      { type: DataTypes.UUID, allowNull: false },
  subject:        { type: DataTypes.STRING(100), allowNull: false },
  marksObtained:  { type: DataTypes.DECIMAL(5, 2) },
  maxMarks:       { type: DataTypes.INTEGER, defaultValue: 100 },
  grade:          { type: DataTypes.STRING(5) },
  status:         { type: DataTypes.ENUM('pass', 'fail', 'absent', 'pending'), defaultValue: 'pending' },
  remarks:        { type: DataTypes.STRING(255) },
  principalId:    { type: DataTypes.UUID, allowNull: true },
})

ExamResult.beforeSave((result) => {
  if (result.marksObtained !== null && result.maxMarks) {
    const pct = (result.marksObtained / result.maxMarks) * 100
    if (pct >= 90)      result.grade = 'A+'
    else if (pct >= 80) result.grade = 'A'
    else if (pct >= 70) result.grade = 'B+'
    else if (pct >= 60) result.grade = 'B'
    else if (pct >= 50) result.grade = 'C'
    else if (pct >= 40) result.grade = 'D'
    else                result.grade = 'F'
  }
})

module.exports = ExamResult
