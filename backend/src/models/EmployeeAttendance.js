const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const EmployeeAttendance = sequelize.define('EmployeeAttendance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employeeId: { type: DataTypes.UUID, allowNull: false },
  employeeType: { type: DataTypes.ENUM('teacher', 'admin', 'support'), allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  checkInTime: { type: DataTypes.STRING(10) },
  checkOutTime: { type: DataTypes.STRING(10) },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'leave'), allowNull: false },
  leaveType: { type: DataTypes.STRING(50) },
  remarks: { type: DataTypes.STRING(255) },
}, {
  indexes: [{ unique: true, fields: ['employeeId', 'date'] }],
})

module.exports = EmployeeAttendance
