const { connectDB } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.summary = async (req, res) => {
  try {
    const pool = await connectDB();

    const artists = await pool.request().query(`
      SELECT TOP 5 artist_id, stage_name, image
      FROM artists
      WHERE is_active = 1
      ORDER BY created_at DESC
    `);

    const products = await pool.request().query(`
      SELECT TOP 8 product_id, name, price, image
      FROM products
      WHERE status = 'active'
      ORDER BY created_at DESC
    `);

    return successResponse(res, "Lấy dữ liệu trang chủ thành công", {
      featuredArtists: artists.recordset,
      featuredProducts: products.recordset
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};