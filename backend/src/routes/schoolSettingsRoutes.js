const router = require('express').Router()
const { getSettings, updateSettings } = require('../controllers/schoolSettingsController')
const { authenticate } = require('../middleware/auth')

router.get('/',  authenticate, getSettings)
router.put('/',  authenticate, updateSettings)

module.exports = router
