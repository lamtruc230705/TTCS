const { query, execute } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function register(payload) {
  const { username, email, phone, password } = payload;

  const existedUsername = await query('SELECT id FROM users WHERE username = ?', [username]);
  if (existedUsername.length) {
    throw createHttpError('Ten dang nhap da duoc su dung.', 409);
  }

  const existedEmail = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existedEmail.length) {
    throw createHttpError('Email da duoc su dung.', 409);
  }

  const hashed = await hashPassword(password);
  const result = await execute(
    'INSERT INTO users (username, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [username, email, phone || null, hashed, 'user']
  );

  const users = await query(
    'SELECT id, username, full_name, email, phone, avatar, role, status, created_at FROM users WHERE id = ?',
    [result.insertId]
  );

  return users[0];
}

async function login(payload) {
  const { email, password } = payload;

  const users = await query('SELECT * FROM users WHERE email = ?', [email]);
  if (!users.length) {
    throw createHttpError('Tai khoan khong ton tai.', 404);
  }

  const user = users[0];
  if (user.status !== 'active') {
    throw createHttpError('Tai khoan da bi khoa.', 403);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw createHttpError('Mat khau khong dung.', 401);
  }

  const token = signToken(user);
  delete user.password;

  return { user, token };
}

module.exports = {
  register,
  login
};
