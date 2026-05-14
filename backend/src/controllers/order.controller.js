const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const service = require('../services/order.service');

const checkout = asyncHandler(async (req, res) => {
  const data = await service.checkout(req.user, req.body);
  return success(res, 'Thanh toan thanh cong.', data, 201);
});

const myOrders = asyncHandler(async (req, res) => {
  const data = await service.getMyOrders(req.user.id);
  return success(res, 'Lay danh sach don hang thanh cong.', data);
});

const myOrderDetail = asyncHandler(async (req, res) => {
  const data = await service.getMyOrderDetail(req.user.id, req.params.id);
  return success(res, 'Lay chi tiet don hang thanh cong.', data);
});

module.exports = {
  checkout,
  myOrders,
  myOrderDetail
};
