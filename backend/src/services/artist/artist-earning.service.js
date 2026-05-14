const { query } = require('../../config/database');
const { getArtistByUserId } = require('./artist-profile.service');

async function getEarnings(userId) {
  const artist = await getArtistByUserId(userId);

  const orderStats = await query(`
    SELECT
      COALESCE(SUM(CASE WHEN o.status = 'delivered' AND o.payment_status = 'paid' THEN oi.total_price ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN MONTH(o.created_at) = MONTH(CURRENT_DATE()) AND YEAR(o.created_at) = YEAR(CURRENT_DATE()) THEN oi.total_price ELSE 0 END), 0) AS month_revenue,
      COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN oi.total_price ELSE 0 END), 0) AS paid_amount,
      COALESCE(SUM(CASE WHEN o.payment_status = 'unpaid' THEN oi.total_price ELSE 0 END), 0) AS pending_amount
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.seller_user_id = ? AND oi.seller_role = 'artist'
  `, [userId]);

  const manualEarnings = await query(`
    SELECT id, earning_date AS date, description, amount, status, 'manual' AS source
    FROM artist_earnings
    WHERE artist_id = ?
    ORDER BY earning_date DESC
  `, [artist.id]);

  const orderEarnings = await query(`
    SELECT o.created_at AS date, CONCAT('Doanh thu don hang ', o.order_code) AS description,
      SUM(oi.total_price) AS amount, o.payment_status AS status, 'order' AS source
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.seller_user_id = ? AND oi.seller_role = 'artist'
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId]);

  return {
    summary: orderStats[0],
    transactions: [...orderEarnings, ...manualEarnings]
  };
}

module.exports = { getEarnings };
