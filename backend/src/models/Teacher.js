const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false, unique: true },
  principalId: { type: DataTypes.UUID, allowNull: true },
  department: { type: DataTypes.STRING(100) },
  qualification: { type: DataTypes.STRING(200) },
  experience: { type: DataTypes.INTEGER, defaultValue: 0 },
  subjects: { type: DataTypes.JSON, defaultValue: [] },
  classes: { type: DataTypes.JSON, defaultValue: [] },
  employeeCode: { type: DataTypes.STRING(50), unique: true },
})

module.exports = Teacher
