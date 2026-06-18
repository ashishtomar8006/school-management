const router = require('express').Router()
const ctrl = require('../controllers/classController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

// Sections
router.get('/sections',              ctrl.listSections)
router.post('/sections',             authorize('principal'), ctrl.createSection)
router.put('/sections/:id',          authorize('principal'), ctrl.updateSection)
router.delete('/sections/:id',       authorize('principal'), ctrl.deleteSection)
router.get('/sections/:id/students', authorize('principal', 'teacher'), ctrl.getClassStudents)

// Section → Subject assignment
router.get('/sections/:id/subjects',                   ctrl.getSectionSubjects)
router.post('/sections/:id/subjects',                  authorize('principal'), ctrl.assignSubject)
router.delete('/sections/:id/subjects/:subjectId',     authorize('principal'), ctrl.removeSubject)

// Subjects
router.get('/subjects',              ctrl.listSubjects)
router.post('/subjects',             authorize('principal'), ctrl.createSubject)
router.put('/subjects/:id',          authorize('principal'), ctrl.updateSubject)
router.delete('/subjects/:id',       authorize('principal'), ctrl.deleteSubject)

// Rooms
router.get('/rooms',                 authorize('principal'), ctrl.listRooms)
router.post('/rooms',                authorize('principal'), ctrl.createRoom)
router.put('/rooms/:id',             authorize('principal'), ctrl.updateRoom)

module.exports = router
