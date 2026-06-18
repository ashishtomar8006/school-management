const { SalaryRecord, Teacher, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const include = [
  { model: Teacher, as: 'teacher', include: [{ model: User, as: 'user', attributes: ['name', 'email'] }] },
]

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, teacherId, month, year, status } = req.query
    const offset = (page - 1) * limit
    const where = {}
    if (teacherId) where.teacherId = teacherId
    if (month)     where.month = month
    if (year)      where.year = parseInt(year)
    if (status)    where.status = status

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await SalaryRecord.findAndCountAll({
      where, include, limit: parseInt(limit), offset,
      order: [['year', 'DESC'], ['month', 'DESC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const record = await SalaryRecord.findByPk(req.params.id, { include })
    if (!record) return sendError(res, 'Salary record not found.', 404)
    sendSuccess(res, record)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const { teacherId, month, year, baseSalary, da = 0, hra = 0, conveyance = 0, medicalAllowance = 0, otherAllowances = 0, pf = 0, tax = 0, otherDeductions = 0, remarks } = req.body

    const netSalary = (parseFloat(baseSalary) + parseFloat(da) + parseFloat(hra) + parseFloat(conveyance) + parseFloat(medicalAllowance) + parseFloat(otherAllowances)) - (parseFloat(pf) + parseFloat(tax) + parseFloat(otherDeductions))

    const principalId = await resolvePrincipalId(req)
    const record = await SalaryRecord.create({ teacherId, month, year, baseSalary, da, hra, conveyance, medicalAllowance, otherAllowances, pf, tax, otherDeductions, netSalary, remarks, principalId })
    const result = await SalaryRecord.findByPk(record.id, { include })
    sendSuccess(res, result, 'Salary record created.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const record = await SalaryRecord.findByPk(req.params.id)
    if (!record) return sendError(res, 'Salary record not found.', 404)

    const { baseSalary, da = 0, hra = 0, conveyance = 0, medicalAllowance = 0, otherAllowances = 0, pf = 0, tax = 0, otherDeductions = 0 } = { ...record.toJSON(), ...req.body }
    const netSalary = (parseFloat(baseSalary) + parseFloat(da) + parseFloat(hra) + parseFloat(conveyance) + parseFloat(medicalAllowance) + parseFloat(otherAllowances)) - (parseFloat(pf) + parseFloat(tax) + parseFloat(otherDeductions))

    await record.update({ ...req.body, netSalary })
    sendSuccess(res, record, 'Salary record updated.')
  } catch (err) { next(err) }
}

const processPayment = async (req, res, next) => {
  try {
    const record = await SalaryRecord.findByPk(req.params.id)
    if (!record) return sendError(res, 'Salary record not found.', 404)
    if (record.status === 'paid') return sendError(res, 'Salary already paid.', 400)

    const { paymentMethod } = req.body
    await record.update({ status: 'paid', paymentDate: new Date().toISOString().split('T')[0], paymentMethod })
    sendSuccess(res, record, 'Salary payment processed.')
  } catch (err) { next(err) }
}

const bulkGenerate = async (req, res, next) => {
  try {
    const { month, year } = req.body
    const principalId = await resolvePrincipalId(req)
    const teacherWhere = {}
    if (principalId) teacherWhere.principalId = principalId

    const teachers = await Teacher.findAll({
      where: teacherWhere,
      include: [{ model: User, as: 'user', where: { isActive: true } }],
    })

    const records = await SalaryRecord.bulkCreate(
      teachers.map(t => ({
        teacherId: t.id,
        month,
        year,
        baseSalary: 30000,
        netSalary: 30000,
        status: 'pending',
        principalId,
      })),
      { ignoreDuplicates: true }
    )
    sendSuccess(res, { created: records.length }, `Generated ${records.length} salary records.`, 201)
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, processPayment, bulkGenerate }
