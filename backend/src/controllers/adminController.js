const { Principal, Student, Teacher, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')

// ─── List all principals ───────────────────────────────────────────────────────

const listPrincipals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const offset = (page - 1) * limit
    const where  = {}
    if (search) where[Op.or] = [
      { name:  { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ]

    const { count, rows } = await Principal.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit:  parseInt(limit),
      offset,
      order:  [['createdAt', 'DESC']],
    })

    // Attach school stats to each principal
    const enriched = await Promise.all(rows.map(async p => {
      const [studentCount, teacherCount] = await Promise.all([
        Student.count({ where: { principalId: p.id } }),
        Teacher.count({ where: { principalId: p.id } }),
      ])
      return { ...p.toJSON(), studentCount, teacherCount }
    }))

    sendPaginated(res, enriched, count, page, limit)
  } catch (err) { next(err) }
}

// ─── Get single principal ──────────────────────────────────────────────────────

const getPrincipal = async (req, res, next) => {
  try {
    const principal = await Principal.findByPk(req.params.id, { attributes: { exclude: ['password'] } })
    if (!principal) return sendError(res, 'Principal not found.', 404)

    const [studentCount, teacherCount] = await Promise.all([
      Student.count({ where: { principalId: principal.id } }),
      Teacher.count({ where: { principalId: principal.id } }),
    ])

    sendSuccess(res, { ...principal.toJSON(), studentCount, teacherCount })
  } catch (err) { next(err) }
}

// ─── Create principal ──────────────────────────────────────────────────────────

const createPrincipal = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, schoolName } = req.body
    if (!name || !email || !password) return sendError(res, 'Name, email and password are required.', 400)

    const exists = await Principal.findOne({ where: { email } })
    if (exists) return sendError(res, 'A principal with this email already exists.', 409)

    const principal = await Principal.create({ name, email, password, phone, address, schoolName })
    const safe = await Principal.findByPk(principal.id, { attributes: { exclude: ['password'] } })
    sendSuccess(res, safe, 'Principal created successfully.', 201)
  } catch (err) { next(err) }
}

// ─── Update principal ──────────────────────────────────────────────────────────

const updatePrincipal = async (req, res, next) => {
  try {
    const principal = await Principal.findByPk(req.params.id)
    if (!principal) return sendError(res, 'Principal not found.', 404)

    const { name, email, phone, address, schoolName, password } = req.body
    if (name       !== undefined) principal.name       = name
    if (email      !== undefined) principal.email      = email
    if (phone      !== undefined) principal.phone      = phone
    if (address    !== undefined) principal.address    = address
    if (schoolName !== undefined) principal.schoolName = schoolName
    if (password)                 principal.password   = password  // hook hashes it

    await principal.save()
    const safe = await Principal.findByPk(principal.id, { attributes: { exclude: ['password'] } })
    sendSuccess(res, safe, 'Principal updated successfully.')
  } catch (err) { next(err) }
}

// ─── Toggle active status ──────────────────────────────────────────────────────

const togglePrincipal = async (req, res, next) => {
  try {
    const principal = await Principal.findByPk(req.params.id)
    if (!principal) return sendError(res, 'Principal not found.', 404)

    principal.isActive = !principal.isActive
    await principal.save({ fields: ['isActive', 'updatedAt'] })
    const status = principal.isActive ? 'activated' : 'deactivated'
    const safe = await Principal.findByPk(principal.id, { attributes: { exclude: ['password'] } })
    sendSuccess(res, safe, `Principal ${status} successfully.`)
  } catch (err) { next(err) }
}

// ─── Delete principal ──────────────────────────────────────────────────────────

const deletePrincipal = async (req, res, next) => {
  try {
    const principal = await Principal.findByPk(req.params.id)
    if (!principal) return sendError(res, 'Principal not found.', 404)
    await principal.destroy()
    sendSuccess(res, null, 'Principal deleted successfully.')
  } catch (err) { next(err) }
}

// ─── Overview stats for admin dashboard ──────────────────────────────────────

const getAdminStats = async (req, res, next) => {
  try {
    const [totalPrincipals, activePrincipals, totalStudents, totalTeachers] = await Promise.all([
      Principal.count(),
      Principal.count({ where: { isActive: true } }),
      Student.count(),
      Teacher.count(),
    ])
    sendSuccess(res, { totalPrincipals, activePrincipals, inactivePrincipals: totalPrincipals - activePrincipals, totalStudents, totalTeachers })
  } catch (err) { next(err) }
}

module.exports = { listPrincipals, getPrincipal, createPrincipal, updatePrincipal, togglePrincipal, deletePrincipal, getAdminStats }
