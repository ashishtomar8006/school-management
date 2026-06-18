const router = require('express').Router()
const ctrl = require('../controllers/certificateController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/',          ctrl.list)
router.post('/',         authorize('principal'), ctrl.create)
router.get('/:id',       ctrl.getById)
router.put('/:id',       authorize('principal'), ctrl.update)
router.put('/:id/revoke', authorize('principal'), ctrl.revoke)

module.exports = router
