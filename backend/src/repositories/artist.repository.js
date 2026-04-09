const pool = require('../configs/db');

async function getAllArtists() {
  const [rows] = await pool.query(`
    SELECT
      a.id,
      a.name,
      a.bio,
      a.works,
      a.image,
      a.followers,
      a.rating,
      a.isVerified,
      a.userId,
      a.createdAt,
      a.updatedAt,
      asl.facebook,
      asl.instagram,
      asl.twitter
    FROM Artists a
    LEFT JOIN ArtistSocialLinks asl ON a.id = asl.artistId
    ORDER BY a.createdAt DESC
  `);
  return rows;
}

async function getArtistById(id) {
  const [rows] = await pool.query(`
    SELECT
      a.*,
      asl.facebook,
      asl.instagram,
      asl.twitter
    FROM Artists a
    LEFT JOIN ArtistSocialLinks asl ON a.id = asl.artistId
    WHERE a.id = ?
    LIMIT 1
  `, [id]);

  return rows[0] || null;
}

async function getArtistByUserId(userId) {
  const [rows] = await pool.query(`
    SELECT * FROM Artists WHERE userId = ? LIMIT 1
  `, [userId]);

  return rows[0] || null;
}

async function createArtist({ name, bio, works, image, userId }) {
  const [result] = await pool.query(`
    INSERT INTO Artists (name, bio, works, image, followers, rating, isVerified, userId)
    VALUES (?, ?, ?, ?, 0, 0, 0, ?)
  `, [name, bio || null, works || null, image || null, userId]);

  return result.insertId;
}

module.exports = {
  getAllArtists,
  getArtistById,
  getArtistByUserId,
  createArtist
};