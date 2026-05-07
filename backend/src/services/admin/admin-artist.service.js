const { query, execute, transaction } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function syncWorks(connection, artistId, works = []) {
  await connection.execute('DELETE FROM artist_works WHERE artist_id = ?', [artistId]);
  for (const work of works) {
    await connection.execute('INSERT INTO artist_works (artist_id, title, release_year) VALUES (?, ?, ?)', [artistId, work.title, work.release_year || null]);
  }
}

async function getArtists(params = {}) {
  const search = params.search ? `%${params.search}%` : null;
  return query(`
    SELECT a.*, u.username, u.email
    FROM artists a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE ? IS NULL OR a.stage_name LIKE ? OR a.full_name LIKE ?
    ORDER BY a.updated_at DESC
  `, [search, search, search]);
}

async function createArtist(payload) {
  return transaction(async (connection) => {
    const [result] = await connection.execute(`
      INSERT INTO artists (
        user_id, stage_name, full_name, first_name, last_name, image, birth_date,
        height, weight, partner_name, partner_artist_id, mascot, artist_role,
        description, is_featured, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      payload.user_id || null,
      payload.stage_name,
      payload.full_name || null,
      payload.first_name || null,
      payload.last_name || null,
      payload.image || null,
      payload.birth_date || null,
      payload.height || null,
      payload.weight || null,
      payload.partner_name || null,
      payload.partner_artist_id || null,
      payload.mascot || null,
      payload.artist_role || null,
      payload.description || null,
      payload.is_featured || false,
      payload.status || 'active'
    ]);

    await syncWorks(connection, result.insertId, payload.works || []);

    if (payload.user_id) {
      await connection.execute("UPDATE users SET role = 'artist' WHERE id = ?", [payload.user_id]);
    }

    return { id: result.insertId };
  });
}

async function getArtistDetail(id) {
  const rows = await query('SELECT * FROM artists WHERE id = ?', [id]);
  if (!rows.length) throw createHttpError('Khong tim thay nghe si.', 404);
  const works = await query('SELECT id, title, release_year FROM artist_works WHERE artist_id = ?', [id]);
  return { ...rows[0], works };
}

async function updateArtist(id, payload) {
  await getArtistDetail(id);
  return transaction(async (connection) => {
    const fields = [];
    const params = [];
    for (const key of [
      'user_id', 'stage_name', 'full_name', 'first_name', 'last_name', 'image', 'birth_date',
      'height', 'weight', 'partner_name', 'partner_artist_id', 'mascot', 'artist_role',
      'description', 'is_featured', 'status'
    ]) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        fields.push(`${key} = ?`);
        params.push(payload[key]);
      }
    }

    if (fields.length) {
      params.push(id);
      await connection.execute(`UPDATE artists SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'works')) {
      await syncWorks(connection, id, payload.works || []);
    }

    return getArtistDetail(id);
  });
}

async function deleteArtist(id) {
  const result = await execute('DELETE FROM artists WHERE id = ?', [id]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay nghe si.', 404);
}

async function getSchedules(artistId) {
  return query('SELECT * FROM artist_schedules WHERE artist_id = ? ORDER BY event_date ASC, start_time ASC', [artistId]);
}

async function createSchedule(adminUserId, artistId, payload) {
  const artists = await query('SELECT id FROM artists WHERE id = ?', [artistId]);
  if (!artists.length) throw createHttpError('Khong tim thay nghe si.', 404);

  const result = await execute(`
    INSERT INTO artist_schedules (artist_id, title, event_date, start_time, end_time, status, note, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [artistId, payload.title, payload.event_date, payload.start_time || null, payload.end_time || null, payload.status || 'upcoming', payload.note || null, adminUserId]);

  return { id: result.insertId };
}

async function getProfileRequests(params = {}) {
  const status = params.status || null;
  return query(`
    SELECT r.*, a.stage_name, u.username AS requested_username
    FROM artist_profile_update_requests r
    JOIN artists a ON a.id = r.artist_id
    JOIN users u ON u.id = r.requested_by
    WHERE ? IS NULL OR r.status = ?
    ORDER BY r.created_at DESC
  `, [status, status]);
}

async function approveProfileRequest(adminUserId, requestId) {
  return transaction(async (connection) => {
    const [requests] = await connection.query('SELECT * FROM artist_profile_update_requests WHERE id = ? FOR UPDATE', [requestId]);
    if (!requests.length) throw createHttpError('Khong tim thay yeu cau.', 404);
    const request = requests[0];
    if (request.status !== 'pending') throw createHttpError('Yeu cau nay da duoc xu ly.', 422);

    const newData = typeof request.new_data === 'string' ? JSON.parse(request.new_data) : request.new_data;

    const fields = [];
    const params = [];
    for (const key of [
      'stage_name', 'full_name', 'first_name', 'last_name', 'image', 'birth_date',
      'height', 'weight', 'partner_name', 'partner_artist_id', 'mascot', 'artist_role',
      'description', 'is_featured', 'status'
    ]) {
      if (Object.prototype.hasOwnProperty.call(newData, key)) {
        fields.push(`${key} = ?`);
        params.push(newData[key]);
      }
    }

    if (fields.length) {
      params.push(request.artist_id);
      await connection.execute(`UPDATE artists SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (Array.isArray(newData.works)) {
      await syncWorks(connection, request.artist_id, newData.works);
    }

    await connection.execute(
      "UPDATE artist_profile_update_requests SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [adminUserId, requestId]
    );

    await connection.execute(`
      INSERT INTO notifications (receiver_user_id, sender_user_id, type, title, message, reference_id)
      VALUES (?, ?, 'artist_profile_update', 'Ho so nghe si da duoc duyet', 'Admin da duyet yeu cau cap nhat ho so cua ban.', ?)
    `, [request.requested_by, adminUserId, requestId]);

    return { id: requestId, status: 'approved' };
  });
}

async function rejectProfileRequest(adminUserId, requestId, adminNote = null) {
  const result = await execute(`
    UPDATE artist_profile_update_requests
    SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), admin_note = ?
    WHERE id = ? AND status = 'pending'
  `, [adminUserId, adminNote || null, requestId]);

  if (!result.affectedRows) throw createHttpError('Khong tim thay yeu cau dang cho duyet.', 404);

  const requests = await query('SELECT requested_by FROM artist_profile_update_requests WHERE id = ?', [requestId]);
  if (requests.length) {
    await execute(`
      INSERT INTO notifications (receiver_user_id, sender_user_id, type, title, message, reference_id)
      VALUES (?, ?, 'artist_profile_update', 'Ho so nghe si bi tu choi', ?, ?)
    `, [requests[0].requested_by, adminUserId, adminNote || 'Admin da tu choi yeu cau cap nhat ho so cua ban.', requestId]);
  }

  return { id: requestId, status: 'rejected' };
}

module.exports = {
  getArtists,
  createArtist,
  getArtistDetail,
  updateArtist,
  deleteArtist,
  getSchedules,
  createSchedule,
  getProfileRequests,
  approveProfileRequest,
  rejectProfileRequest
};
