function notFound(req, res, next) {
  return res.status(404).json({
    success: false,
    message: 'Khong tim thay API.'
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Loi may chu.',
    details: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

module.exports = {
  notFound,
  errorHandler
};
