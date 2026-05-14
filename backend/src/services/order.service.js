const { query, transaction } = require('../config/database');
const generateOrderCode = require('../utils/orderCode');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function checkout(user, payload) {
  const cartItemIds = payload.cart_item_ids || [];
  const shippingFee = Number(payload.shipping_fee ?? 25000);

  return transaction(async (connection) => {
    const params = [user.id];
    let idFilter = 'ci.is_selected = TRUE';

    if (cartItemIds.length) {
      idFilter = `ci.id IN (${cartItemIds.map(() => '?').join(',')})`;
      params.push(...cartItemIds);
    }

    const [items] = await connection.query(`
      SELECT
        ci.id AS cart_item_id,
        ci.quantity,
        p.id AS product_id,
        p.name,
        p.price,
        p.stock,
        p.created_by_user_id,
        p.created_by_role
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.user_id = ? AND ${idFilter} AND p.status = 'active'
      FOR UPDATE
    `, params);

    if (!items.length) {
      throw createHttpError('Vui long chon san pham de thanh toan.', 422);
    }

    for (const item of items) {
      if (Number(item.stock) < Number(item.quantity)) {
        throw createHttpError(`San pham ${item.name} khong du so luong trong kho.`, 422);
      }
    }

    const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    const totalAmount = subtotal + shippingFee;
    const orderCode = generateOrderCode();

    const [orderResult] = await connection.execute(`
      INSERT INTO orders (
        order_code, user_id, customer_name, customer_email, customer_phone,
        subtotal, shipping_fee, total_amount, status, payment_status, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'paid', ?)
    `, [
      orderCode,
      user.id,
      user.full_name || user.username,
      user.email,
      user.phone,
      subtotal,
      shippingFee,
      totalAmount,
      payload.note || null
    ]);

    const orderId = orderResult.insertId;

    for (const item of items) {
      const totalPrice = Number(item.price) * Number(item.quantity);
      await connection.execute(`
        INSERT INTO order_items (
          order_id, product_id, seller_user_id, seller_role,
          product_name, product_price, quantity, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.product_id,
        item.created_by_user_id,
        item.created_by_role,
        item.name,
        item.price,
        item.quantity,
        totalPrice
      ]);

      await connection.execute(`
        UPDATE products
        SET stock = stock - ?, sold_count = sold_count + ?
        WHERE id = ?
      `, [item.quantity, item.quantity, item.product_id]);
    }

    await connection.query(
      `DELETE FROM cart_items WHERE id IN (${items.map(() => '?').join(',')}) AND user_id = ?`,
      [...items.map((item) => item.cart_item_id), user.id]
    );

    return {
      order_id: orderId,
      order_code: orderCode,
      subtotal,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      items
    };
  });
}

async function getMyOrders(userId) {
  return query(`
    SELECT o.*, COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId]);
}

async function getMyOrderDetail(userId, orderId) {
  const orders = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
  if (!orders.length) throw createHttpError('Khong tim thay don hang.', 404);

  const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  return { ...orders[0], items };
}

module.exports = {
  checkout,
  getMyOrders,
  getMyOrderDetail
};
