const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/artist/artist-order.service');

const getOrders = asyncHandler(async (req, res) => {
  const data = await service.getOrders(req.user.id);
  return success(res, 'Lay don hang cua nghe si thanh cong.', data);
});

const getOrderDetail = asyncHandler(async (req, res) => {
  const data = await service.getOrderDetail(req.user.id, req.params.id);
  return success(res, 'Lay chi tiet don hang thanh cong.', data);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const data = await service.updateOrderStatus(req.user.id, req.params.id, req.body.status);
  return success(res, 'Cap nhat trang thai don hang thanh cong.', data);
});

const deleteOrder = asyncHandler(async (req, res) => {
  await service.deleteOrder(req.user.id, req.params.id);
  return success(res, 'Xoa don hang thanh cong.');
});

module.exports = { getOrders, getOrderDetail, updateOrderStatus, deleteOrder };
