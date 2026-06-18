const router = require('express').Router()
const ctrl = require('../controllers/salaryController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate, authorize('principal'))

router.get('/',                    ctrl.list)
router.post('/',                   ctrl.create)
router.post('/bulk-generate',      ctrl.bulkGenerate)
router.get('/:id',                 ctrl.getById)
router.put('/:id',                 ctrl.update)
router.put('/:id/pay',             ctrl.processPayment)

module.exports = router
