const { query } = require('../../config/database');

async function getRevenue(params = {}) {
  const fromDate = params.from || null;
  const toDate = params.to || null;

  const summary = await query(`
    SELECT
      COALESCE(SUM(CASE WHEN oi.seller_role = 'admin' THEN oi.total_price ELSE 0 END), 0) AS admin_revenue,
      COALESCE(SUM(CASE WHEN oi.seller_role = 'artist' THEN oi.total_price ELSE 0 END), 0) AS artist_revenue,
      COALESCE(SUM(oi.total_price), 0) AS total_order_items_revenue,
      COUNT(DISTINCT o.id) AS total_orders
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.payment_status = 'paid'
      AND o.status <> 'cancelled'
      AND (? IS NULL OR DATE(o.created_at) >= ?)
      AND (? IS NULL OR DATE(o.created_at) <= ?)
  `, [fromDate, fromDate, toDate, toDate]);

  const monthly = await query(`
    SELECT DATE_FORMAT(o.created_at, '%Y-%m') AS month,
      COALESCE(SUM(CASE WHEN oi.seller_role = 'admin' THEN oi.total_price ELSE 0 END), 0) AS admin_revenue,
      COALESCE(SUM(CASE WHEN oi.seller_role = 'artist' THEN oi.total_price ELSE 0 END), 0) AS artist_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.payment_status = 'paid' AND o.status <> 'cancelled'
    GROUP BY DATE_FORMAT(o.created_at, '%Y-%m')
    ORDER BY month DESC
    LIMIT 12
  `);

  return {
    summary: summary[0],
    monthly
  };
}

module.exports = { getRevenue };
