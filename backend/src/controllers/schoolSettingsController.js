const { SchoolSettings } = require('../models')
const { sendSuccess, sendError } = require('../utils/response')
const resolvePrincipalId = require('../utils/resolvePrincipalId')

const getSettings = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    if (!principalId) return sendError(res, 'Principal context required.', 400)

    const [settings] = await SchoolSettings.findOrCreate({
      where: { principalId },
      defaults: { principalId },
    })
    sendSuccess(res, { settings })
  } catch (err) {
    next(err)
  }
}

const updateSettings = async (req, res, next) => {
  try {
    const principalId = await resolvePrincipalId(req)
    if (!principalId) return sendError(res, 'Principal context required.', 400)

    const allowed = [
      'schoolName', 'tagline', 'address', 'phone', 'email',
      'website', 'principalName', 'logoDataUrl', 'signatureDataUrl', 'themeColorId',
    ]
    const data = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k] })

    const [settings] = await SchoolSettings.findOrCreate({ where: { principalId }, defaults: { principalId } })
    await settings.update(data)
    sendSuccess(res, { settings }, 'School settings updated.')
  } catch (err) {
    next(err)
  }
}

module.exports = { getSettings, updateSettings }
