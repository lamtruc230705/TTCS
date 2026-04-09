const pool = require('../configs/db');

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT * FROM Users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT id, username, email, phone, role, profileImage, isActive, createdAt, updatedAt
     FROM Users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ username, email, phone, password, role, profileImage }) {
  const [result] = await pool.query(
    `INSERT INTO Users (username, email, phone, password, role, profileImage, isActive)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [username, email, phone || null, password, role || 'user', profileImage || null]
  );
  return result.insertId;
}

async function getAllUsers() {
  const [rows] = await pool.query(
    `SELECT id, username, email, phone, role, profileImage, isActive, createdAt, updatedAt
     FROM Users
     ORDER BY createdAt DESC`
  );
  return rows;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  getAllUsers
};