const authService = require('../services/auth.service');

async function register(req, res) {
  try {
    const result = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: result
    });
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(409).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}

async function login(req, res) {
  try {
    const result = await authService.login(req.body);

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: result
    });
  } catch (error) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}

async function getCurrentUser(req, res) {
  try {
    const userId = req.user.user_id;
    const result = await authService.getCurrentUser(userId);

    return res.json({
      success: true,
      message: 'Lấy thông tin user thành công',
      data: result
    });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}

module.exports = {
  register,
  login,
  getCurrentUser
};