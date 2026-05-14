const { query } = require('../config/database');

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getArtists(params = {}) {
  const search = params.search ? `%${params.search}%` : null;
  const sql = `
    SELECT id, stage_name, full_name, image, birth_date, height, weight, partner_name, mascot, artist_role
    FROM artists
    WHERE status = 'active'
      AND (? IS NULL OR stage_name LIKE ? OR full_name LIKE ?)
    ORDER BY created_at DESC
  `;
  return query(sql, [search, search, search]);
}

async function getArtistDetail(id) {
  const artists = await query('SELECT * FROM artists WHERE id = ? AND status = ? LIMIT 1', [id, 'active']);
  if (!artists.length) {
    throw createHttpError('Khong tim thay nghe si.', 404);
  }

  const works = await query('SELECT id, title, release_year FROM artist_works WHERE artist_id = ? ORDER BY release_year DESC, id DESC', [id]);
  return { ...artists[0], works };
}

module.exports = { getArtists, getArtistDetail };
