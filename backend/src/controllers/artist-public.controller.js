const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const service = require('../services/artist-public.service');

const getArtists = asyncHandler(async (req, res) => {
  const data = await service.getArtists(req.query);
  return success(res, 'Lay danh sach nghe si thanh cong.', data);
});

const getArtistDetail = asyncHandler(async (req, res) => {
  const data = await service.getArtistDetail(req.params.id);
  return success(res, 'Lay chi tiet nghe si thanh cong.', data);
});

module.exports = { getArtists, getArtistDetail };
