const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const authService = require('../services/auth.service');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  return success(res, 'Dang ky thanh cong.', data, 201);
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return success(res, 'Dang nhap thanh cong.', data);
});

const me = asyncHandler(async (req, res) => {
  return success(res, 'Lay thong tin tai khoan thanh cong.', req.user);
});

module.exports = {
  register,
  login,
  me
};
