const router = require('express').Router()
const ctrl = require('../controllers/homeworkController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/',                                ctrl.list)
router.post('/',                               authorize('principal', 'teacher'), ctrl.create)
router.get('/:id',                             ctrl.getById)
router.put('/:id',                             authorize('principal', 'teacher'), ctrl.update)
router.delete('/:id',                          authorize('principal', 'teacher'), ctrl.remove)
router.post('/:id/submit',                     authorize('student'), ctrl.submit)
router.put('/:id/submissions/:submissionId',   authorize('principal', 'teacher'), ctrl.gradeSubmission)

module.exports = router
