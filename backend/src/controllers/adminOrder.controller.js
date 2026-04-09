//admin quản lý toàn bộ đơn hàng

const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getOrders = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT order_id, order_code, user_id, total_amount, status, payment_status, created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    return successResponse(res, "Lấy danh sách đơn hàng thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, payment_status } = req.body;
    const pool = await connectDB();

    await pool.request()
      .input("order_id", sql.Int, req.params.id)
      .input("status", sql.NVarChar, status)
      .input("payment_status", sql.NVarChar, payment_status || null)
      .query(`
        UPDATE orders
        SET status = @status,
            payment_status = ISNULL(@payment_status, payment_status),
            updated_at = GETDATE()
        WHERE order_id = @order_id
      `);

    return successResponse(res, "Cập nhật trạng thái đơn hàng thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};