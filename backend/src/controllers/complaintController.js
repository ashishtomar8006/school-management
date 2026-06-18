const { Complaint, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const include = [
  { model: User, as: 'createdBy', attributes: ['id', 'name', 'role'] },
  { model: User, as: 'assignedTo', attributes: ['id', 'name', 'role'], required: false },
]

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, category, search } = req.query
    const offset = (page - 1) * limit
    const where = {}

    if (status)   where.status = status
    if (priority) where.priority = priority
    if (category) where.category = category
    if (search)   where.title = { [Op.like]: `%${search}%` }

    // Students/parents only see their own
    if (['student', 'parent'].includes(req.user.role)) where.createdById = req.user.id

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await Complaint.findAndCountAll({
      where, include, limit: parseInt(limit), offset,
      order: [['createdAt', 'DESC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, { include })
    if (!complaint) return sendError(res, 'Complaint not found.', 404)
    sendSuccess(res, complaint)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body
    const principalId = await resolvePrincipalId(req)
    const complaint = await Complaint.create({
      title, description, category, priority,
      createdById: req.user.id,
      principalId,
    })
    const result = await Complaint.findByPk(complaint.id, { include })
    sendSuccess(res, result, 'Complaint filed successfully.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id)
    if (!complaint) return sendError(res, 'Complaint not found.', 404)

    const { status, priority, assignedToId, resolution } = req.body
    const updates = { status, priority, assignedToId, resolution }
    if (status === 'resolved' && !complaint.resolvedAt) updates.resolvedAt = new Date()

    await complaint.update(updates)
    const updated = await Complaint.findByPk(complaint.id, { include })
    sendSuccess(res, updated, 'Complaint updated.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id)
    if (!complaint) return sendError(res, 'Complaint not found.', 404)
    await complaint.destroy()
    sendSuccess(res, null, 'Complaint deleted.')
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove }
