const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const RouteStop = sequelize.define('RouteStop', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  routeId: { type: DataTypes.UUID, allowNull: false },
  stopName: { type: DataTypes.STRING(100), allowNull: false },
  pickupTime: { type: DataTypes.STRING(10), allowNull: false },
  dropTime: { type: DataTypes.STRING(10), allowNull: false },
  order: { type: DataTypes.INTEGER, allowNull: false },
  landmark: { type: DataTypes.STRING(200) },
})

module.exports = RouteStop
