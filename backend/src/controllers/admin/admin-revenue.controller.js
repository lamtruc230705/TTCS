const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-revenue.service');

const getRevenue = asyncHandler(async (req, res) => {
  const data = await service.getRevenue(req.query);
  return success(res, 'Lay doanh thu admin thanh cong.', data);
});

module.exports = { getRevenue };
