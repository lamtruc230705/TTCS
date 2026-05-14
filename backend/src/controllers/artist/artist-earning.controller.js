const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/artist/artist-earning.service');

const getEarnings = asyncHandler(async (req, res) => {
  const data = await service.getEarnings(req.user.id);
  return success(res, 'Lay doanh thu nghe si thanh cong.', data);
});

module.exports = { getEarnings };
