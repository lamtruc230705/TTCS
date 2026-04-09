const pool = require('../configs/db');

async function getAllProducts() {
  const [rows] = await pool.query(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.category,
      p.image,
      p.stock,
      p.rating,
      p.artistId,
      p.categoryId,
      a.name AS artistName,
      pc.name AS categoryName,
      p.createdAt,
      p.updatedAt
    FROM Products p
    INNER JOIN Artists a ON p.artistId = a.id
    LEFT JOIN ProductCategories pc ON p.categoryId = pc.id
    ORDER BY p.createdAt DESC
  `);
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query(`
    SELECT
      p.*,
      a.name AS artistName,
      pc.name AS categoryName
    FROM Products p
    INNER JOIN Artists a ON p.artistId = a.id
    LEFT JOIN ProductCategories pc ON p.categoryId = pc.id
    WHERE p.id = ?
    LIMIT 1
  `, [id]);

  return rows[0] || null;
}

async function createProduct(data) {
  const [result] = await pool.query(`
    INSERT INTO Products
    (name, description, price, category, image, stock, rating, artistId, categoryId)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
  `, [
    data.name,
    data.description || null,
    data.price,
    data.category || 'other',
    data.image || null,
    data.stock || 0,
    data.artistId,
    data.categoryId || null
  ]);

  return result.insertId;
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct
};