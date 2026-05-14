const { query, execute, transaction } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureArtistUserCanLink(connection, userId, currentArtistId = null) {
  if (!userId) {
    throw createHttpError('Vui lòng chọn Gmail tài khoản artist.', 400);
  }

  const normalizedUserId = Number(userId);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw createHttpError('Gmail tài khoản artist không hợp lệ.', 400);
  }

  const [users] = await connection.execute(
    `
    SELECT id, username, email, role
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [normalizedUserId]
  );

  if (!users.length) {
    throw createHttpError('Gmail tài khoản artist không tồn tại.', 404);
  }

  const user = users[0];

  if (user.role !== 'artist') {
    throw createHttpError('Gmail được chọn không phải tài khoản có vai trò artist.', 400);
  }

  let sql = `
    SELECT id, stage_name
    FROM artists
    WHERE user_id = ?
  `;

  const params = [normalizedUserId];

  if (currentArtistId) {
    sql += ' AND id <> ?';
    params.push(currentArtistId);
  }

  const [linkedArtists] = await connection.execute(sql, params);

  if (linkedArtists.length) {
    throw createHttpError(
      `Gmail này đã được liên kết với nghệ sĩ: ${linkedArtists[0].stage_name || 'khác'}.`,
      409
    );
  }

  return user;
}


function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function emptyToNull(value) {
  if (value === undefined || value === null) return null;

  const text = String(value).trim();
  return text === '' ? null : value;
}

function normalizeBoolean(value) {
  return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
}

function normalizeWorks(works = []) {
  if (!Array.isArray(works)) return [];

  return works
    .map((work) => {
      const title = String(work.title || '').trim();
      const year = work.release_year ? Number(work.release_year) : null;

      return {
        title,
        release_year: Number.isInteger(year) ? year : null
      };
    })
    .filter((work) => work.title);
}

async function syncWorks(connection, artistId, works = []) {
  const normalizedWorks = normalizeWorks(works);

  await connection.execute(
    'DELETE FROM artist_works WHERE artist_id = ?',
    [artistId]
  );

  for (const work of normalizedWorks) {
    await connection.execute(
      `
      INSERT INTO artist_works (artist_id, title, release_year)
      VALUES (?, ?, ?)
      `,
      [artistId, work.title, work.release_year]
    );
  }
}

async function ensureArtistUserCanLink(connection, userId, currentArtistId = null) {
  if (!userId) {
    throw createHttpError('Vui lòng chọn Gmail tài khoản artist.', 400);
  }

  const normalizedUserId = Number(userId);

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw createHttpError('Gmail tài khoản artist không hợp lệ.', 400);
  }

  const [users] = await connection.execute(
    `
    SELECT id, username, email, role
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [normalizedUserId]
  );

  if (!users.length) {
    throw createHttpError('Gmail tài khoản artist không tồn tại.', 404);
  }

  const user = users[0];

  if (user.role !== 'artist') {
    throw createHttpError('Gmail được chọn không phải tài khoản có vai trò artist.', 400);
  }

  let sql = `
    SELECT id, stage_name
    FROM artists
    WHERE user_id = ?
  `;

  const params = [normalizedUserId];

  if (currentArtistId) {
    sql += ' AND id <> ?';
    params.push(currentArtistId);
  }

  const [linkedArtists] = await connection.execute(sql, params);

  if (linkedArtists.length) {
    throw createHttpError(
      `Gmail này đã được liên kết với nghệ sĩ: ${linkedArtists[0].stage_name || 'khác'}.`,
      409
    );
  }

  return user;
}

