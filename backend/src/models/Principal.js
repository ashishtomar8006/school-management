const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const sequelize = require('../config/database')

const Principal = sequelize.define('Principal', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:       { type: DataTypes.STRING(100), allowNull: false },
  email:      { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password:   { type: DataTypes.STRING(255), allowNull: false },
  phone:      { type: DataTypes.STRING(20) },
  address:    { type: DataTypes.TEXT },
  schoolName: { type: DataTypes.STRING(200) },
  isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'Principals' })

Principal.beforeCreate(async (p) => {
  if (p.password) p.password = await bcrypt.hash(p.password, parseInt(process.env.BCRYPT_ROUNDS) || 12)
})

Principal.beforeUpdate(async (p) => {
  if (p.changed('password')) p.password = await bcrypt.hash(p.password, parseInt(process.env.BCRYPT_ROUNDS) || 12)
})

Principal.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = Principal
