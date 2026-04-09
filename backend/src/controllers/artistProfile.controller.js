const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getProfile = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT *
        FROM artists
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy hồ sơ nghệ sĩ", 404);
    }

    return successResponse(res, "Lấy hồ sơ nghệ sĩ thành công", result.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { stage_name, full_name, biography, partner, mascot, works, image } = req.body;
    const pool = await connectDB();

    const checkArtist = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT artist_id
        FROM artists
        WHERE user_id = @user_id
      `);

    if (checkArtist.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy hồ sơ nghệ sĩ", 404);
    }

    await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .input("stage_name", sql.NVarChar, stage_name || null)
      .input("full_name", sql.NVarChar, full_name || null)
      .input("biography", sql.NVarChar, biography || null)
      .input("partner", sql.NVarChar, partner || null)
      .input("mascot", sql.NVarChar, mascot || null)
      .input("works", sql.NVarChar, works || null)
      .input("image", sql.NVarChar, image || null)
      .query(`
        UPDATE artists
        SET stage_name = ISNULL(@stage_name, stage_name),
            full_name = ISNULL(@full_name, full_name),
            biography = ISNULL(@biography, biography),
            partner = ISNULL(@partner, partner),
            mascot = ISNULL(@mascot, mascot),
            works = ISNULL(@works, works),
            image = ISNULL(@image, image),
            updated_at = GETDATE()
        WHERE user_id = @user_id
      `);

    return successResponse(res, "Cập nhật hồ sơ nghệ sĩ thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getMyProducts = async (req, res) => {
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

    const result = await pool.request()
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT *
        FROM products
        WHERE artist_id = @artist_id
        ORDER BY created_at DESC
      `);

    return successResponse(res, "Lấy danh sách sản phẩm của nghệ sĩ thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};