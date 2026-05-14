const { query, execute } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getArtistByUserId(userId) {
  const rows = await query('SELECT * FROM artists WHERE user_id = ? LIMIT 1', [userId]);
  if (!rows.length) throw createHttpError('Tai khoan chua duoc lien ket voi ho so nghe si.', 404);
  return rows[0];
}

async function getProfile(userId) {
  const artist = await getArtistByUserId(userId);
  const works = await query('SELECT id, title, release_year FROM artist_works WHERE artist_id = ? ORDER BY release_year DESC', [artist.id]);
  return { ...artist, works };
}

async function requestUpdate(userId, newData) {
  const current = await getProfile(userId);
  const { works, ...artistData } = current;
  const oldData = { ...artistData, works };

  const result = await execute(`
    INSERT INTO artist_profile_update_requests (artist_id, requested_by, old_data, new_data, status)
    VALUES (?, ?, ?, ?, 'pending')
  `, [current.id, userId, JSON.stringify(oldData), JSON.stringify(newData)]);

  const admins = await query("SELECT id FROM users WHERE role = 'admin' AND status = 'active'");
  for (const admin of admins) {
    await execute(`
      INSERT INTO notifications (receiver_user_id, sender_user_id, type, title, message, reference_id)
      VALUES (?, ?, 'artist_profile_update', 'Yeu cau cap nhat ho so nghe si', ?, ?)
    `, [admin.id, userId, `Nghe si ${current.stage_name} vua gui yeu cau cap nhat ho so.`, result.insertId]);
  }

  return { request_id: result.insertId, status: 'pending' };
}

module.exports = {
  getProfile,
  requestUpdate,
  getArtistByUserId
};