async function getArtistDetailByConnection(connection, id) {
  const [rows] = await connection.execute(
    `
    SELECT
      a.*,
      u.username,
      u.email AS gmail,
      u.email AS user_email,
      u.phone,
      u.role AS user_role
    FROM artists a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) {
    throw createHttpError('Không tìm thấy nghệ sĩ.', 404);
  }

  const [works] = await connection.execute(
    `
    SELECT id, title, release_year
    FROM artist_works
    WHERE artist_id = ?
    ORDER BY id ASC
    `,
    [id]
  );

  return {
    ...rows[0],
    works
  };
}

async function getArtists(params = {}) {
  const search = params.search ? `%${params.search}%` : null;

  return query(
    `
    SELECT
      a.*,
      u.username,
      u.email AS gmail,
      u.email AS user_email,
      u.phone,
      u.role AS user_role
    FROM artists a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE
      ? IS NULL
      OR a.stage_name LIKE ?
      OR a.full_name LIKE ?
      OR u.email LIKE ?
      OR u.username LIKE ?
    ORDER BY a.updated_at DESC, a.id DESC
    `,
    [search, search, search, search, search]
  );
}

async function createArtist(payload) {
  return transaction(async (connection) => {
    if (!payload.stage_name || !String(payload.stage_name).trim()) {
      throw createHttpError('Vui lòng nhập nghệ danh.', 400);
    }

    await ensureArtistUserCanLink(connection, payload.user_id);

    const [result] = await connection.execute(
      `
      INSERT INTO artists (
        user_id,
        stage_name,
        full_name,
        first_name,
        last_name,
        image,
        birth_date,
        height,
        weight,
        partner_name,
        partner_artist_id,
        mascot,
        artist_role,
        description,
        is_featured,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Number(payload.user_id),
        String(payload.stage_name).trim(),
        emptyToNull(payload.full_name),
        emptyToNull(payload.first_name),
        emptyToNull(payload.last_name),
        emptyToNull(payload.image),
        payload.birth_date || null,
        emptyToNull(payload.height),
        emptyToNull(payload.weight),
        emptyToNull(payload.partner_name),
        payload.partner_artist_id || null,
        emptyToNull(payload.mascot),
        emptyToNull(payload.artist_role),
        emptyToNull(payload.description),
        normalizeBoolean(payload.is_featured),
        payload.status || 'active'
      ]
    );

    await syncWorks(connection, result.insertId, payload.works || []);

    return {
      id: result.insertId
    };
  });
}

async function getArtistDetail(id) {
  const rows = await query(
    `
    SELECT
      a.*,
      u.username,
      u.email AS gmail,
      u.email AS user_email,
      u.phone,
      u.role AS user_role
    FROM artists a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE a.id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows.length) {
    throw createHttpError('Không tìm thấy nghệ sĩ.', 404);
  }

  const works = await query(
    `
    SELECT id, title, release_year
    FROM artist_works
    WHERE artist_id = ?
    ORDER BY id ASC
    `,
    [id]
  );

  return {
    ...rows[0],
    works
  };
}

async function updateArtist(id, payload) {
  const currentArtist = await getArtistDetail(id);

  return transaction(async (connection) => {
    const finalUserId = hasOwn(payload, 'user_id')
      ? payload.user_id
      : currentArtist.user_id;

    await ensureArtistUserCanLink(connection, finalUserId, id);

    if (hasOwn(payload, 'stage_name') && !String(payload.stage_name || '').trim()) {
      throw createHttpError('Vui lòng nhập nghệ danh.', 400);
    }

    const fields = [];
    const params = [];

    const updateData = {
      user_id: Number(finalUserId)
    };

    const allowedFields = [
      'stage_name',
      'full_name',
      'first_name',
      'last_name',
      'image',
      'birth_date',
      'height',
      'weight',
      'partner_name',
      'partner_artist_id',
      'mascot',
      'artist_role',
      'description',
      'is_featured',
      'status'
    ];

    for (const key of allowedFields) {
      if (hasOwn(payload, key)) {
        updateData[key] = payload[key];
      }
    }

    for (const [key, value] of Object.entries(updateData)) {
      fields.push(`${key} = ?`);

      if (key === 'user_id') {
        params.push(Number(value));
      } else if (key === 'is_featured') {
        params.push(normalizeBoolean(value));
      } else if (key === 'stage_name') {
        params.push(String(value).trim());
      } else if (key === 'birth_date' || key === 'partner_artist_id') {
        params.push(value || null);
      } else {
        params.push(emptyToNull(value));
      }
    }

    fields.push('updated_at = NOW()');

    params.push(id);

    await connection.execute(
      `
      UPDATE artists
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
      params
    );

    if (hasOwn(payload, 'works')) {
      await syncWorks(connection, id, payload.works || []);
    }

    return getArtistDetailByConnection(connection, id);
  });
}

async function deleteArtist(id) {
  const result = await execute(
    'DELETE FROM artists WHERE id = ?',
    [id]
  );

  if (!result.affectedRows) {
    throw createHttpError('Không tìm thấy nghệ sĩ.', 404);
  }

  return {
    id: Number(id),
    deleted: true
  };
}

async function getSchedules(artistId) {
  return query(
    `
    SELECT *
    FROM artist_schedules
    WHERE artist_id = ?
    ORDER BY event_date ASC, start_time ASC
    `,
    [artistId]
  );
}

