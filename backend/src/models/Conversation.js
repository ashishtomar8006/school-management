const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING(200) },
  lastMessageAt: { type: DataTypes.DATE },
})

module.exports = Conversation
