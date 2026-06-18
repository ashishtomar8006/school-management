const router = require('express').Router()
const { login, principalRegister, principalLogin, adminLogin, getMe, changePassword, updateProfile } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

// Standard login (teachers / students / parents)
router.post('/login', login)

// Principal portal
router.post('/principal/register', principalRegister)
router.post('/principal/login',    principalLogin)

// Admin portal
router.post('/admin/login', adminLogin)

// Authenticated routes (work for all types via the updated middleware)
router.get('/me',              authenticate, getMe)
router.put('/change-password', authenticate, changePassword)
router.put('/profile',         authenticate, updateProfile)

module.exports = router
