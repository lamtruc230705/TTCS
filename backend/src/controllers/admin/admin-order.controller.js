const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-order.service');

const getOrders = asyncHandler(async (req, res) => success(res, 'Lay danh sach don hang thanh cong.', await service.getOrders(req.query)));
const getOrderDetail = asyncHandler(async (req, res) => success(res, 'Lay chi tiet don hang thanh cong.', await service.getOrderDetail(req.params.id)));
const updateOrderStatus = asyncHandler(async (req, res) => success(res, 'Cap nhat trang thai don hang thanh cong.', await service.updateOrderStatus(req.params.id, req.body.status)));
const deleteOrder = asyncHandler(async (req, res) => { await service.deleteOrder(req.params.id); return success(res, 'Xoa don hang thanh cong.'); });

module.exports = { getOrders, getOrderDetail, updateOrderStatus, deleteOrder };
