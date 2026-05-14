const { query, execute } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getNotifications(userId) {
  return query(`
    SELECT * FROM notifications
    WHERE receiver_user_id = ?
    ORDER BY created_at DESC
  `, [userId]);
}

async function markAsRead(userId, notificationId) {
  const result = await execute(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND receiver_user_id = ?',
    [notificationId, userId]
  );
  if (!result.affectedRows) throw createHttpError('Khong tim thay thong bao.', 404);
  const rows = await query('SELECT * FROM notifications WHERE id = ?', [notificationId]);
  return rows[0];
}

module.exports = { getNotifications, markAsRead };
