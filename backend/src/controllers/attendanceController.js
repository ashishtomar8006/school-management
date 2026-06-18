const { Attendance, EmployeeAttendance, Student, User } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')
const { Op } = require('sequelize')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

// ── Student Attendance ─────────────────────────────────────────────────────────

const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId, date, fromDate, toDate, class: cls, section } = req.query

    const where = {}
    if (studentId) where.studentId = studentId
    if (date) where.date = date
    if (fromDate || toDate) {
      where.date = {}
      if (fromDate) where.date[Op.gte] = fromDate
      if (toDate)   where.date[Op.lte] = toDate
    }

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const studentWhere = {}
    if (cls) studentWhere.class = cls
    if (section) studentWhere.section = section

    const records = await Attendance.findAll({
      where,
      include: [{
        model: Student,
        as: 'student',
        where: Object.keys(studentWhere).length ? studentWhere : undefined,
        include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      }],
      order: [['date', 'DESC'], [{ model: Student, as: 'student' }, { model: User, as: 'user' }, 'name', 'ASC']],
    })

    sendSuccess(res, records)
  } catch (err) { next(err) }
}

const markAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body
    if (!date || !Array.isArray(records) || records.length === 0) {
      return sendError(res, 'date and records[] are required.', 400)
    }

    const principalId = await resolvePrincipalId(req)

    const results = await Promise.all(
      records.map(({ studentId, status, remarks }) =>
        Attendance.upsert({ studentId, date, status, remarks, markedById: req.user.id, principalId })
      )
    )

    sendSuccess(res, { updated: results.length }, 'Attendance marked successfully.')
  } catch (err) { next(err) }
}

const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByPk(req.params.id)
    if (!record) return sendError(res, 'Attendance record not found.', 404)

    const { status, remarks } = req.body
    await record.update({ status, remarks })
    sendSuccess(res, record, 'Attendance updated.')
  } catch (err) { next(err) }
}

const getAttendanceReport = async (req, res, next) => {
  try {
    const { fromDate, toDate, class: cls, section } = req.query

    const principalId = await resolvePrincipalId(req)
    const studentWhere = {}
    if (cls) studentWhere.class = cls
    if (section) studentWhere.section = section
    if (principalId) studentWhere.principalId = principalId

    const attendanceWhere = {}
    if (fromDate) attendanceWhere.date = { [Op.gte]: fromDate }
    if (fromDate && toDate) attendanceWhere.date = { [Op.between]: [fromDate, toDate] }

    const students = await Student.findAll({
      where: studentWhere,
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: Attendance, as: 'attendances', where: Object.keys(attendanceWhere).length ? attendanceWhere : undefined, required: false },
      ],
    })

    const report = students.map(s => {
      const att = s.attendances || []
      const present = att.filter(r => r.status === 'present').length
      const total = att.length
      return {
        studentId: s.id,
        name: s.user.name,
        class: s.class,
        section: s.section,
        rollNumber: s.rollNumber,
        total,
        present,
        absent: att.filter(r => r.status === 'absent').length,
        late: att.filter(r => r.status === 'late').length,
        percentage: total ? Math.round((present / total) * 100) : 0,
      }
    })

    sendSuccess(res, report)
  } catch (err) { next(err) }
}

// ── Employee Attendance ────────────────────────────────────────────────────────

const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, fromDate, toDate, employeeType } = req.query
    const where = {}
    if (employeeId) where.employeeId = employeeId
    if (date) where.date = date
    if (fromDate && toDate) where.date = { [Op.between]: [fromDate, toDate] }
    if (employeeType) where.employeeType = employeeType

    const records = await EmployeeAttendance.findAll({
      where,
      include: [{ model: User, as: 'employee', attributes: ['name', 'email', 'role'], required: false }],
      order: [['date', 'DESC']],
    })
    sendSuccess(res, records)
  } catch (err) { next(err) }
}

const markEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId, employeeType, date, checkInTime, checkOutTime, status, leaveType, remarks } = req.body

    const [record] = await EmployeeAttendance.upsert({
      employeeId, employeeType, date, checkInTime, checkOutTime, status, leaveType, remarks,
    })
    sendSuccess(res, record, 'Employee attendance marked.')
  } catch (err) { next(err) }
}

module.exports = {
  getStudentAttendance,
  markAttendance,
  updateAttendance,
  getAttendanceReport,
  getEmployeeAttendance,
  markEmployeeAttendance,
}
