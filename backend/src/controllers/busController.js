const { Bus, BusRoute, RouteStop, BusAssignment, Student, User } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const routeInclude = [{ model: RouteStop, as: 'stops', order: [['order', 'ASC']] }]
const busInclude   = [{ model: BusRoute, as: 'route', include: [{ model: RouteStop, as: 'stops' }] }]

// ── Routes ─────────────────────────────────────────────────────────────────────

const listRoutes = async (req, res, next) => {
  try {
    const { status } = req.query
    const where = {}
    if (status) where.status = status

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const routes = await BusRoute.findAll({
      where,
      include: [
        { model: RouteStop, as: 'stops', order: [['order', 'ASC']] },
        { model: Bus, as: 'buses', attributes: ['id', 'busNumber', 'status'] },
      ],
      order: [['routeName', 'ASC']],
    })
    sendSuccess(res, routes)
  } catch (err) { next(err) }
}

const getRoute = async (req, res, next) => {
  try {
    const route = await BusRoute.findByPk(req.params.id, { include: routeInclude })
    if (!route) return sendError(res, 'Route not found.', 404)
    sendSuccess(res, route)
  } catch (err) { next(err) }
}

const createRoute = async (req, res, next) => {
  try {
    const { stops, ...routeData } = req.body
    const principalId = await resolvePrincipalId(req)
    const route = await BusRoute.create({ ...routeData, principalId })

    if (Array.isArray(stops) && stops.length > 0) {
      await RouteStop.bulkCreate(stops.map((s, i) => ({ ...s, routeId: route.id, order: s.order ?? i + 1 })))
    }

    const result = await BusRoute.findByPk(route.id, { include: routeInclude })
    sendSuccess(res, result, 'Route created.', 201)
  } catch (err) { next(err) }
}

const updateRoute = async (req, res, next) => {
  try {
    const route = await BusRoute.findByPk(req.params.id)
    if (!route) return sendError(res, 'Route not found.', 404)
    const { stops, ...routeData } = req.body
    await route.update(routeData)
    sendSuccess(res, route, 'Route updated.')
  } catch (err) { next(err) }
}

const deleteRoute = async (req, res, next) => {
  try {
    const route = await BusRoute.findByPk(req.params.id)
    if (!route) return sendError(res, 'Route not found.', 404)
    await route.destroy()
    sendSuccess(res, null, 'Route deleted.')
  } catch (err) { next(err) }
}

// ── Stops ──────────────────────────────────────────────────────────────────────

const addStop = async (req, res, next) => {
  try {
    const route = await BusRoute.findByPk(req.params.routeId)
    if (!route) return sendError(res, 'Route not found.', 404)
    const stop = await RouteStop.create({ ...req.body, routeId: route.id })
    sendSuccess(res, stop, 'Stop added.', 201)
  } catch (err) { next(err) }
}

const updateStop = async (req, res, next) => {
  try {
    const stop = await RouteStop.findByPk(req.params.stopId)
    if (!stop) return sendError(res, 'Stop not found.', 404)
    await stop.update(req.body)
    sendSuccess(res, stop, 'Stop updated.')
  } catch (err) { next(err) }
}

const deleteStop = async (req, res, next) => {
  try {
    const stop = await RouteStop.findByPk(req.params.stopId)
    if (!stop) return sendError(res, 'Stop not found.', 404)
    await stop.destroy()
    sendSuccess(res, null, 'Stop deleted.')
  } catch (err) { next(err) }
}

// ── Buses ──────────────────────────────────────────────────────────────────────

const listBuses = async (req, res, next) => {
  try {
    const { status, routeId } = req.query
    const where = {}
    if (status)  where.status = status
    if (routeId) where.routeId = routeId

    const principalId = await resolvePrincipalId(req)
    if (principalId) where.principalId = principalId

    const buses = await Bus.findAll({ where, include: busInclude, order: [['busNumber', 'ASC']] })
    sendSuccess(res, buses)
  } catch (err) { next(err) }
}

const getBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByPk(req.params.id, { include: busInclude })
    if (!bus) return sendError(res, 'Bus not found.', 404)
    sendSuccess(res, bus)
  } catch (err) { next(err) }
}

const createBus = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    const bus = await Bus.create({ ...req.body, principalId })
    const result = await Bus.findByPk(bus.id, { include: busInclude })
    sendSuccess(res, result, 'Bus created.', 201)
  } catch (err) { next(err) }
}

const updateBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByPk(req.params.id)
    if (!bus) return sendError(res, 'Bus not found.', 404)
    await bus.update(req.body)
    const result = await Bus.findByPk(bus.id, { include: busInclude })
    sendSuccess(res, result, 'Bus updated.')
  } catch (err) { next(err) }
}

const deleteBus = async (req, res, next) => {
  try {
    const bus = await Bus.findByPk(req.params.id)
    if (!bus) return sendError(res, 'Bus not found.', 404)
    await bus.destroy()
    sendSuccess(res, null, 'Bus deleted.')
  } catch (err) { next(err) }
}

// ── Assignments ────────────────────────────────────────────────────────────────

const listAssignments = async (req, res, next) => {
  try {
    const { busId, status = 'active' } = req.query
    const where = { status }
    if (busId) where.busId = busId
    const assignments = await BusAssignment.findAll({
      where,
      include: [
        { model: Bus, as: 'bus', include: [{ model: BusRoute, as: 'route' }] },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] },
      ],
      order: [[{ model: Student, as: 'student' }, { model: User, as: 'user' }, 'name', 'ASC']],
    })
    sendSuccess(res, assignments)
  } catch (err) { next(err) }
}

const assignStudent = async (req, res, next) => {
  try {
    const { studentId, busId, pickupStop } = req.body

    const bus = await Bus.findByPk(busId)
    if (!bus) return sendError(res, 'Bus not found.', 404)

    const occupied = await BusAssignment.count({ where: { busId, status: 'active' } })
    if (occupied >= bus.capacity) return sendError(res, 'Bus is at full capacity.', 400)

    await BusAssignment.update({ status: 'inactive' }, { where: { studentId, status: 'active' } })

    const assignment = await BusAssignment.create({ studentId, busId, pickupStop, assignedDate: new Date(), status: 'active' })

    const result = await BusAssignment.findByPk(assignment.id, {
      include: [
        { model: Bus, as: 'bus', include: [{ model: BusRoute, as: 'route' }] },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['name'] }] },
      ],
    })
    sendSuccess(res, result, 'Student assigned to bus.', 201)
  } catch (err) { next(err) }
}

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await BusAssignment.findByPk(req.params.id)
    if (!assignment) return sendError(res, 'Assignment not found.', 404)
    await assignment.update(req.body)
    sendSuccess(res, assignment, 'Assignment updated.')
  } catch (err) { next(err) }
}

const removeAssignment = async (req, res, next) => {
  try {
    const assignment = await BusAssignment.findByPk(req.params.id)
    if (!assignment) return sendError(res, 'Assignment not found.', 404)
    await assignment.update({ status: 'inactive' })
    sendSuccess(res, null, 'Student removed from bus.')
  } catch (err) { next(err) }
}

module.exports = {
  listRoutes, getRoute, createRoute, updateRoute, deleteRoute,
  addStop, updateStop, deleteStop,
  listBuses, getBus, createBus, updateBus, deleteBus,
  listAssignments, assignStudent, updateAssignment, removeAssignment,
}
