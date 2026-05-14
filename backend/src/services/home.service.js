const { query } = require('../config/database');

async function getHomeData() {
  const products = await query(`
    SELECT id, name, price, image
    FROM products
    WHERE status = 'active'
    ORDER BY is_featured DESC, created_at DESC
    LIMIT 3
  `);

  const artists = await query(`
    SELECT id, stage_name, full_name, image
    FROM artists
    WHERE status = 'active'
    ORDER BY is_featured DESC, created_at DESC
    LIMIT 3
  `);

  const contacts = await query('SELECT address, phone, email, website FROM site_contacts ORDER BY id DESC LIMIT 1');

  return {
    products,
    artists,
    contact: contacts[0] || null
  };
}

module.exports = { getHomeData };
