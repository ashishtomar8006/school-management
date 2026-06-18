const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Student = sequelize.define('Student', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false, unique: true },
  principalId: { type: DataTypes.UUID, allowNull: true },
  rollNumber: { type: DataTypes.STRING(20), allowNull: false },
  class: { type: DataTypes.STRING(20), allowNull: false },
  section: { type: DataTypes.STRING(10), allowNull: false },
  fatherName: { type: DataTypes.STRING(100) },
  motherName: { type: DataTypes.STRING(100) },
  dob: { type: DataTypes.DATEONLY },
  enrollmentDate: { type: DataTypes.DATEONLY },
  academicYear: { type: DataTypes.STRING(20) },
})

module.exports = Student
