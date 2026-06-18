const jwt = require('jsonwebtoken')
const { sendError } = require('../utils/response')
const { User, Principal, Admin } = require('../models')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401)
    }

    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const type    = decoded.type || 'user'   // backward-compat: old tokens have no type

    let account

    if (type === 'principal') {
      account = await Principal.findByPk(decoded.id, { attributes: { exclude: ['password'] } })
      if (!account || !account.isActive) return sendError(res, 'Principal not found or inactive.', 401)
      // Shape to match AuthUser interface
      req.user = {
        id:       account.id,
        name:     account.name,
        email:    account.email,
        role:     'principal',
        phone:    account.phone,
        address:  account.address,
        isActive: account.isActive,
      }
    } else if (type === 'admin') {
      account = await Admin.findByPk(decoded.id, { attributes: { exclude: ['password'] } })
      if (!account || !account.isActive) return sendError(res, 'Admin not found or inactive.', 401)
      req.user = { id: account.id, name: account.name, email: account.email, role: 'admin', isActive: account.isActive }
    } else {
      account = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } })
      if (!account || !account.isActive) return sendError(res, 'User not found or inactive.', 401)
      req.user = account
    }

    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired.', 401)
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token.', 401)
    next(err)
  }
}

module.exports = { authenticate }
