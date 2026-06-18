const { StudentCategory } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const list = async (req, res, next) => {
  try {
    const { status, search } = req.query
    const where = {}
    if (status) where.status = status
    if (search) where.name = { [Op.like]: `%${search}%` }

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const categories = await StudentCategory.findAll({ where, order: [['name', 'ASC']] })
    sendSuccess(res, categories)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const { name, status = 'active' } = req.body
    if (!name?.trim()) return sendError(res, 'Category name is required.', 400)
    const principalId = await resolvePrincipalId(req)
    const category = await StudentCategory.create({ name: name.trim(), status, principalId })
    sendSuccess(res, category, 'Student category created.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const category = await StudentCategory.findByPk(req.params.id)
    if (!category) return sendError(res, 'Category not found.', 404)
    const { name, status } = req.body
    await category.update({ name: name?.trim() ?? category.name, status: status ?? category.status })
    sendSuccess(res, category, 'Category updated.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const category = await StudentCategory.findByPk(req.params.id)
    if (!category) return sendError(res, 'Category not found.', 404)
    await category.destroy()
    sendSuccess(res, null, 'Category deleted.')
  } catch (err) { next(err) }
}

module.exports = { list, create, update, remove }
