const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')

// Maps Sequelize column/field names to user-friendly labels and form field names
const FIELD_MAP = {
  email:              { field: 'email',              label: 'Email address' },
  rollNumber:         { field: 'rollNumber',         label: 'Roll number' },
  employeeCode:       { field: 'employeeCode',       label: 'Employee code' },
  busNumber:          { field: 'busNumber',          label: 'Bus number' },
  registrationNumber: { field: 'registrationNumber', label: 'Registration number' },
  subjectCode:        { field: 'subjectCode',        label: 'Subject code' },
  roomNumber:         { field: 'roomNumber',         label: 'Room number' },
  phone:              { field: 'phone',              label: 'Phone number' },
}

function resolveUniqueField(path = '') {
  // Sequelize may return "Users.email" or just "email" — normalise both
  const key = path.split('.').pop() || path
  return FIELD_MAP[key] ?? { field: key, label: key.charAt(0).toUpperCase() + key.slice(1) }
}

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', err.name, err.message)
  }

  // ── Duplicate / unique constraint ─────────────────────────────────────────────
  // MUST come before ValidationError — UniqueConstraintError extends ValidationError
  // so instanceof ValidationError would match it first if checked in the wrong order.
  if (err instanceof UniqueConstraintError) {
    const rawPath = err.errors[0]?.path ?? ''
    const { field, label } = resolveUniqueField(rawPath)
    return res.status(409).json({
      success: false,
      message: `${label} is already registered. Please use a different ${label.toLowerCase()}.`,
      field,   // machine-readable field name so the frontend can highlight the right input
    })
  }

  // ── Other Sequelize validation errors (field format, length, etc.) ───────────
  if (err instanceof ValidationError) {
    const errors = err.errors.map(e => ({ field: e.path, message: e.message }))
    return res.status(400).json({
      success: false,
      message: 'Please check the fields and try again.',
      errors,
    })
  }

  // ── Foreign key constraint ────────────────────────────────────────────────────
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist.',
    })
  }

  // ── Generic HTTP errors ───────────────────────────────────────────────────────
  const status  = err.status || err.statusCode || 500
  const message = status < 500
    ? (err.message || 'Request failed.')
    : 'An internal server error occurred. Please try again later.'

  res.status(status).json({ success: false, message })
}

module.exports = errorHandler
