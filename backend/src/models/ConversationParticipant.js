const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  conversationId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, { timestamps: false })

module.exports = ConversationParticipant
