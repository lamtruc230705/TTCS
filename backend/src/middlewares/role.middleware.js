function authorize(...roles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Vui long dang nhap.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Ban khong co quyen truy cap.' });
    }

    next();
  };
}

module.exports = authorize;
