//admin xem doanh thu hệ thống

const { connectDB } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getRevenue = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        ISNULL(SUM(total_amount), 0) AS total_revenue,
        COUNT(*) AS total_orders
      FROM orders
    `);

    return successResponse(res, "Lấy doanh thu hệ thống thành công", result.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};