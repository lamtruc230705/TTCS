const { query, execute, transaction } = require('../../config/database');
const { getArtistByUserId } = require('./artist-profile.service');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getProducts(userId) {
  const products = await query(`
    SELECT * FROM products
    WHERE created_by_user_id = ? AND created_by_role = 'artist'
    ORDER BY created_at DESC
  `, [userId]);

  const statsRows = await query(`
    SELECT
      COUNT(*) AS total_products,
      COALESCE(SUM(sold_count), 0) AS sold_count,
      COALESCE((
        SELECT SUM(oi.total_price)
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.seller_user_id = ? AND oi.seller_role = 'artist' AND o.payment_status = 'paid'
      ), 0) AS revenue
    FROM products
    WHERE created_by_user_id = ? AND created_by_role = 'artist'
  `, [userId, userId]);

  return { stats: statsRows[0], products };
}

async function createProduct(userId, payload) {
  const artist = await getArtistByUserId(userId);
  return transaction(async (connection) => {
    const [result] = await connection.execute(`
      INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, 'artist', ?, ?)
    `, [
      payload.name,
      payload.description || null,
      payload.price,
      payload.stock,
      payload.image || null,
      userId,
      payload.status || 'active',
      payload.is_featured || false
    ]);

    await connection.execute(
      'INSERT IGNORE INTO product_artists (product_id, artist_id) VALUES (?, ?)',
      [result.insertId, artist.id]
    );

    return { id: result.insertId };
  });
}

async function updateProduct(userId, productId, payload) {
  const products = await query(
    "SELECT id FROM products WHERE id = ? AND created_by_user_id = ? AND created_by_role = 'artist'",
    [productId, userId]
  );
  if (!products.length) throw createHttpError('Khong tim thay san pham cua ban.', 404);

  const fields = [];
  const params = [];
  for (const key of ['name', 'description', 'price', 'stock', 'image', 'status', 'is_featured']) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      fields.push(`${key} = ?`);
      params.push(payload[key]);
    }
  }

  if (fields.length) {
    params.push(productId);
    await execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  return query('SELECT * FROM products WHERE id = ?', [productId]).then((rows) => rows[0]);
}

async function deleteProduct(userId, productId) {
  const result = await execute(
    "DELETE FROM products WHERE id = ? AND created_by_user_id = ? AND created_by_role = 'artist'",
    [productId, userId]
  );
  if (!result.affectedRows) throw createHttpError('Khong tim thay san pham cua ban.', 404);
}

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
