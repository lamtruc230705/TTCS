const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const homeService = require('../services/home.service');

const getHome = asyncHandler(async (req, res) => {
  const data = await homeService.getHomeData();
  return success(res, 'Lay du lieu trang chu thanh cong.', data);
});

module.exports = { getHome };
