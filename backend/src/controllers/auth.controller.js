// xử lí register, login, logout
// lấy thông tin tài khoản hiện tại

const bcrypt = require("bcrypt");
const { connectDB, sql } = require("../configs/db");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");

exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    if (!username || !email || !phone || !password || !confirmPassword) {
      return errorResponse(res, "Thiếu dữ liệu đầu vào", 400);
    }

    if (password !== confirmPassword) {
      return errorResponse(res, "Xác nhận mật khẩu không đúng", 400);
    }

    const pool = await connectDB();

    const existingUser = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (existingUser.recordset.length > 0) {
      return errorResponse(res, "Email đã được sử dụng", 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input("username", sql.NVarChar, username)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("password_hash", sql.NVarChar, passwordHash)
      .input("role", sql.NVarChar, "user")
      .query(`
        INSERT INTO users (username, email, phone, password_hash, role, status, created_at, updated_at)
        OUTPUT INSERTED.user_id
        VALUES (@username, @email, @phone, @password_hash, @role, 'active', GETDATE(), GETDATE())
      `);

    const userId = result.recordset[0].user_id;

    await pool.request()
      .input("user_id", sql.Int, userId)
      .query(`
        INSERT INTO carts (user_id, created_at, updated_at)
        VALUES (@user_id, GETDATE(), GETDATE())
      `);

    return successResponse(res, "Đăng ký thành công", null, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = await connectDB();
    const result = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return errorResponse(res, "Email hoặc mật khẩu chưa chính xác", 400);
    }

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, "Email hoặc mật khẩu chưa chính xác", 400);
    }

    const token = generateToken(user);

    return successResponse(res, "Đăng nhập thành công", {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.me = async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request()
      .input("user_id", sql.Int, req.user.user_id)
      .query(`
        SELECT user_id, username, email, phone, role, status
        FROM users
        WHERE user_id = @user_id
      `);

    return successResponse(res, "Lấy thông tin tài khoản thành công", result.recordset[0]);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};