const { query, execute } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function ensureArtistOwnsOrderItem(userId, orderId) {
  const rows = await query(
    "SELECT id FROM order_items WHERE order_id = ? AND seller_user_id = ? AND seller_role = 'artist' LIMIT 1",
    [orderId, userId]
  );
  if (!rows.length) throw createHttpError('Ban khong co quyen voi don hang nay.', 403);
}

async function getOrders(userId) {
  return query(`
    SELECT
      o.id, o.order_code, o.customer_name, o.customer_email, o.customer_phone,
      o.shipping_fee, o.status, o.payment_status, o.created_at,
      SUM(oi.total_price) AS artist_subtotal,
      GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.quantity) SEPARATOR ', ') AS products
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE oi.seller_user_id = ? AND oi.seller_role = 'artist'
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId]);
}

async function getOrderDetail(userId, orderId) {
  await ensureArtistOwnsOrderItem(userId, orderId);
  const orders = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
  const items = await query(
    "SELECT * FROM order_items WHERE order_id = ? AND seller_user_id = ? AND seller_role = 'artist'",
    [orderId, userId]
  );
  return { ...orders[0], items };
}

async function updateOrderStatus(userId, orderId, status) {
  await ensureArtistOwnsOrderItem(userId, orderId);
  await execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return getOrderDetail(userId, orderId);
}

async function deleteOrder(userId, orderId) {
  await ensureArtistOwnsOrderItem(userId, orderId);
  await execute('DELETE FROM orders WHERE id = ?', [orderId]);
}

module.exports = { getOrders, getOrderDetail, updateOrderStatus, deleteOrder };
