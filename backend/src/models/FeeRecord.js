const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const FeeRecord = sequelize.define('FeeRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID, allowNull: false },
  feeStructureId: { type: DataTypes.UUID },
  feeType: { type: DataTypes.STRING(100), allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  paidDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('paid', 'pending', 'overdue'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.ENUM('cash', 'online', 'cheque', 'dd') },
  receiptNumber: { type: DataTypes.STRING(50) },
  remarks:        { type: DataTypes.STRING(255) },
  principalId:    { type: DataTypes.UUID, allowNull: true },
})

module.exports = FeeRecord
