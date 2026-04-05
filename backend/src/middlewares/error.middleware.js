// gom lỗi server về một chỗ

function errorMiddleware(err, req, res, next) {
  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Lỗi server",
    error: err.message
  });
}

module.exports = errorMiddleware;