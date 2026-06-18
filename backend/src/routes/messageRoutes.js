const router = require('express').Router()
const ctrl = require('../controllers/messageController')
const { authenticate } = require('../middleware/auth')

router.use(authenticate)

router.get('/conversations',              ctrl.listConversations)
router.post('/conversations',             ctrl.createConversation)
router.get('/conversations/:id',          ctrl.getConversation)
router.post('/conversations/:id/messages', ctrl.sendMessage)

module.exports = router
