const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ClassRoom = sequelize.define('ClassRoom', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  roomNumber:        { type: DataTypes.STRING(20), allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 40 },
  floor: { type: DataTypes.INTEGER, defaultValue: 0 },
  facilities: { type: DataTypes.JSON, defaultValue: [] },
  assignedClass: { type: DataTypes.STRING(30) },
  maintenanceStatus: { type: DataTypes.ENUM('good', 'fair', 'needs_repair'), defaultValue: 'good' },
  principalId:       { type: DataTypes.UUID, allowNull: true },
}, {
  indexes: [{ unique: true, fields: ['roomNumber', 'principalId'] }],
})

module.exports = ClassRoom
