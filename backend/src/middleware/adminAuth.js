const { sendError } = require('../utils/response')

// Only allows requests from admin accounts
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendError(res, 'Access denied. Admin only.', 403)
  }
  next()
}

module.exports = { adminOnly }