async function createSchedule(adminUserId, artistId, payload) {
  const artists = await query(
    'SELECT id FROM artists WHERE id = ?',
    [artistId]
  );

  if (!artists.length) {
    throw createHttpError('Không tìm thấy nghệ sĩ.', 404);
  }

  const result = await execute(
    `
    INSERT INTO artist_schedules (
      artist_id,
      title,
      event_date,
      start_time,
      end_time,
      status,
      note,
      created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      artistId,
      payload.title,
      payload.event_date,
      payload.start_time || null,
      payload.end_time || null,
      payload.status || 'upcoming',
      payload.note || null,
      adminUserId
    ]
  );

  return {
    id: result.insertId
  };
}

async function getProfileRequests(params = {}) {
  const status = params.status || null;

  return query(
    `
    SELECT
      r.*,
      a.stage_name,
      u.username AS requested_username,
      u.email AS requested_email
    FROM artist_profile_update_requests r
    JOIN artists a ON a.id = r.artist_id
    JOIN users u ON u.id = r.requested_by
    WHERE ? IS NULL OR r.status = ?
    ORDER BY r.created_at DESC
    `,
    [status, status]
  );
}

async function approveProfileRequest(adminUserId, requestId) {
  return transaction(async (connection) => {
    const [requests] = await connection.execute(
      `
      SELECT *
      FROM artist_profile_update_requests
      WHERE id = ?
      FOR UPDATE
      `,
      [requestId]
    );

    if (!requests.length) {
      throw createHttpError('Không tìm thấy yêu cầu.', 404);
    }

    const request = requests[0];

    if (request.status !== 'pending') {
      throw createHttpError('Yêu cầu này đã được xử lý.', 422);
    }

    const newData =
      typeof request.new_data === 'string'
        ? JSON.parse(request.new_data)
        : request.new_data;

    const fields = [];
    const params = [];

    const allowedFields = [
      'stage_name',
      'full_name',
      'first_name',
      'last_name',
      'image',
      'birth_date',
      'height',
      'weight',
      'partner_name',
      'partner_artist_id',
      'mascot',
      'artist_role',
      'description',
      'is_featured',
      'status'
    ];

    for (const key of allowedFields) {
      if (hasOwn(newData, key)) {
        fields.push(`${key} = ?`);

        if (key === 'is_featured') {
          params.push(normalizeBoolean(newData[key]));
        } else if (key === 'stage_name') {
          params.push(String(newData[key] || '').trim());
        } else if (key === 'birth_date' || key === 'partner_artist_id') {
          params.push(newData[key] || null);
        } else {
          params.push(emptyToNull(newData[key]));
        }
      }
    }

    if (fields.length) {
      fields.push('updated_at = NOW()');
      params.push(request.artist_id);

      await connection.execute(
        `
        UPDATE artists
        SET ${fields.join(', ')}
        WHERE id = ?
        `,
        params
      );
    }

    if (Array.isArray(newData.works)) {
      await syncWorks(connection, request.artist_id, newData.works);
    }

    await connection.execute(
      `
      UPDATE artist_profile_update_requests
      SET status = 'approved',
          reviewed_by = ?,
          reviewed_at = NOW()
      WHERE id = ?
      `,
      [adminUserId, requestId]
    );

    await connection.execute(
      `
      INSERT INTO notifications (
        receiver_user_id,
        sender_user_id,
        type,
        title,
        message,
        reference_id
      )
      VALUES (?, ?, 'artist_profile_update', ?, ?, ?)
      `,
      [
        request.requested_by,
        adminUserId,
        'Hồ sơ nghệ sĩ đã được duyệt',
        'Admin đã duyệt yêu cầu cập nhật hồ sơ của bạn.',
        requestId
      ]
    );

    return {
      id: requestId,
      status: 'approved'
    };
  });
}

async function rejectProfileRequest(adminUserId, requestId, adminNote = null) {
  const result = await execute(
    `
    UPDATE artist_profile_update_requests
    SET status = 'rejected',
        reviewed_by = ?,
        reviewed_at = NOW(),
        admin_note = ?
    WHERE id = ?
      AND status = 'pending'
    `,
    [adminUserId, adminNote || null, requestId]
  );

  if (!result.affectedRows) {
    throw createHttpError('Không tìm thấy yêu cầu đang chờ duyệt.', 404);
  }

  const requests = await query(
    `
    SELECT requested_by
    FROM artist_profile_update_requests
    WHERE id = ?
    `,
    [requestId]
  );

  if (requests.length) {
    await execute(
      `
      INSERT INTO notifications (
        receiver_user_id,
        sender_user_id,
        type,
        title,
        message,
        reference_id
      )
      VALUES (?, ?, 'artist_profile_update', ?, ?, ?)
      `,
      [
        requests[0].requested_by,
        adminUserId,
        'Hồ sơ nghệ sĩ bị từ chối',
        adminNote || 'Admin đã từ chối yêu cầu cập nhật hồ sơ của bạn.',
        requestId
      ]
    );
  }

  return {
    id: requestId,
    status: 'rejected'
  };
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