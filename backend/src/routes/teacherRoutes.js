const router = require('express').Router()
const ctrl = require('../controllers/teacherController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/',           authorize('principal'), ctrl.list)
router.post('/',          authorize('principal'), ctrl.create)
router.get('/:id',        authorize('principal', 'teacher'), ctrl.getById)
router.put('/:id',        authorize('principal'), ctrl.update)
router.delete('/:id',     authorize('principal'), ctrl.remove)
router.get('/:id/salary', authorize('principal'), ctrl.getSalaryHistory)

module.exports = router
