//admin quản lý toàn bộ sản phẩm

const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getProducts = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT product_id, name, price, stock, image, status, artist_id, created_at
      FROM products
      ORDER BY created_at DESC
    `);

    return successResponse(res, "Lấy danh sách sản phẩm thành công", result.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getProductDetail = async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input("product_id", sql.Int, req.params.id)
      .query(`
        SELECT *
        FROM products
        WHERE product_id = @product_id
      `);

    if (result.recordset.length === 0) {
      return errorResponse(res, "Không tìm thấy sản phẩm", 404);
    }

    return successResponse(res, "Lấy chi tiết sản phẩm thành công", result.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return errorResponse(res, "Thiếu trạng thái sản phẩm", 400);
    }

    const pool = await connectDB();

    await pool.request()
      .input("product_id", sql.Int, req.params.id)
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE products
        SET status = @status,
            updated_at = GETDATE()
        WHERE product_id = @product_id
      `);

    return successResponse(res, "Cập nhật trạng thái sản phẩm thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};