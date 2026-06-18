const { Homework, HomeworkSubmission, Student, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const hwInclude = [{ model: User, as: 'assignedBy', attributes: ['id', 'name'] }]

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, class: cls, section, subject } = req.query
    const offset = (page - 1) * limit
    const where = {}
    if (cls)     where.class = cls
    if (section) where.section = section
    if (subject) where.subject = subject

    if (req.user.role === 'teacher') where.assignedById = req.user.id

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await Homework.findAndCountAll({
      where, include: hwInclude, limit: parseInt(limit), offset,
      order: [['dueDate', 'ASC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getById = async (req, res, next) => {
  try {
    const hw = await Homework.findByPk(req.params.id, {
      include: [
        ...hwInclude,
        { model: HomeworkSubmission, as: 'submissions', include: [{ model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] }] },
      ],
    })
    if (!hw) return sendError(res, 'Homework not found.', 404)
    sendSuccess(res, hw)
  } catch (err) { next(err) }
}

const create = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const hw = await Homework.create({ ...req.body, assignedById: req.user.id, principalId })
    const result = await Homework.findByPk(hw.id, { include: hwInclude })
    sendSuccess(res, result, 'Homework created.', 201)
  } catch (err) { next(err) }
}

const update = async (req, res, next) => {
  try {
    const hw = await Homework.findByPk(req.params.id)
    if (!hw) return sendError(res, 'Homework not found.', 404)
    await hw.update(req.body)
    sendSuccess(res, hw, 'Homework updated.')
  } catch (err) { next(err) }
}

const remove = async (req, res, next) => {
  try {
    const hw = await Homework.findByPk(req.params.id)
    if (!hw) return sendError(res, 'Homework not found.', 404)
    await hw.destroy()
    sendSuccess(res, null, 'Homework deleted.')
  } catch (err) { next(err) }
}

const submit = async (req, res, next) => {
  try {
    const hw = await Homework.findByPk(req.params.id)
    if (!hw) return sendError(res, 'Homework not found.', 404)

    const student = await Student.findOne({ where: { userId: req.user.id } })
    if (!student) return sendError(res, 'Student profile not found.', 404)

    const isLate = new Date() > new Date(hw.dueDate)
    const [submission] = await HomeworkSubmission.upsert({
      homeworkId: hw.id,
      studentId: student.id,
      submittedAt: new Date(),
      attachments: req.body.attachments || [],
      status: isLate ? 'late' : 'submitted',
    })
    sendSuccess(res, submission, 'Homework submitted.', 201)
  } catch (err) { next(err) }
}

const gradeSubmission = async (req, res, next) => {
  try {
    const submission = await HomeworkSubmission.findByPk(req.params.submissionId)
    if (!submission) return sendError(res, 'Submission not found.', 404)
    const { marks, feedback } = req.body
    await submission.update({ marks, feedback, status: 'graded' })
    sendSuccess(res, submission, 'Submission graded.')
  } catch (err) { next(err) }
}

module.exports = { list, getById, create, update, remove, submit, gradeSubmission }
