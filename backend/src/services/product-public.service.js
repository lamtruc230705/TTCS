const { query } = require('../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getProducts(params = {}) {
  const { search, creatorRole } = params;

  const where = [`status = 'active'`];
  const values = [];

  if (search && search.trim()) {
    where.push(`(name LIKE ? OR description LIKE ?)`);
    values.push(`%${search.trim()}%`, `%${search.trim()}%`);
  }

  if (creatorRole && creatorRole !== 'all') {
    where.push(`created_by_role = ?`);
    values.push(creatorRole);
  }

  const products = await query(`
    SELECT
      id,
      name,
      description,
      price,
      stock,
      image,
      created_by_user_id,
      created_by_role,
      status,
      is_featured,
      sold_count,
      created_at,
      updated_at
    FROM products
    WHERE ${where.join(' AND ')}
    ORDER BY id ASC
  `, values);

  return products;
}

async function getProductDetail(id) {
  const products = await query(`
    SELECT
      id,
      name,
      description,
      price,
      stock,
      image,
      created_by_user_id,
      created_by_role,
      status,
      is_featured,
      sold_count,
      created_at,
      updated_at
    FROM products
    WHERE id = ?
      AND status = 'active'
    LIMIT 1
  `, [id]);

  if (!products.length) {
    throw createHttpError('Khong tim thay san pham.', 404);
  }

  return products[0];
}

module.exports = { getProducts, getProductDetail };