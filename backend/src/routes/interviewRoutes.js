const router = require('express').Router()
const ctrl = require('../controllers/interviewController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate, authorize('principal'))

router.get('/',       ctrl.list)
router.post('/',      ctrl.create)
router.get('/:id',    ctrl.getById)
router.put('/:id',    ctrl.update)
router.delete('/:id', ctrl.remove)

module.exports = router
