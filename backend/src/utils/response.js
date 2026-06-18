const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data })
}

const sendError = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  const payload = { success: false, message }
  if (errors) payload.errors = errors
  res.status(statusCode).json(payload)
}

const sendPaginated = (res, rows, count, page, limit, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  })
}

module.exports = { sendSuccess, sendError, sendPaginated }
