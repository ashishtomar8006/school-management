const { ClassSection, Subject, ClassRoom, ClassSubject, Teacher, Student, User } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

// ── Sections ───────────────────────────────────────────────────────────────────

const listSections = async (req, res, next) => {
  try {
    const { academicYear } = req.query
    const where = {}
    if (academicYear) where.academicYear = academicYear

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const sections = await ClassSection.findAll({
      where,
      include: [{ model: Teacher, as: 'classTeacher', include: [{ model: User, as: 'user', attributes: ['name'] }], required: false }],
      order: [['className', 'ASC'], ['sectionName', 'ASC']],
    })
    sendSuccess(res, sections)
  } catch (err) { next(err) }
}

const createSection = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const section = await ClassSection.create({ ...req.body, principalId })
    sendSuccess(res, section, 'Class section created.', 201)
  } catch (err) { next(err) }
}

const updateSection = async (req, res, next) => {
  try {
    const section = await ClassSection.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)
    await section.update(req.body)
    sendSuccess(res, section, 'Section updated.')
  } catch (err) { next(err) }
}

const deleteSection = async (req, res, next) => {
  try {
    const section = await ClassSection.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)
    await section.destroy()
    sendSuccess(res, null, 'Section deleted.')
  } catch (err) { next(err) }
}

const getClassStudents = async (req, res, next) => {
  try {
    const section = await ClassSection.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)

    const students = await Student.findAll({
      where: { class: section.className, section: section.sectionName },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
      order: [[{ model: User, as: 'user' }, 'name', 'ASC']],
    })
    sendSuccess(res, students)
  } catch (err) { next(err) }
}

// ── Subjects ───────────────────────────────────────────────────────────────────

const listSubjects = async (req, res, next) => {
  try {
    const { department } = req.query
    const where = {}
    if (department) where.department = department

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const subjects = await Subject.findAll({ where, order: [['subjectName', 'ASC']] })
    sendSuccess(res, subjects)
  } catch (err) { next(err) }
}

const createSubject = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const subject = await Subject.create({ ...req.body, principalId })
    sendSuccess(res, subject, 'Subject created.', 201)
  } catch (err) { next(err) }
}

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id)
    if (!subject) return sendError(res, 'Subject not found.', 404)
    await subject.update(req.body)
    sendSuccess(res, subject, 'Subject updated.')
  } catch (err) { next(err) }
}

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id)
    if (!subject) return sendError(res, 'Subject not found.', 404)
    await subject.destroy()
    sendSuccess(res, null, 'Subject deleted.')
  } catch (err) { next(err) }
}

// ── Classrooms ─────────────────────────────────────────────────────────────────

const listRooms = async (req, res, next) => {
  try {
    const { maintenanceStatus } = req.query
    const where = {}
    if (maintenanceStatus) where.maintenanceStatus = maintenanceStatus

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const rooms = await ClassRoom.findAll({ where, order: [['roomNumber', 'ASC']] })
    sendSuccess(res, rooms)
  } catch (err) { next(err) }
}

const createRoom = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const room = await ClassRoom.create({ ...req.body, principalId })
    sendSuccess(res, room, 'Classroom created.', 201)
  } catch (err) { next(err) }
}

const updateRoom = async (req, res, next) => {
  try {
    const room = await ClassRoom.findByPk(req.params.id)
    if (!room) return sendError(res, 'Classroom not found.', 404)
    await room.update(req.body)
    sendSuccess(res, room, 'Classroom updated.')
  } catch (err) { next(err) }
}

// ── ClassSection ↔ Subject assignment ─────────────────────────────────────────

const getSectionSubjects = async (req, res, next) => {
  try {
    const section = await ClassSection.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)

    const subjects = await ClassSubject.findAll({
      where: { classSectionId: req.params.id },
      include: [
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name'] }], required: false },
      ],
    })
    sendSuccess(res, subjects)
  } catch (err) { next(err) }
}

const assignSubject = async (req, res, next) => {
  try {
    const section = await ClassSection.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)

    const { subjectId, teacherId } = req.body
    if (!subjectId) return sendError(res, 'subjectId is required.', 400)

    const subject = await Subject.findByPk(subjectId)
    if (!subject) return sendError(res, 'Subject not found.', 404)

    const [record, created] = await ClassSubject.upsert({
      classSectionId: section.id,
      subjectId,
      teacherId: teacherId || null,
    }, { returning: true })

    const result = await ClassSubject.findByPk(record.id, {
      include: [
        { model: Subject, as: 'subject' },
        { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name'] }], required: false },
      ],
    })
    sendSuccess(res, result, created ? 'Subject assigned to section.' : 'Subject assignment updated.', 201)
  } catch (err) { next(err) }
}

const removeSubject = async (req, res, next) => {
  try {
    const deleted = await ClassSubject.destroy({
      where: { classSectionId: req.params.id, subjectId: req.params.subjectId },
    })
    if (!deleted) return sendError(res, 'Subject assignment not found.', 404)
    sendSuccess(res, null, 'Subject removed from section.')
  } catch (err) { next(err) }
}

module.exports = {
  listSections, createSection, updateSection, deleteSection, getClassStudents,
  listSubjects, createSubject, updateSubject, deleteSubject,
  listRooms, createRoom, updateRoom,
  getSectionSubjects, assignSubject, removeSubject,
}
