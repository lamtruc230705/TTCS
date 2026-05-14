const { query, execute, transaction } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getUsers(params = {}) {
  const search = params.search ? `%${params.search}%` : null;
  return query(`
    SELECT id, username, full_name, email, phone, avatar, role, status, created_at, updated_at
    FROM users
    WHERE ? IS NULL OR username LIKE ? OR full_name LIKE ? OR email LIKE ?
    ORDER BY created_at DESC
  `, [search, search, search, search]);
}

async function createUser(payload) {
  const existed = await query(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [payload.username, payload.email]
  );

  if (existed.length) {
    throw createHttpError('Username hoac email da ton tai.', 409);
  }

  const role = payload.role || 'user';
  const status = payload.status || 'active';
  const hashed = await hashPassword(payload.password);

  const result = await execute(`
    INSERT INTO users (username, full_name, email, phone, password, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    payload.username,
    payload.full_name || null,
    payload.email,
    payload.phone || null,
    hashed,
    role,
    status
  ]);

  if (role === 'artist') {
    await execute(
      'INSERT INTO artists (user_id, stage_name, full_name) VALUES (?, ?, ?)',
      [
        result.insertId,
        payload.full_name || payload.username,
        payload.full_name || payload.username
      ]
    );
  }

  return getUserDetail(result.insertId);
}

async function getUserDetail(id) {
  const rows = await query(
    'SELECT id, username, full_name, email, phone, avatar, role, status, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  if (!rows.length) throw createHttpError('Khong tim thay nguoi dung.', 404);
  return rows[0];
}

async function updateUser(id, payload) {
  const current = await getUserDetail(id);
  if (Object.prototype.hasOwnProperty.call(payload, 'username') && payload.username !== current.username) {
    throw createHttpError('Khong cho phep thay doi username sau khi dang ky.', 422);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'email') && payload.email !== current.email) {
    throw createHttpError('Khong cho phep thay doi email sau khi dang ky.', 422);
  }
  if (Object.prototype.hasOwnProperty.call(payload, 'password')) {
    throw createHttpError('Khong cho phep thay doi mat khau trong chuc nang nay.', 422);
  }

  const fields = [];
  const params = [];
  for (const key of ['full_name', 'phone', 'role', 'status']) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  }

  if (fields.length) {
    params.push(id);
    await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  if (payload.role === 'artist') {
    const artists = await query('SELECT id FROM artists WHERE user_id = ?', [id]);
    if (!artists.length) {
      await execute('INSERT INTO artists (user_id, stage_name, full_name) VALUES (?, ?, ?)', [id, payload.full_name || current.full_name || current.username, payload.full_name || current.full_name || current.username]);
    }
  }

  return getUserDetail(id);
}

async function deleteUser(id) {
  const result = await execute('DELETE FROM users WHERE id = ?', [id]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay nguoi dung.', 404);
}

async function changeRole(id, role) {
  if (!['user', 'artist', 'admin'].includes(role)) throw createHttpError('Vai tro khong hop le.', 422);
  return transaction(async (connection) => {
    const [users] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!users.length) throw createHttpError('Khong tim thay nguoi dung.', 404);

    await connection.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);

    if (role === 'artist') {
      const [artists] = await connection.query('SELECT id FROM artists WHERE user_id = ?', [id]);
      if (!artists.length) {
        await connection.execute('INSERT INTO artists (user_id, stage_name, full_name) VALUES (?, ?, ?)', [id, users[0].full_name || users[0].username, users[0].full_name || users[0].username]);
      }
    }

    const [updated] = await connection.query('SELECT id, username, full_name, email, phone, role, status FROM users WHERE id = ?', [id]);
    return updated[0];
  });
}

module.exports = { getUsers, createUser, getUserDetail, updateUser, deleteUser, changeRole };
