const { Exam, ExamSchedule, ExamResult, Student, User } = require('../models')
const { sendSuccess, sendError, sendPaginated } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

// ── Exams ──────────────────────────────────────────────────────────────────────

const listExams = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, class: cls, academicYear } = req.query
    const where = {}
    if (status)       where.status = status
    if (cls)          where.class  = cls
    if (academicYear) where.academicYear = academicYear

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const { count, rows } = await Exam.findAndCountAll({
      where, limit: parseInt(limit), offset: (page - 1) * limit,
      order: [['startDate', 'DESC']],
    })
    sendPaginated(res, rows, count, page, limit)
  } catch (err) { next(err) }
}

const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [{ model: ExamSchedule, as: 'schedules', order: [['date', 'ASC']] }],
    })
    if (!exam) return sendError(res, 'Exam not found.', 404)
    sendSuccess(res, exam)
  } catch (err) { next(err) }
}

const createExam = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const exam = await Exam.create({ ...req.body, principalId })
    sendSuccess(res, exam, 'Exam created.', 201)
  } catch (err) { next(err) }
}

const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByPk(req.params.id)
    if (!exam) return sendError(res, 'Exam not found.', 404)
    await exam.update(req.body)
    sendSuccess(res, exam, 'Exam updated.')
  } catch (err) { next(err) }
}

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByPk(req.params.id)
    if (!exam) return sendError(res, 'Exam not found.', 404)
    await exam.destroy()
    sendSuccess(res, null, 'Exam deleted.')
  } catch (err) { next(err) }
}

// ── Exam Schedules ─────────────────────────────────────────────────────────────

const listSchedules = async (req, res, next) => {
  try {
    const { examId, date } = req.query
    const where = {}
    if (examId) where.examId = examId
    if (date)   where.date   = date

    const schedules = await ExamSchedule.findAll({
      where, order: [['date', 'ASC'], ['startTime', 'ASC']],
      include: [{ model: Exam, as: 'exam', attributes: ['id', 'name', 'class', 'section'] }],
    })
    sendSuccess(res, schedules)
  } catch (err) { next(err) }
}

const createSchedule = async (req, res, next) => {
  try {
    const schedule = await ExamSchedule.create(req.body)
    sendSuccess(res, schedule, 'Schedule created.', 201)
  } catch (err) { next(err) }
}

const updateSchedule = async (req, res, next) => {
  try {
    const s = await ExamSchedule.findByPk(req.params.id)
    if (!s) return sendError(res, 'Schedule not found.', 404)
    await s.update(req.body)
    sendSuccess(res, s, 'Schedule updated.')
  } catch (err) { next(err) }
}

const deleteSchedule = async (req, res, next) => {
  try {
    const s = await ExamSchedule.findByPk(req.params.id)
    if (!s) return sendError(res, 'Schedule not found.', 404)
    await s.destroy()
    sendSuccess(res, null, 'Schedule deleted.')
  } catch (err) { next(err) }
}

// ── Exam Results ───────────────────────────────────────────────────────────────

const listResults = async (req, res, next) => {
  try {
    const { examId, studentId, subject } = req.query
    const where = {}
    if (examId)    where.examId    = examId
    if (studentId) where.studentId = studentId
    if (subject)   where.subject   = subject

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const results = await ExamResult.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] },
        { model: Exam, as: 'exam', attributes: ['id', 'name', 'class', 'section', 'totalMarks', 'passingMarks'] },
      ],
      order: [['subject', 'ASC']],
    })
    sendSuccess(res, results)
  } catch (err) { next(err) }
}

const upsertResult = async (req, res, next) => {
  try {
    const { examId, studentId, subject, marksObtained, maxMarks, status, remarks } = req.body
    if (!examId || !studentId || !subject) return sendError(res, 'examId, studentId, subject required.', 400)

    const principalId = await resolvePrincipalId(req)
    const [result] = await ExamResult.upsert({
      examId, studentId, subject,
      marksObtained: marksObtained ?? null,
      maxMarks: maxMarks ?? 100,
      status: status ?? (marksObtained !== undefined ? (marksObtained >= (maxMarks ?? 100) * 0.35 ? 'pass' : 'fail') : 'pending'),
      remarks,
      principalId,
    }, { returning: true })

    sendSuccess(res, result, 'Result saved.')
  } catch (err) { next(err) }
}

const bulkUpsertResults = async (req, res, next) => {
  try {
    const { results } = req.body
    if (!Array.isArray(results) || results.length === 0) return sendError(res, 'results[] required.', 400)

    const principalId = await resolvePrincipalId(req)
    const saved = await Promise.all(
      results.map(r => ExamResult.upsert({
        examId: r.examId, studentId: r.studentId, subject: r.subject,
        marksObtained: r.marksObtained ?? null,
        maxMarks: r.maxMarks ?? 100,
        status: r.marksObtained !== undefined ? (r.marksObtained >= (r.maxMarks ?? 100) * 0.35 ? 'pass' : 'fail') : 'pending',
        remarks: r.remarks ?? '',
        principalId,
      }))
    )
    sendSuccess(res, { updated: saved.length }, `${saved.length} results saved.`)
  } catch (err) { next(err) }
}

module.exports = {
  listExams, getExam, createExam, updateExam, deleteExam,
  listSchedules, createSchedule, updateSchedule, deleteSchedule,
  listResults, upsertResult, bulkUpsertResults,
}
