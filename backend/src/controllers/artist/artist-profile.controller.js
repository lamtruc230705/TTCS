const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/artist/artist-profile.service');

const getProfile = asyncHandler(async (req, res) => {
  const data = await service.getProfile(req.user.id);
  return success(res, 'Lay ho so nghe si thanh cong.', data);
});

const requestUpdate = asyncHandler(async (req, res) => {
  const data = await service.requestUpdate(req.user.id, req.body);
  return success(res, 'Da gui yeu cau cap nhat ho so cho admin duyet.', data, 201);
});

module.exports = { getProfile, requestUpdate };
