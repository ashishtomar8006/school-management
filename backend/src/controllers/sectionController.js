const { Section } = require('../models')
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

    const sections = await Section.findAll({ where, order: [['name', 'ASC']] })
    sendSuccess(res, sections)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const { name, status = 'active' } = req.body
    if (!name?.trim()) return sendError(res, 'Section name is required.', 400)
    const principalId = await resolvePrincipalId(req)
    const section = await Section.create({ name: name.trim().toUpperCase(), status, principalId })
    sendSuccess(res, section, 'Section created.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)
    const { name, status } = req.body
    await section.update({
      name:   name ? name.trim().toUpperCase() : section.name,
      status: status ?? section.status,
    })
    sendSuccess(res, section, 'Section updated.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id)
    if (!section) return sendError(res, 'Section not found.', 404)
    await section.destroy()
    sendSuccess(res, null, 'Section deleted.')
  } catch (err) { next(err) }
}

module.exports = { list, create, update, remove }
