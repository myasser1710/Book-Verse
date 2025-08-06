export const sendSuccess = (
  res,
  statusCode = 200,
  message = 'success',
  data = {}
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

export const sendError = (
  res,
  statusCode = 500,
  message = 'Internal Server Error',
  error = {}
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error
      ? {
          name: error.name || 'Error',
          message: error.message || message,
          details: error.details || null
        }
      : null
  })
}
