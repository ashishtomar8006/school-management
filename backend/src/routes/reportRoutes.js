const router = require('express').Router()
const ctrl = require('../controllers/reportController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate, authorize('principal'))

router.get('/overview',    ctrl.overview)
router.get('/attendance',  ctrl.attendanceReport)
router.get('/fees',        ctrl.feeReport)
router.get('/salary',      ctrl.salaryReport)

module.exports = router
