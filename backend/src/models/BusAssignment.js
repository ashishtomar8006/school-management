const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const BusAssignment = sequelize.define('BusAssignment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  studentId: { type: DataTypes.UUID, allowNull: false },
  busId: { type: DataTypes.UUID, allowNull: false },
  pickupStop: { type: DataTypes.STRING(100), allowNull: false },
  assignedDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
})

module.exports = BusAssignment
