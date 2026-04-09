const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getMyProfile = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT user_id, username, email, phone, role, status, created_at, updated_at
        FROM users
        WHERE user_id = @user_id
      `);

    if (result.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    return successResponse(res, "Lấy hồ sơ người dùng thành công", result.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { username, phone } = req.body;

    const pool = await connectDB();

    await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .input("username", sql.NVarChar, username || null)
      .input("phone", sql.NVarChar, phone || null)
      .query(`
        UPDATE users
        SET username = ISNULL(@username, username),
            phone = ISNULL(@phone, phone),
            updated_at = GETDATE()
        WHERE user_id = @user_id
      `);

    const updated = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT user_id, username, email, phone, role, status, created_at, updated_at
        FROM users
        WHERE user_id = @user_id
      `);

    return successResponse(res, "Cập nhật hồ sơ người dùng thành công", updated.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};