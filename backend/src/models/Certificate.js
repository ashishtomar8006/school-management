const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const Certificate = sequelize.define('Certificate', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  certificateNo:   { type: DataTypes.STRING(30), unique: true },
  studentId:       { type: DataTypes.UUID, allowNull: false },
  type:            { type: DataTypes.ENUM('character', 'transfer', 'bonafide', 'completion', 'sports', 'achievement'), allowNull: false },
  issuedDate:      { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  validUntil:      { type: DataTypes.DATEONLY },
  issuerName:      { type: DataTypes.STRING(100) },
  issuerDesignation: { type: DataTypes.STRING(100) },
  purpose:         { type: DataTypes.TEXT },
  remarks:         { type: DataTypes.TEXT },
  status:          { type: DataTypes.ENUM('active', 'revoked'), defaultValue: 'active' },
  principalId:     { type: DataTypes.UUID, allowNull: true },
})

Certificate.beforeCreate((cert) => {
  if (!cert.certificateNo) {
    cert.certificateNo = `CERT-${Date.now().toString().slice(-8)}`
  }
})

module.exports = Certificate
