const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/artist/artist-schedule.service');

const getSchedules = asyncHandler(async (req, res) => {
  const data = await service.getSchedules(req.user.id);
  return success(res, 'Lay lich trinh thanh cong.', data);
});

module.exports = { getSchedules };
