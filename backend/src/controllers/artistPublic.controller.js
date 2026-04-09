const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getAllArtists = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT artist_id, stage_name, full_name, image
      FROM artists
      WHERE is_active = 1
      ORDER BY created_at DESC
    `);

    return successResponse(res, "Lấy danh sách nghệ sĩ thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getArtistDetail = async (req, res) => {
  try {
    const artistId = parseInt(req.params.id, 10);
    if (isNaN(artistId)) {
      return errorResponse(res, "artist_id không hợp lệ", 400);
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT *
        FROM artists
        WHERE artist_id = @artist_id AND is_active = 1
      `);

    if (result.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy nghệ sĩ", 404);
    }

    return successResponse(res, "Lấy chi tiết nghệ sĩ thành công", result.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getArtistProducts = async (req, res) => {
  try {
    const artistId = parseInt(req.params.id, 10);
    if (isNaN(artistId)) {
      return errorResponse(res, "artist_id không hợp lệ", 400);
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT product_id, name, price, image, stock
        FROM products
        WHERE artist_id = @artist_id AND status = 'active'
        ORDER BY product_id DESC
      `);

    return successResponse(res, "Lấy sản phẩm theo nghệ sĩ thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};