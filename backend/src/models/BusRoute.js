const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const BusRoute = sequelize.define('BusRoute', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  routeName: { type: DataTypes.STRING(100), allowNull: false },
  startPoint: { type: DataTypes.STRING(100), allowNull: false },
  endPoint: { type: DataTypes.STRING(100), defaultValue: 'School' },
  totalDistance: { type: DataTypes.STRING(20) },
  estimatedTime: { type: DataTypes.STRING(20) },
  status:        { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  principalId:   { type: DataTypes.UUID, allowNull: true },
})

module.exports = BusRoute
