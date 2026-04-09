const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getSchedules = async (req, res) => {
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
        FROM artist_schedules
        WHERE artist_id = @artist_id
        ORDER BY start_time ASC
      `);

    return successResponse(res, "Lấy lịch trình thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { title, description, location, start_time, end_time, status } = req.body;

    if (!title || !start_time || !end_time) {
      return errorResponse(res, "Thiếu title, start_time hoặc end_time", 400);
    }

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

    await pool.request()
      .input("artist_id", sql.Int, artistId)
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description || null)
      .input("location", sql.NVarChar, location || null)
      .input("start_time", sql.DateTime, start_time)
      .input("end_time", sql.DateTime, end_time)
      .input("status", sql.NVarChar, status || "upcoming")
      .query(`
        INSERT INTO artist_schedules (
          artist_id, title, description, location, start_time, end_time, status, visibility, created_at, updated_at
        )
        VALUES (
          @artist_id, @title, @description, @location, @start_time, @end_time, @status, 'private', GETDATE(), GETDATE()
        )
      `);

    return successResponse(res, "Tạo lịch trình thành công", null, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};