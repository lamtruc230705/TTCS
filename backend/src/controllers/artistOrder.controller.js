const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getMyOrders = async (req, res) => {
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
        SELECT DISTINCT
          o.order_id,
          o.order_code,
          o.user_id,
          o.total_amount,
          o.status,
          o.payment_status,
          o.created_at
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE oi.artist_id = @artist_id
        ORDER BY o.created_at DESC
      `);

    return successResponse(res, "Lấy danh sách đơn hàng của nghệ sĩ thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return errorResponse(res, "order_id không hợp lệ", 400);
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

    const orderResult = await pool.request()
      .input("order_id", sql.Int, orderId)
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT DISTINCT
          o.order_id,
          o.order_code,
          o.user_id,
          o.total_amount,
          o.status,
          o.payment_status,
          o.shipping_address,
          o.payment_method,
          o.note,
          o.created_at
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.order_id = @order_id
          AND oi.artist_id = @artist_id
      `);

    if (orderResult.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy đơn hàng", 404);
    }

    const itemsResult = await pool.request()
      .input("order_id", sql.Int, orderId)
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT
          oi.order_item_id,
          oi.product_id,
          p.name AS product_name,
          oi.quantity,
          oi.unit_price,
          oi.line_total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = @order_id
          AND oi.artist_id = @artist_id
      `);

    return successResponse(res, "Lấy chi tiết đơn hàng thành công", {
      order: orderResult.recordset[0],
      items: itemsResult.recordset,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId)) {
      return errorResponse(res, "order_id không hợp lệ", 400);
    }

    if (!status) {
      return errorResponse(res, "Thiếu trạng thái đơn hàng", 400);
    }

    const allowedStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return errorResponse(res, "Trạng thái không hợp lệ", 400);
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

    const checkOrder = await pool.request()
      .input("order_id", sql.Int, orderId)
      .input("artist_id", sql.Int, artistId)
      .query(`
        SELECT TOP 1 o.order_id
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.order_id = @order_id
          AND oi.artist_id = @artist_id
      `);

    if (checkOrder.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy đơn hàng", 404);
    }

    await pool.request()
      .input("order_id", sql.Int, orderId)
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE orders
        SET status = @status,
            updated_at = GETDATE()
        WHERE order_id = @order_id
      `);

    return successResponse(res, "Cập nhật trạng thái đơn hàng thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};