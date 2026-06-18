const router = require('express').Router()
const ctrl = require('../controllers/feeController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

// Fee Structures
router.get('/structures',                     authorize('principal'), ctrl.listStructures)
router.post('/structures',                    authorize('principal'), ctrl.createStructure)
router.put('/structures/:id',                 authorize('principal'), ctrl.updateStructure)
router.delete('/structures/:id',              authorize('principal'), ctrl.deleteStructure)
router.post('/structures/:id/generate',       authorize('principal'), ctrl.generateFromStructure)

// Fee Records
router.get('/records',                        ctrl.listRecords)
router.post('/records',                       authorize('principal'), ctrl.createRecord)
router.put('/records/:id',                    authorize('principal'), ctrl.updateRecord)
router.put('/records/:id/pay',                authorize('principal'), ctrl.processPayment)

module.exports = router
