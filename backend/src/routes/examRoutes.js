const router = require('express').Router()
const ctrl = require('../controllers/examController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

// Exams
router.get('/',       ctrl.listExams)
router.post('/',      authorize('principal'), ctrl.createExam)
router.get('/:id',    ctrl.getExam)
router.put('/:id',    authorize('principal'), ctrl.updateExam)
router.delete('/:id', authorize('principal'), ctrl.deleteExam)

// Schedules
router.get('/schedules/list',     ctrl.listSchedules)
router.post('/schedules',         authorize('principal', 'teacher'), ctrl.createSchedule)
router.put('/schedules/:id',      authorize('principal', 'teacher'), ctrl.updateSchedule)
router.delete('/schedules/:id',   authorize('principal'), ctrl.deleteSchedule)

// Results
router.get('/results/list',       ctrl.listResults)
router.post('/results',           authorize('principal', 'teacher'), ctrl.upsertResult)
router.post('/results/bulk',      authorize('principal', 'teacher'), ctrl.bulkUpsertResults)

module.exports = router
