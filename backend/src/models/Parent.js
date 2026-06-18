const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Parent = sequelize.define('Parent', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false, unique: true },
  principalId: { type: DataTypes.UUID, allowNull: true },
  occupation: { type: DataTypes.STRING(100) },
  emergencyContact: { type: DataTypes.STRING(20) },
})

module.exports = Parent
