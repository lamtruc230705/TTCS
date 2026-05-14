const { query, execute, transaction } = require('../../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getProducts(params = {}) {
  const search = params.search ? `%${params.search}%` : null;
  return query(`
    SELECT p.*, u.username AS creator_username, u.full_name AS creator_name
    FROM products p
    LEFT JOIN users u ON u.id = p.created_by_user_id
    WHERE ? IS NULL OR p.name LIKE ?
    ORDER BY p.created_at DESC
  `, [search, search]);
}

async function syncProductArtists(connection, productId, artistIds = []) {
  await connection.execute('DELETE FROM product_artists WHERE product_id = ?', [productId]);
  for (const artistId of artistIds) {
    await connection.execute('INSERT IGNORE INTO product_artists (product_id, artist_id) VALUES (?, ?)', [productId, artistId]);
  }
}

async function createProduct(adminUserId, payload) {
  return transaction(async (connection) => {
    const [result] = await connection.execute(`
      INSERT INTO products (name, description, price, stock, image, created_by_user_id, created_by_role, status, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, 'admin', ?, ?)
    `, [
      payload.name,
      payload.description || null,
      payload.price,
      payload.stock,
      payload.image || null,
      adminUserId,
      payload.status || 'active',
      payload.is_featured || false
    ]);

    await syncProductArtists(connection, result.insertId, payload.artist_ids || []);
    return { id: result.insertId };
  });
}

async function updateProduct(productId, payload) {
  const existed = await query('SELECT id FROM products WHERE id = ?', [productId]);
  if (!existed.length) throw createHttpError('Khong tim thay san pham.', 404);

  return transaction(async (connection) => {
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
      await connection.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'artist_ids')) {
      await syncProductArtists(connection, productId, payload.artist_ids || []);
    }

    const [rows] = await connection.query('SELECT * FROM products WHERE id = ?', [productId]);
    return rows[0];
  });
}

async function deleteProduct(productId) {
  const result = await execute('DELETE FROM products WHERE id = ?', [productId]);
  if (!result.affectedRows) throw createHttpError('Khong tim thay san pham.', 404);
}

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
