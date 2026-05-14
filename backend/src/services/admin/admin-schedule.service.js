const { query, execute } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function updateSchedule(scheduleId, payload) {
  const rows = await query('SELECT id FROM artist_schedules WHERE id = ?', [scheduleId]);
  if (!rows.length) throw createHttpError('Khong tim thay lich trinh.', 404);

  await execute(`
    UPDATE artist_schedules
    SET title = ?, event_date = ?, start_time = ?, end_time = ?, status = ?, note = ?
    WHERE id = ?
  `, [payload.title, payload.event_date, payload.start_time || null, payload.end_time || null, payload.status || 'upcoming', payload.note || null, scheduleId]);

  const updated = await query('SELECT * FROM artist_schedules WHERE id = ?', [scheduleId]);
  return updated[0];
}

async function deleteSchedule(scheduleId) {
  const result = await execute('DELETE FROM artist_schedules WHERE id = ?', [scheduleId]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay lich trinh.', 404);
}

module.exports = { updateSchedule, deleteSchedule };
