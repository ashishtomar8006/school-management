const { Certificate, Student, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const studentInclude = [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }], required: false }]

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, studentId, search } = req.query
    const where = {}
    if (type)      where.type      = type
    if (status)    where.status    = status
    if (studentId) where.studentId = studentId
    if (search)    where.certificateNo = { [Op.like]: `%${search}%` }

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await Certificate.findAndCountAll({
      where, include: studentInclude, limit: parseInt(limit), offset: (page - 1) * limit,
      order: [['issuedDate', 'DESC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const cert = await Certificate.findByPk(req.params.id, { include: studentInclude })
    if (!cert) return sendError(res, 'Certificate not found.', 404)
    sendSuccess(res, cert)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const cert = await Certificate.create({ ...req.body, issuedDate: new Date(), principalId })
    const result = await Certificate.findByPk(cert.id, { include: studentInclude })
    sendSuccess(res, result, 'Certificate issued.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const cert = await Certificate.findByPk(req.params.id)
    if (!cert) return sendError(res, 'Certificate not found.', 404)
    await cert.update(req.body)
    const result = await Certificate.findByPk(cert.id, { include: studentInclude })
    sendSuccess(res, result, 'Certificate updated.')
  } catch (err) { next(err) }
}

const revoke = async (req, res, next) => {
  try {
    const cert = await Certificate.findByPk(req.params.id)
    if (!cert) return sendError(res, 'Certificate not found.', 404)
    await cert.update({ status: 'revoked' })
    sendSuccess(res, cert, 'Certificate revoked.')
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, revoke }
