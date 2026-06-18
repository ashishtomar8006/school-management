const { FeeRecord, FeeStructure, Student, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

// ── Fee Structure ──────────────────────────────────────────────────────────────

const listStructures = async (req, res, next) => {
  try {
    const { class: cls, academicYear } = req.query
    const where = {}
    if (cls) where.class = cls
    if (academicYear) where.academicYear = academicYear

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const structures = await FeeStructure.findAll({ where, order: [['class', 'ASC']] })
    sendSuccess(res, structures)
  } catch (err) { next(err) }
}

const createStructure = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const structure = await FeeStructure.create({ ...req.body, principalId })
    sendSuccess(res, structure, 'Fee structure created.', 201)
  } catch (err) { next(err) }
}

const updateStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findByPk(req.params.id)
    if (!structure) return sendError(res, 'Fee structure not found.', 404)
    await structure.update(req.body)
    sendSuccess(res, structure, 'Fee structure updated.')
  } catch (err) { next(err) }
}

const deleteStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findByPk(req.params.id)
    if (!structure) return sendError(res, 'Fee structure not found.', 404)
    await structure.destroy()
    sendSuccess(res, null, 'Fee structure deleted.')
  } catch (err) { next(err) }
}

// ── Fee Records ────────────────────────────────────────────────────────────────

const listRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, studentId, status, feeType } = req.query
    const offset = (page - 1) * limit
    const where = {}

    if (feeType) where.feeType = feeType
    if (status)  where.status = status

    if (req.user.role === 'student') {
      const profile = await Student.findOne({ where: { userId: req.user.id } })
      where.studentId = profile?.id
    } else if (studentId) {
      where.studentId = studentId
    }

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await FeeRecord.findAndCountAll({
      where,
      include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] }],
      limit: parseInt(limit), offset,
      order: [['dueDate', 'ASC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const createRecord = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const record = await FeeRecord.create({ ...req.body, principalId })
    sendSuccess(res, record, 'Fee record created.', 201)
  } catch (err) { next(err) }
}

const generateFromStructure = async (req, res, next) => {
  try {
    const structure = await FeeStructure.findByPk(req.params.id)
    if (!structure) return sendError(res, 'Fee structure not found.', 404)

    const where = { class: structure.class }
    if (structure.section) where.section = structure.section
    if (structure.principalId) where.principalId = structure.principalId

    const students = await Student.findAll({ where })
    const records = await FeeRecord.bulkCreate(
      students.map(s => ({
        studentId: s.id,
        feeStructureId: structure.id,
        feeType: structure.feeType,
        amount: structure.amount,
        dueDate: structure.dueDate,
        status: 'pending',
        principalId: structure.principalId,
      }))
    )
    sendSuccess(res, { created: records.length }, `Generated ${records.length} fee records.`, 201)
  } catch (err) { next(err) }
}

const processPayment = async (req, res, next) => {
  try {
    const record = await FeeRecord.findByPk(req.params.id)
    if (!record) return sendError(res, 'Fee record not found.', 404)
    if (record.status === 'paid') return sendError(res, 'Fee already paid.', 400)

    const { paymentMethod, remarks } = req.body
    await record.update({
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      remarks,
      receiptNumber: `RCP-${Date.now()}`,
    })
    sendSuccess(res, record, 'Payment processed successfully.')
  } catch (err) { next(err) }
}

const updateRecord = async (req, res, next) => {
  try {
    const record = await FeeRecord.findByPk(req.params.id)
    if (!record) return sendError(res, 'Fee record not found.', 404)
    await record.update(req.body)
    sendSuccess(res, record, 'Fee record updated.')
  } catch (err) { next(err) }
}

module.exports = { listStructures, createStructure, updateStructure, deleteStructure, listRecords, createRecord, generateFromStructure, processPayment, updateRecord }
