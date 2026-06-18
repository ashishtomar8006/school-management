const router = require('express').Router()
const ctrl = require('../controllers/busController')
const { authenticate } = require('../middleware/auth')
const { authorize } = require('../middleware/authorize')

router.use(authenticate)

// Routes
router.get('/routes',                                  ctrl.listRoutes)
router.post('/routes',                                 authorize('principal'), ctrl.createRoute)
router.get('/routes/:id',                              ctrl.getRoute)
router.put('/routes/:id',                              authorize('principal'), ctrl.updateRoute)
router.delete('/routes/:id',                           authorize('principal'), ctrl.deleteRoute)

// Stops (nested under routes)
router.post('/routes/:routeId/stops',                  authorize('principal'), ctrl.addStop)
router.put('/routes/:routeId/stops/:stopId',           authorize('principal'), ctrl.updateStop)
router.delete('/routes/:routeId/stops/:stopId',        authorize('principal'), ctrl.deleteStop)

// Buses
router.get('/buses',                                   ctrl.listBuses)
router.post('/buses',                                  authorize('principal'), ctrl.createBus)
router.get('/buses/:id',                               ctrl.getBus)
router.put('/buses/:id',                               authorize('principal'), ctrl.updateBus)
router.delete('/buses/:id',                            authorize('principal'), ctrl.deleteBus)

// Student Assignments
router.get('/assignments',                             ctrl.listAssignments)
router.post('/assignments',                            authorize('principal'), ctrl.assignStudent)
router.put('/assignments/:id',                         authorize('principal'), ctrl.updateAssignment)
router.delete('/assignments/:id',                      authorize('principal'), ctrl.removeAssignment)

module.exports = router
