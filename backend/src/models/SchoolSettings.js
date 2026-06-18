const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

// One settings row per principal (keyed by principalId)
const SchoolSettings = sequelize.define('SchoolSettings', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  principalId:      { type: DataTypes.UUID, allowNull: false, unique: true },
  schoolName:       { type: DataTypes.STRING(200), defaultValue: 'EduManage School' },
  tagline:          { type: DataTypes.STRING(200), defaultValue: 'Empowering Education' },
  address:          { type: DataTypes.TEXT },
  phone:            { type: DataTypes.STRING(30) },
  email:            { type: DataTypes.STRING(150) },
  website:          { type: DataTypes.STRING(255) },
  principalName:    { type: DataTypes.STRING(150), defaultValue: 'Principal' },
  logoDataUrl:      { type: DataTypes.TEXT('long') },
  signatureDataUrl: { type: DataTypes.TEXT('long') },
  themeColorId:     { type: DataTypes.STRING(30), defaultValue: 'teal' },
}, { tableName: 'school_settings', timestamps: true })

module.exports = SchoolSettings
