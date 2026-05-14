const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-notification.service');

const getNotifications = asyncHandler(async (req, res) => success(res, 'Lay thong bao thanh cong.', await service.getNotifications(req.user.id)));
const markAsRead = asyncHandler(async (req, res) => success(res, 'Da danh dau thong bao da doc.', await service.markAsRead(req.user.id, req.params.id)));

module.exports = { getNotifications, markAsRead };
