const { User, Student, Parent, ParentStudent, FeeRecord, Attendance } = require('../models')
const resolvePrincipalId = require('../utils/resolvePrincipalId')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')

const studentWithUser = {
  include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
}

// Resolve the principalId: principal uses their own id; others look up their profile


const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search, class: cls, section, principalId } = req.query
    const offset = (page - 1) * limit

    const userWhere = {}
    if (search) userWhere.name = { [Op.like]: `%${search}%` }

    const where = {}
    if (cls)     where.class   = cls
    if (section) where.section = section

    // Scope to school: use explicit param, or derive from the requester
    const resolvedPrincipalId = principalId || await resolvePrincipalId(req)
    if (resolvedPrincipalId) where.principalId = resolvedPrincipalId

    const { count, rows } = await Student.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', where: userWhere, attributes: { exclude: ['password'] } }],
      limit: parseInt(limit),
      offset,
      order: [[{ model: User, as: 'user' }, 'name', 'ASC']],
    })

    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, studentWithUser)
    if (!student) return sendError(res, 'Student not found.', 404)
    sendSuccess(res, student)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const {
      name, email, password, phone, address,
      rollNumber, class: cls, section,
      fatherName, motherName, dob, enrollmentDate, academicYear,
    } = req.body

    const principalId = await resolvePrincipalId(req)

    const user    = await User.create({ name, email, password: password || 'student123', phone, address, role: 'student' })
    const student = await Student.create({
      userId: user.id, principalId,
      rollNumber, class: cls, section,
      fatherName, motherName, dob, enrollmentDate, academicYear,
    })

    const result = await Student.findByPk(student.id, studentWithUser)
    sendSuccess(res, result, 'Student created successfully.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, studentWithUser)
    if (!student) return sendError(res, 'Student not found.', 404)

    const { name, email, phone, address, rollNumber, class: cls, section, fatherName, motherName, dob, enrollmentDate, isActive, academicYear } = req.body

    await student.user.update({ name, email, phone, address, isActive })
    await student.update({ rollNumber, class: cls, section, fatherName, motherName, dob, enrollmentDate, academicYear })

    const updated = await Student.findByPk(student.id, studentWithUser)
    sendSuccess(res, updated, 'Student updated successfully.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id, studentWithUser)
    if (!student) return sendError(res, 'Student not found.', 404)
    await student.user.update({ isActive: false })
    sendSuccess(res, null, 'Student deactivated successfully.')
  } catch (err) { next(err) }
}

const getAttendanceSummary = async (req, res, next) => {
  try {
    const student = await Student.findByPk(req.params.id)
    if (!student) return sendError(res, 'Student not found.', 404)

    const records = await Attendance.findAll({ where: { studentId: student.id } })
    const summary = {
      total:   records.length,
      present: records.filter(r => r.status === 'present').length,
      absent:  records.filter(r => r.status === 'absent').length,
      late:    records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
    }
    summary.percentage = summary.total ? Math.round((summary.present / summary.total) * 100) : 0
    sendSuccess(res, summary)
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove, getAttendanceSummary }
