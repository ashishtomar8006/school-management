const router = require('express').Router()
const ctrl = require('../controllers/noticeController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/',       ctrl.list)
router.post('/',      authorize('principal', 'teacher'), ctrl.create)
router.get('/:id',    ctrl.getById)
router.put('/:id',    authorize('principal', 'teacher'), ctrl.update)
router.delete('/:id', authorize('principal'), ctrl.remove)

module.exports = router
