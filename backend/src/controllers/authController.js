const jwt = require('jsonwebtoken')
const { User, Teacher, Student, Parent, Principal, Admin } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')

// JWT now includes `type` so the middleware knows which table to query
const signToken = (id, type = 'user') =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ─── Standard login (teachers / students / parents / principals) ──────────────

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return sendError(res, 'Email and password are required.', 400)

    // ── Check Principals table first ──────────────────────────────────────────
    const principal = await Principal.findOne({ where: { email } })
    if (principal) {
      if (!principal.isActive) return sendError(res, 'Invalid credentials.', 401)
      const valid = await principal.validatePassword(password)
      if (!valid) return sendError(res, 'Invalid credentials.', 401)

      const token = signToken(principal.id, 'principal')
      const user = {
        id:       principal.id,
        name:     principal.name,
        email:    principal.email,
        role:     'principal',
        phone:    principal.phone,
        address:  principal.address,
        isActive: principal.isActive,
      }
      const { password: _pw, ...safeProfile } = principal.toJSON()
      return sendSuccess(res, { token, user, profile: safeProfile }, 'Login successful')
    }

    // ── Fall through to Users table (teachers / students / parents) ───────────
    const user = await User.findOne({ where: { email } })
    if (!user || !user.isActive) return sendError(res, 'Invalid credentials.', 401)

    const valid = await user.validatePassword(password)
    if (!valid) return sendError(res, 'Invalid credentials.', 401)

    const token = signToken(user.id, 'user')

    let profile = null
    if (user.role === 'teacher') profile = await Teacher.findOne({ where: { userId: user.id } })
    if (user.role === 'student') profile = await Student.findOne({ where: { userId: user.id } })
    if (user.role === 'parent')  profile = await Parent.findOne({ where: { userId: user.id } })

    sendSuccess(res, { token, user, profile }, 'Login successful')
  } catch (err) { next(err) }
}

// ─── Principal register ───────────────────────────────────────────────────────

const principalRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, schoolName } = req.body
    if (!name || !email || !password) return sendError(res, 'Name, email and password are required.', 400)

    const exists = await Principal.findOne({ where: { email } })
    if (exists) return sendError(res, 'A principal with this email already exists.', 409)

    const principal = await Principal.create({ name, email, password, phone, address, schoolName })

    const safe = { id: principal.id, name: principal.name, email: principal.email, role: 'principal', phone: principal.phone, address: principal.address, isActive: principal.isActive }
    const token = signToken(principal.id, 'principal')

    sendSuccess(res, { token, user: safe, profile: principal }, 'Principal registered successfully.', 201)
  } catch (err) { next(err) }
}

// ─── Principal login ──────────────────────────────────────────────────────────

const principalLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return sendError(res, 'Email and password are required.', 400)

    const principal = await Principal.findOne({ where: { email } })
    if (!principal || !principal.isActive) return sendError(res, 'Invalid credentials.', 401)

    const valid = await principal.validatePassword(password)
    if (!valid) return sendError(res, 'Invalid credentials.', 401)

    const token = signToken(principal.id, 'principal')

    // Shape the response to match the AuthUser interface the frontend expects
    const user = {
      id:       principal.id,
      name:     principal.name,
      email:    principal.email,
      role:     'principal',
      phone:    principal.phone,
      address:  principal.address,
      isActive: principal.isActive,
    }

    const { password: _pw, ...safeProfile } = principal.toJSON()
    sendSuccess(res, { token, user, profile: safeProfile }, 'Login successful')
  } catch (err) { next(err) }
}

// ─── Admin login ──────────────────────────────────────────────────────────────

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return sendError(res, 'Email and password are required.', 400)

    const admin = await Admin.findOne({ where: { email } })
    if (!admin || !admin.isActive) return sendError(res, 'Invalid credentials.', 401)

    const valid = await admin.validatePassword(password)
    if (!valid) return sendError(res, 'Invalid credentials.', 401)

    const token = signToken(admin.id, 'admin')
    const user  = { id: admin.id, name: admin.name, email: admin.email, role: 'admin', isActive: admin.isActive }

    sendSuccess(res, { token, user, profile: admin }, 'Admin login successful')
  } catch (err) { next(err) }
}

// ─── Get current user ─────────────────────────────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    // req.user is already set by the authenticate middleware (from correct table)
    let profile = null
    if (req.user.role === 'teacher') profile = await Teacher.findOne({ where: { userId: req.user.id } })
    if (req.user.role === 'student') profile = await Student.findOne({ where: { userId: req.user.id } })
    if (req.user.role === 'parent')  profile = await Parent.findOne({ where: { userId: req.user.id } })
    if (req.user.role === 'principal') {
      profile = await Principal.findByPk(req.user.id, { attributes: { exclude: ['password'] } })
    }
    sendSuccess(res, { user: req.user, profile })
  } catch (err) { next(err) }
}

// ─── Change password ──────────────────────────────────────────────────────────

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    let account

    if (req.user.role === 'principal') {
      account = await Principal.findByPk(req.user.id)
    } else {
      account = await User.findByPk(req.user.id)
    }

    const valid = await account.validatePassword(currentPassword)
    if (!valid) return sendError(res, 'Current password is incorrect.', 400)

    account.password = newPassword
    await account.save()
    sendSuccess(res, null, 'Password changed successfully.')
  } catch (err) { next(err) }
}

// ─── Update profile ───────────────────────────────────────────────────────────

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body
    let account

    if (req.user.role === 'principal') {
      account = await Principal.findByPk(req.user.id)
      if (name    !== undefined) account.name    = name
      if (phone   !== undefined) account.phone   = phone
      if (address !== undefined) account.address = address
      await account.save()
      const user = { id: account.id, name: account.name, email: account.email, role: 'principal', phone: account.phone, address: account.address, isActive: account.isActive }
      return sendSuccess(res, { user }, 'Profile updated successfully.')
    }

    account = await User.findByPk(req.user.id)
    if (name    !== undefined) account.name    = name
    if (phone   !== undefined) account.phone   = phone
    if (address !== undefined) account.address = address
    await account.save()
    sendSuccess(res, { user: account }, 'Profile updated successfully.')
  } catch (err) { next(err) }
}

module.exports = { login, principalRegister, principalLogin, adminLogin, getMe, changePassword, updateProfile }
