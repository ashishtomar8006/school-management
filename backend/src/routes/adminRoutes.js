const router = require('express').Router()
const { authenticate } = require('../middleware/auth')
const { adminOnly }    = require('../middleware/adminAuth')
const {
  listPrincipals, getPrincipal, createPrincipal,
  updatePrincipal, togglePrincipal, deletePrincipal, getAdminStats,
} = require('../controllers/adminController')

// All admin routes require a valid admin JWT
router.use(authenticate, adminOnly)

router.get('/stats',                getAdminStats)
router.get('/principals',           listPrincipals)
router.post('/principals',          createPrincipal)
router.get('/principals/:id',       getPrincipal)
router.put('/principals/:id',       updatePrincipal)
router.put('/principals/:id/toggle', togglePrincipal)
router.delete('/principals/:id',    deletePrincipal)

module.exports = router
