const router = require('express').Router()
const ctrl = require('../controllers/studentController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/',                      authorize('principal', 'teacher'), ctrl.list)
router.post('/',                     authorize('principal'), ctrl.create)
router.get('/:id',                   authorize('principal', 'teacher', 'student', 'parent'), ctrl.getById)
router.put('/:id',                   authorize('principal'), ctrl.update)
router.delete('/:id',                authorize('principal'), ctrl.remove)
router.get('/:id/attendance-summary', authorize('principal', 'teacher', 'student', 'parent'), ctrl.getAttendanceSummary)

module.exports = router
