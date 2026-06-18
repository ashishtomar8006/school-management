const router = require('express').Router()
const ctrl = require('../controllers/studentCategoryController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

router.get('/',       ctrl.list)
router.post('/',      authorize('principal'), ctrl.create)
router.put('/:id',    authorize('principal'), ctrl.update)
router.delete('/:id', authorize('principal'), ctrl.remove)

module.exports = router
