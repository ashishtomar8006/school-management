const { User, Teacher, SalaryRecord } = require('../models')
const resolvePrincipalId = require('../utils/resolvePrincipalId')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')

const teacherWithUser = {
  include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }],
}

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 100, search, department, principalId } = req.query
    const offset = (page - 1) * limit

    const userWhere = {}
    if (search) userWhere.name = { [Op.like]: `%${search}%` }

    const where = {}
    if (department) where.department = department

    const resolvedPrincipalId = principalId || await resolvePrincipalId(req)
    if (resolvedPrincipalId) where.principalId = resolvedPrincipalId

    const { count, rows } = await Teacher.findAndCountAll({
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
    const teacher = await Teacher.findByPk(req.params.id, teacherWithUser)
    if (!teacher) return sendError(res, 'Teacher not found.', 404)
    sendSuccess(res, teacher)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, joinDate, department, qualification, experience, subjects, classes, employeeCode } = req.body

    const principalId = await resolvePrincipalId(req)

    const user    = await User.create({ name, email, password: password || 'teacher123', phone, address, joinDate, role: 'teacher' })
    const teacher = await Teacher.create({ userId: user.id, principalId, department, qualification, experience, subjects, classes, employeeCode })

    const result = await Teacher.findByPk(teacher.id, teacherWithUser)
    sendSuccess(res, result, 'Teacher created successfully.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, teacherWithUser)
    if (!teacher) return sendError(res, 'Teacher not found.', 404)

    const { name, email, phone, address, joinDate, department, qualification, experience, subjects, classes, employeeCode, isActive } = req.body

    await teacher.user.update({ name, email, phone, address, joinDate, isActive })
    await teacher.update({ department, qualification, experience, subjects, classes, employeeCode })

    const updated = await Teacher.findByPk(teacher.id, teacherWithUser)
    sendSuccess(res, updated, 'Teacher updated successfully.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, teacherWithUser)
    if (!teacher) return sendError(res, 'Teacher not found.', 404)
    await teacher.user.update({ isActive: false })
    sendSuccess(res, null, 'Teacher deactivated successfully.')
  } catch (err) { next(err) }
}

const getSalaryHistory = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id)
    if (!teacher) return sendError(res, 'Teacher not found.', 404)
    const records = await SalaryRecord.findAll({
      where: { teacherId: teacher.id },
      order: [['year', 'DESC'], ['month', 'DESC']],
    })
    sendSuccess(res, records)
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove, getSalaryHistory }
