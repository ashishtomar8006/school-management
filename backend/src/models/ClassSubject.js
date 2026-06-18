const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

// Junction table linking a ClassSection to a Subject
// A section can have many subjects; a subject can be taught in many sections
const ClassSubject = sequelize.define('ClassSubject', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  classSectionId: { type: DataTypes.UUID, allowNull: false },
  subjectId:      { type: DataTypes.UUID, allowNull: false },
  teacherId:      { type: DataTypes.UUID },   // who teaches this subject in this section
}, {
  indexes: [{ unique: true, fields: ['classSectionId', 'subjectId'] }],
})

module.exports = ClassSubject
