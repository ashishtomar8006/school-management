const router = require('express').Router()
const ctrl = require('../controllers/attendanceController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/student',              ctrl.getStudentAttendance)
router.post('/student',             authorize('principal', 'teacher'), ctrl.markAttendance)
router.put('/student/:id',          authorize('principal', 'teacher'), ctrl.updateAttendance)
router.get('/student/report',       ctrl.getAttendanceReport)

router.get('/employee',             authorize('principal'), ctrl.getEmployeeAttendance)
router.post('/employee',            authorize('principal'), ctrl.markEmployeeAttendance)

module.exports = router
