const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/database');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Vui long dang nhap.' });
    }

    const decoded = verifyToken(token);
    const users = await query(
      'SELECT id, username, full_name, email, phone, avatar, role, status, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users.length) {
      return res.status(401).json({ success: false, message: 'Tai khoan khong ton tai.' });
    }

    if (users[0].status !== 'active') {
      return res.status(403).json({ success: false, message: 'Tai khoan da bi khoa.' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token khong hop le hoac da het han.' });
  }
}

module.exports = auth;
