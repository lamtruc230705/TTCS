const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getRevenueSummary = async (req, res) => {
  try {
    const pool = await connectDB();

    const artistResult = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT artist_id
        FROM artists
        WHERE user_id = @user_id
      `);

    if (artistResult.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy hồ sơ nghệ sĩ", 404);
    }

    const artistId = artistResult.recordset[0].artist_id;

    const revenue = await pool.request()
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT 
          ISNULL(SUM(line_total), 0) AS total_revenue,
          ISNULL(SUM(quantity), 0) AS total_items
        FROM order_items
        WHERE artist_id = @artist_id
      `);

    const orders = await pool.request()
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT DISTINCT o.order_id, o.order_code, o.total_amount, o.created_at
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE oi.artist_id = @artist_id
        ORDER BY o.created_at DESC
      `);

    return successResponse(res, "Lấy doanh thu nghệ sĩ thành công", {
      summary: revenue.recordset[0],
      orders: orders.recordset
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};