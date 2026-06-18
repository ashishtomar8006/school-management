const { Notice, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const include = [{ model: User, as: 'createdBy', attributes: ['id', 'name', 'role'] }]

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, audience, search } = req.query
    const offset = (page - 1) * limit
    const where = { isPublished: true }
    if (category) where.category = category
    if (search)   where.title = { [Op.like]: `%${search}%` }
    if (audience) {
      where.audience = { [Op.in]: [audience, 'all'] }
    } else {
      const roleMap = { teacher: 'teachers', student: 'students', parent: 'parents' }
      const roleAudience = roleMap[req.user.role]
      if (roleAudience) where.audience = { [Op.in]: [roleAudience, 'all', 'staff'] }
    }

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await Notice.findAndCountAll({
      where, include, limit: parseInt(limit), offset,
      order: [['createdAt', 'DESC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const notice = await Notice.findByPk(req.params.id, { include })
    if (!notice) return sendError(res, 'Notice not found.', 404)
    sendSuccess(res, notice)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const notice = await Notice.create({ ...req.body, createdById: req.user.id, principalId })
    const result = await Notice.findByPk(notice.id, { include })
    sendSuccess(res, result, 'Notice created.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const notice = await Notice.findByPk(req.params.id)
    if (!notice) return sendError(res, 'Notice not found.', 404)
    await notice.update(req.body)
    sendSuccess(res, notice, 'Notice updated.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const notice = await Notice.findByPk(req.params.id)
    if (!notice) return sendError(res, 'Notice not found.', 404)
    await notice.destroy()
    sendSuccess(res, null, 'Notice deleted.')
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove }
