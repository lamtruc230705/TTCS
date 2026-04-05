const { connectDB, sql } = require("../configs/db");
const { successResponse, errorResponse } = require("../utils/response");

exports.getCart = async (req, res) => {
  try {
    const pool = await connectDB();

    const cartResult = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`SELECT * FROM carts WHERE user_id = @user_id`);

    if (cartResult.recordset.length === 0) {
      return successResponse(res, "Giỏ hàng trống", []);
    }

    const cart = cartResult.recordset[0];

    const items = await pool.request()
      .input("cart_id", sql.Int, cart.cart_id)
      .query(`
        SELECT ci.cart_item_id, ci.quantity, ci.unit_price,
               p.product_id, p.name, p.image, p.stock
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_id = @cart_id
      `);

    return successResponse(res, "Lấy giỏ hàng thành công", items.recordset);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const pool = await connectDB();

    const cartResult = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`SELECT * FROM carts WHERE user_id = @user_id`);

    const cart = cartResult.recordset[0];

    const productResult = await pool.request()
      .input("product_id", sql.Int, product_id)
      .query(`SELECT * FROM products WHERE product_id = @product_id AND status = 'active'`);

    if (productResult.recordset.length === 0) {
      return errorResponse(res, "Sản phẩm không tồn tại", 404);
    }

    const product = productResult.recordset[0];

    const existingItem = await pool.request()
      .input("cart_id", sql.Int, cart.cart_id)
      .input("product_id", sql.Int, product_id)
      .query(`
        SELECT * FROM cart_items
        WHERE cart_id = @cart_id AND product_id = @product_id
      `);

    if (existingItem.recordset.length > 0) {
      await pool.request()
        .input("cart_id", sql.Int, cart.cart_id)
        .input("product_id", sql.Int, product_id)
        .input("quantity", sql.Int, quantity)
        .query(`
          UPDATE cart_items
          SET quantity = quantity + @quantity, updated_at = GETDATE()
          WHERE cart_id = @cart_id AND product_id = @product_id
        `);
    } else {
      await pool.request()
        .input("cart_id", sql.Int, cart.cart_id)
        .input("product_id", sql.Int, product_id)
        .input("quantity", sql.Int, quantity)
        .input("unit_price", sql.Decimal(18, 2), product.price)
        .query(`
          INSERT INTO cart_items (cart_id, product_id, quantity, unit_price, created_at, updated_at)
          VALUES (@cart_id, @product_id, @quantity, @unit_price, GETDATE(), GETDATE())
        `);
    }

    return successResponse(res, "Thêm vào giỏ hàng thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;
    const pool = await connectDB();

    await pool.request()
      .input("itemId", sql.Int, itemId)
      .input("quantity", sql.Int, quantity)
      .query(`
        UPDATE cart_items
        SET quantity = @quantity, updated_at = GETDATE()
        WHERE cart_item_id = @itemId
      `);

    return successResponse(res, "Cập nhật giỏ hàng thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.deleteCartItem = async (req, res) => {
  try {
    const pool = await connectDB();

    await pool.request()
      .input("itemId", sql.Int, req.params.itemId)
      .query(`DELETE FROM cart_items WHERE cart_item_id = @itemId`);

    return successResponse(res, "Xóa sản phẩm khỏi giỏ hàng thành công");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};