const { Student, Teacher, Attendance, FeeRecord, Complaint, Notice, SalaryRecord, sequelize } = require('../models')
const { sendSuccess } = require('../utils/response')
const { Op } = require('sequelize')

const overview = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, pendingComplaints, overdueFees, totalNotices, recentAttendance] = await Promise.all([
      Student.count(),
      Teacher.count(),
      Complaint.count({ where: { status: { [Op.in]: ['open', 'in-progress'] } } }),
      FeeRecord.count({ where: { status: 'overdue' } }),
      Notice.count({ where: { isPublished: true } }),
      Attendance.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
        group: ['status'],
        raw: true,
      }),
    ])

    const attendanceMap = {}
    recentAttendance.forEach(r => { attendanceMap[r.status] = parseInt(r.count) })
    const totalAttendance = Object.values(attendanceMap).reduce((s, v) => s + v, 0)
    const avgAttendance = totalAttendance ? Math.round((attendanceMap.present || 0) / totalAttendance * 100) : 0

    sendSuccess(res, {
      totalStudents,
      totalTeachers,
      pendingComplaints,
      overdueFees,
      totalNotices,
      avgAttendance,
      attendanceBreakdown: attendanceMap,
    })
  } catch (err) { next(err) }
}

const attendanceReport = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query
    const where = {}
    if (fromDate && toDate) where.date = { [Op.between]: [fromDate, toDate] }

    const data = await Attendance.findAll({
      where,
      attributes: ['date', 'status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['date', 'status'],
      order: [['date', 'ASC']],
      raw: true,
    })
    sendSuccess(res, data)
  } catch (err) { next(err) }
}

const feeReport = async (req, res, next) => {
  try {
    const data = await FeeRecord.findAll({
      attributes: ['status', [sequelize.fn('SUM', sequelize.col('amount')), 'total'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    })
    sendSuccess(res, data)
  } catch (err) { next(err) }
}

const salaryReport = async (req, res, next) => {
  try {
    const { year } = req.query
    const where = {}
    if (year) where.year = parseInt(year)

    const data = await SalaryRecord.findAll({
      where,
      attributes: ['month', 'year', 'status', [sequelize.fn('SUM', sequelize.col('netSalary')), 'totalPaid'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['month', 'year', 'status'],
      order: [['year', 'DESC'], ['month', 'ASC']],
      raw: true,
    })
    sendSuccess(res, data)
  } catch (err) { next(err) }
}

module.exports = { overview, attendanceReport, feeReport, salaryReport }
