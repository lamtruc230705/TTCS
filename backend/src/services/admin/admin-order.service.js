const { query, execute } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getOrders(params = {}) {
  const status = params.status || null;
  return query(`
    SELECT
      o.*,
      GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.quantity) SEPARATOR ', ') AS products,
      GROUP_CONCAT(DISTINCT oi.seller_role SEPARATOR ', ') AS seller_roles,
      SUM(CASE WHEN oi.seller_role = 'admin' THEN oi.total_price ELSE 0 END) AS admin_amount,
      SUM(CASE WHEN oi.seller_role = 'artist' THEN oi.total_price ELSE 0 END) AS artist_amount
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE ? IS NULL OR o.status = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [status, status]);
}

async function getOrderDetail(orderId) {
  const orders = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!orders.length) throw createHttpError('Khong tim thay don hang.', 404);
  const items = await query(`
    SELECT oi.*, u.username AS seller_username, u.full_name AS seller_name
    FROM order_items oi
    LEFT JOIN users u ON u.id = oi.seller_user_id
    WHERE oi.order_id = ?
  `, [orderId]);
  return { ...orders[0], items };
}

async function updateOrderStatus(orderId, status) {
  const result = await execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay don hang.', 404);
  return getOrderDetail(orderId);
}

async function deleteOrder(orderId) {
  const result = await execute('DELETE FROM orders WHERE id = ?', [orderId]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay don hang.', 404);
}

module.exports = { getOrders, getOrderDetail, updateOrderStatus, deleteOrder };
