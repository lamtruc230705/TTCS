const { query } = require('../../config/database');
const { getArtistByUserId } = require('./artist-profile.service');

async function getSchedules(userId) {
  const artist = await getArtistByUserId(userId);
  return query(`
    SELECT id, title, event_date, start_time, end_time, status, note
    FROM artist_schedules
    WHERE artist_id = ?
    ORDER BY event_date ASC, start_time ASC
  `, [artist.id]);
}

module.exports = { getSchedules };
