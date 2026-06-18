const { Teacher, Student, Parent, Principal } = require('../models')

/**
 * Derives the principalId from the authenticated request.
 *   - principal  → req.user.id IS the principalId
 *   - teacher    → look up Teacher row → its principalId
 *   - student    → look up Student row → its principalId
 *   - parent     → look up Parent  row → its principalId
 *   - fallback   → first active Principal in the DB
 */
async function resolvePrincipalId(req) {
  if (req.user.role === 'principal') return req.user.id

  const userId = req.user.id
  const role   = req.user.role

  let profile = null
  if (role === 'teacher')  profile = await Teacher.findOne({ where: { userId } })
  else if (role === 'student') profile = await Student.findOne({ where: { userId } })
  else if (role === 'parent')  profile = await Parent.findOne({ where: { userId } })

  if (profile?.principalId) return profile.principalId

  const p = await Principal.findOne({ where: { isActive: true } })
  return p?.id ?? null
}

module.exports = resolvePrincipalId
