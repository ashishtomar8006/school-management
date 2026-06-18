const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const FeeStructure = sequelize.define('FeeStructure', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  class: { type: DataTypes.STRING(20), allowNull: false },
  section: { type: DataTypes.STRING(10) },
  feeType: { type: DataTypes.STRING(100), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  dueDate: { type: DataTypes.DATEONLY },
  frequency: { type: DataTypes.ENUM('monthly', 'quarterly', 'half-yearly', 'annual'), defaultValue: 'monthly' },
  academicYear: { type: DataTypes.STRING(20) },
  principalId:  { type: DataTypes.UUID, allowNull: true },
})

module.exports = FeeStructure
