const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.checkout = async (req, res) => {
  try {
    const pool = await connectDB();

    // Lấy giỏ hàng của user
    const cartResult = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`SELECT * FROM carts WHERE user_id = @user_id`);

    if (cartResult.recordset.length === 0) {
      return errorResponse(res, "Giỏ hàng trống", 400);
    }

    const cart = cartResult.recordset[0];

    // Lấy items trong giỏ
    const items = await pool.request()
      .input("cart_id", sql.Int, cart.cart_id)
      .query(`
        SELECT ci.cart_item_id, ci.quantity, ci.unit_price,
               p.product_id, p.name, p.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = @cart_id
      `);

    if (items.recordset.length === 0) {
      return errorResponse(res, "Giỏ hàng trống", 400);
    }

    // Tính tổng tiền
    const totalAmount = items.recordset.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    // Tạo đơn hàng
    const orderResult = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .input("total_amount", sql.Decimal(18, 2), totalAmount)
      .query(`
        INSERT INTO orders (user_id, total_amount, status, created_at, updated_at)
        OUTPUT INSERTED.order_id
        VALUES (@user_id, @total_amount, 'pending', GETDATE(), GETDATE())
      `);

    const orderId = orderResult.recordset[0].order_id;

    // Thêm items vào order_items
    for (const item of items.recordset) {
      await pool.request()
        .input("order_id", sql.Int, orderId)
        .input("product_id", sql.Int, item.product_id)
        .input("quantity", sql.Int, item.quantity)
        .input("unit_price", sql.Decimal(18, 2), item.unit_price)
        .query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, created_at, updated_at)
          VALUES (@order_id, @product_id, @quantity, @unit_price, GETDATE(), GETDATE())
        `);

      // Giảm stock
      await pool.request()
        .input("product_id", sql.Int, item.product_id)
        .input("quantity", sql.Int, item.quantity)
        .query(`
          UPDATE products
          SET stock = stock - @quantity
          WHERE product_id = @product_id
        `);
    }

    // Xóa giỏ hàng
    await pool.request()
      .input("cart_id", sql.Int, cart.cart_id)
      .query(`DELETE FROM cart_items WHERE cart_id = @cart_id`);

    return successResponse(res, "Đặt hàng thành công", { order_id: orderId });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const pool = await connectDB();

    const orders = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT o.order_id, o.total_amount, o.status, o.created_at,
               oi.order_item_id, oi.quantity, oi.unit_price,
               p.name as product_name, p.image
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE o.user_id = @user_id
        ORDER BY o.created_at DESC
      `);

    // Nhóm theo order
    const groupedOrders = {};
    orders.recordset.forEach(row => {
      if (!groupedOrders[row.order_id]) {
        groupedOrders[row.order_id] = {
          order_id: row.order_id,
          total_amount: row.total_amount,
          status: row.status,
          created_at: row.created_at,
          items: []
        };
      }
      if (row.order_item_id) {
        groupedOrders[row.order_id].items.push({
          product_name: row.product_name,
          image: row.image,
          quantity: row.quantity,
          unit_price: row.unit_price
        });
      }
    });

    const result = Object.values(groupedOrders);

    return successResponse(res, "Lấy đơn hàng thành công", result);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};