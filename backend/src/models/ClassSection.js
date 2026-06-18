const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ClassSection = sequelize.define('ClassSection', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  className: { type: DataTypes.STRING(20), allowNull: false },
  sectionName: { type: DataTypes.STRING(10), allowNull: false },
  classTeacherId: { type: DataTypes.UUID },
  capacity: { type: DataTypes.INTEGER, defaultValue: 40 },
  academicYear: { type: DataTypes.STRING(20) },
  room:           { type: DataTypes.STRING(20) },
  principalId:    { type: DataTypes.UUID, allowNull: true },
})

module.exports = ClassSection
