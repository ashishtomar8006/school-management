const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'excused'), allowNull: false },
  remarks: { type: DataTypes.STRING(255) },
  markedById:  { type: DataTypes.UUID },
  principalId: { type: DataTypes.UUID, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ['studentId', 'date'] }],
})

module.exports = Attendance
