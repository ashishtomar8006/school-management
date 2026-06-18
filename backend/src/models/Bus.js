const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Bus = sequelize.define('Bus', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  busNumber:          { type: DataTypes.STRING(20), allowNull: false },
  registrationNumber: { type: DataTypes.STRING(30), allowNull: false },
  driverName: { type: DataTypes.STRING(100), allowNull: false },
  driverPhone: { type: DataTypes.STRING(20) },
  conductorName: { type: DataTypes.STRING(100) },
  conductorPhone: { type: DataTypes.STRING(20) },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  routeId: { type: DataTypes.UUID },
  status: { type: DataTypes.ENUM('active', 'maintenance', 'inactive'), defaultValue: 'active' },
  yearOfManufacture:  { type: DataTypes.STRING(10) },
  principalId:        { type: DataTypes.UUID, allowNull: true },
}, {
  indexes: [
    { unique: true, fields: ['busNumber', 'principalId'] },
    { unique: true, fields: ['registrationNumber', 'principalId'] },
  ],
})

module.exports = Bus
