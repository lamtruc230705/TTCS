const { query, execute } = require('../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildSummary(items) {
  const selectedItems = items.filter((item) => Number(item.is_selected) === 1 || item.is_selected === true);
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const subtotal = selectedItems.reduce((sum, item) => sum + Number(item.quantity) * Number(item.price), 0);
  const shipping_fee = selectedItems.length ? 25000 : 0;
  const total_amount = subtotal + shipping_fee;

  return { totalQuantity, selectedQuantity, subtotal, shipping_fee, total_amount };
}

async function getCart(userId) {
  const items = await query(`
    SELECT
      ci.id AS cart_item_id,
      ci.product_id,
      ci.quantity,
      ci.is_selected,
      p.name,
      p.price,
      p.stock,
      p.image,
      p.created_by_role,
      (ci.quantity * p.price) AS item_total
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `, [userId]);

  return {
    items,
    summary: buildSummary(items)
  };
}

async function addToCart(userId, payload) {
  const { product_id, quantity } = payload;
  const products = await query('SELECT id, stock, status FROM products WHERE id = ?', [product_id]);

  if (!products.length || products[0].status !== 'active') {
    throw createHttpError('San pham khong ton tai hoac da bi an.', 404);
  }

  if (products[0].stock < quantity) {
    throw createHttpError('So luong san pham trong kho khong du.', 422);
  }

  await execute(`
    INSERT INTO cart_items (user_id, product_id, quantity, is_selected)
    VALUES (?, ?, ?, TRUE)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), is_selected = TRUE
  `, [userId, product_id, quantity]);

  return getCart(userId);
}

async function updateCartItem(userId, cartItemId, quantity) {
  const rows = await query(`
    SELECT ci.id, p.stock
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.id = ? AND ci.user_id = ?
  `, [cartItemId, userId]);

  if (!rows.length) throw createHttpError('Khong tim thay san pham trong gio hang.', 404);
  if (rows[0].stock < quantity) throw createHttpError('So luong san pham trong kho khong du.', 422);

  await execute('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, cartItemId, userId]);
  return getCart(userId);
}

async function deleteCartItem(userId, cartItemId) {
  const result = await execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [cartItemId, userId]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay san pham trong gio hang.', 404);
}

async function selectCartItem(userId, cartItemId, isSelected) {
  const result = await execute('UPDATE cart_items SET is_selected = ? WHERE id = ? AND user_id = ?', [isSelected, cartItemId, userId]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay san pham trong gio hang.', 404);
  return getCart(userId);
}

async function selectAll(userId, isSelected) {
  await execute('UPDATE cart_items SET is_selected = ? WHERE user_id = ?', [isSelected, userId]);
  return getCart(userId);
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  selectCartItem,
  selectAll
};
