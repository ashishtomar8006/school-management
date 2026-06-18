const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const SalaryRecord = sequelize.define('SalaryRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  teacherId: { type: DataTypes.UUID, allowNull: false },
  month: { type: DataTypes.STRING(20), allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  baseSalary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  da: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  hra: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  conveyance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  medicalAllowance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  otherAllowances: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  pf: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  otherDeductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  netSalary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'processed', 'paid'), defaultValue: 'pending' },
  paymentDate: { type: DataTypes.DATEONLY },
  paymentMethod: { type: DataTypes.STRING(50) },
  remarks:          { type: DataTypes.STRING(255) },
  principalId:      { type: DataTypes.UUID, allowNull: true },
})

module.exports = SalaryRecord
