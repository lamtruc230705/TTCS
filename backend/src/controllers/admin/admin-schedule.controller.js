const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-schedule.service');

const updateSchedule = asyncHandler(async (req, res) => success(res, 'Cap nhat lich trinh thanh cong.', await service.updateSchedule(req.params.scheduleId, req.body)));
const deleteSchedule = asyncHandler(async (req, res) => { await service.deleteSchedule(req.params.scheduleId); return success(res, 'Xoa lich trinh thanh cong.'); });

module.exports = { updateSchedule, deleteSchedule };
