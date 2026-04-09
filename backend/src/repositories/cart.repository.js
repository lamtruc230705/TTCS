const pool = require('../configs/db');

async function getActiveCartByUserId(userId) {
  const [rows] = await pool.query(`
    SELECT * FROM Carts
    WHERE userId = ? AND status = 'active'
    LIMIT 1
  `, [userId]);

  return rows[0] || null;
}

async function createCart(userId) {
  const [result] = await pool.query(`
    INSERT INTO Carts (userId, totalAmount, status)
    VALUES (?, 0, 'active')
  `, [userId]);

  return result.insertId;
}

async function getCartItems(cartId) {
  const [rows] = await pool.query(`
    SELECT
      ci.id,
      ci.cartId,
      ci.productId,
      ci.quantity,
      ci.price,
      p.name,
      p.image,
      p.stock
    FROM CartItems ci
    INNER JOIN Products p ON ci.productId = p.id
    WHERE ci.cartId = ?
    ORDER BY ci.id DESC
  `, [cartId]);

  return rows;
}

async function getCartItem(cartId, productId) {
  const [rows] = await pool.query(`
    SELECT * FROM CartItems
    WHERE cartId = ? AND productId = ?
    LIMIT 1
  `, [cartId, productId]);

  return rows[0] || null;
}

async function insertCartItem(cartId, productId, quantity, price) {
  const [result] = await pool.query(`
    INSERT INTO CartItems (cartId, productId, quantity, price)
    VALUES (?, ?, ?, ?)
  `, [cartId, productId, quantity, price]);

  return result.insertId;
}

async function updateCartItemQuantity(id, quantity, price) {
  await pool.query(`
    UPDATE CartItems
    SET quantity = ?, price = ?
    WHERE id = ?
  `, [quantity, price, id]);
}

module.exports = {
  getActiveCartByUserId,
  createCart,
  getCartItems,
  getCartItem,
  insertCartItem,
  updateCartItemQuantity
};