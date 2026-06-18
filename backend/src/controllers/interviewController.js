const { Interview, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const include = [{ model: User, as: 'interviewer', attributes: ['id', 'name'], required: false }]

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, department, search } = req.query
    const offset = (page - 1) * limit
    const where = {}
    if (status)     where.status = status
    if (department) where.department = department
    if (search)     where.name = { [Op.like]: `%${search}%` }

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await Interview.findAndCountAll({
      where, include, limit: parseInt(limit), offset,
      order: [['appliedDate', 'DESC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const interview = await Interview.findByPk(req.params.id, { include })
    if (!interview) return sendError(res, 'Interview not found.', 404)
    sendSuccess(res, interview)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const interview = await Interview.create({ ...req.body, principalId })
    sendSuccess(res, interview, 'Interview candidate added.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const interview = await Interview.findByPk(req.params.id)
    if (!interview) return sendError(res, 'Interview not found.', 404)
    await interview.update(req.body)
    const result = await Interview.findByPk(interview.id, { include })
    sendSuccess(res, result, 'Interview updated.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const interview = await Interview.findByPk(req.params.id)
    if (!interview) return sendError(res, 'Interview not found.', 404)
    await interview.destroy()
    sendSuccess(res, null, 'Interview deleted.')
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove }
