const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const sequelize = require('../config/database')

const Admin = sequelize.define('Admin', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING(255), allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'Admins' })

Admin.beforeCreate(async (a) => {
  if (a.password) a.password = await bcrypt.hash(a.password, parseInt(process.env.BCRYPT_ROUNDS) || 12)
})

Admin.beforeUpdate(async (a) => {
  if (a.changed('password')) a.password = await bcrypt.hash(a.password, parseInt(process.env.BCRYPT_ROUNDS) || 12)
})

Admin.prototype.validatePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

module.exports = Admin
