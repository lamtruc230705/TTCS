const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const service = require('../services/cart.service');

const getCart = asyncHandler(async (req, res) => {
  const data = await service.getCart(req.user.id);
  return success(res, 'Lay gio hang thanh cong.', data);
});

const addToCart = asyncHandler(async (req, res) => {
  const data = await service.addToCart(req.user.id, req.body);
  return success(res, 'Them san pham vao gio hang thanh cong.', data, 201);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const data = await service.updateCartItem(req.user.id, req.params.id, req.body.quantity);
  return success(res, 'Cap nhat gio hang thanh cong.', data);
});

const deleteCartItem = asyncHandler(async (req, res) => {
  await service.deleteCartItem(req.user.id, req.params.id);
  return success(res, 'Xoa san pham khoi gio hang thanh cong.');
});

const selectCartItem = asyncHandler(async (req, res) => {
  const data = await service.selectCartItem(req.user.id, req.params.id, req.body.is_selected);
  return success(res, 'Cap nhat trang thai chon thanh cong.', data);
});

const selectAll = asyncHandler(async (req, res) => {
  const data = await service.selectAll(req.user.id, req.body.is_selected);
  return success(res, 'Cap nhat chon tat ca thanh cong.', data);
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  selectCartItem,
  selectAll
};
