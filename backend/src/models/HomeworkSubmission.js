const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const HomeworkSubmission = sequelize.define('HomeworkSubmission', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  homeworkId: { type: DataTypes.UUID, allowNull: false },
  studentId: { type: DataTypes.UUID, allowNull: false },
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  marks: { type: DataTypes.DECIMAL(5, 2) },
  feedback: { type: DataTypes.TEXT },
  attachments: { type: DataTypes.JSON, defaultValue: [] },
  status: { type: DataTypes.ENUM('submitted', 'graded', 'late'), defaultValue: 'submitted' },
}, {
  indexes: [{ unique: true, fields: ['homeworkId', 'studentId'] }],
})

module.exports = HomeworkSubmission
