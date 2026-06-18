const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ParentStudent = sequelize.define('ParentStudent', {
  parentId: { type: DataTypes.UUID, allowNull: false },
  studentId: { type: DataTypes.UUID, allowNull: false },
}, { timestamps: false })

module.exports = ParentStudent
