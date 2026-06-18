const { Conversation, ConversationParticipant, Message, User } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')

const convInclude = [
  { model: User, as: 'participants', attributes: ['id', 'name', 'role', 'avatar'], through: { attributes: [] } },
  { model: Message, as: 'messages', limit: 1, order: [['createdAt', 'DESC']], include: [{ model: User, as: 'sender', attributes: ['id', 'name'] }] },
]

const listConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.findAll({
      include: convInclude,
      where: { '$participants.id$': req.user.id },
      order: [['lastMessageAt', 'DESC']],
    })
    sendSuccess(res, conversations)
  } catch (err) { next(err) }
}

const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'participants', attributes: ['id', 'name', 'role', 'avatar'], through: { attributes: [] } },
        { model: Message, as: 'messages', order: [['createdAt', 'ASC']], include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }] },
      ],
    })
    if (!conversation) return sendError(res, 'Conversation not found.', 404)

    // Mark messages as read
    await Message.update({ isRead: true }, { where: { conversationId: conversation.id, senderId: { $ne: req.user.id } } })

    sendSuccess(res, conversation)
  } catch (err) { next(err) }
}

const createConversation = async (req, res, next) => {
  try {
    const { participantIds, title, firstMessage } = req.body
    const allParticipants = [...new Set([req.user.id, ...participantIds])]

    const conversation = await Conversation.create({ title, lastMessageAt: new Date() })
    await ConversationParticipant.bulkCreate(
      allParticipants.map(userId => ({ conversationId: conversation.id, userId }))
    )

    if (firstMessage) {
      await Message.create({ conversationId: conversation.id, senderId: req.user.id, content: firstMessage })
    }

    const result = await Conversation.findByPk(conversation.id, { include: convInclude })
    sendSuccess(res, result, 'Conversation created.', 201)
  } catch (err) { next(err) }
}

const sendMessage = async (req, res, next) => {
  try {
    const { content, attachments } = req.body
    if (!content) return sendError(res, 'Message content is required.', 400)

    const conversation = await Conversation.findByPk(req.params.id)
    if (!conversation) return sendError(res, 'Conversation not found.', 404)

    const message = await Message.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      content,
      attachments: attachments || [],
    })
    await conversation.update({ lastMessageAt: new Date() })

    const result = await Message.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatar'] }],
    })
    sendSuccess(res, result, 'Message sent.', 201)
  } catch (err) { next(err) }
}

module.exports = { listConversations, getConversation, createConversation, sendMessage }
