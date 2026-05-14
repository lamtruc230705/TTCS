const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-artist.service');

const getArtists = asyncHandler(async (req, res) => success(res, 'Lay danh sach nghe si thanh cong.', await service.getArtists(req.query)));
const createArtist = asyncHandler(async (req, res) => success(res, 'Them nghe si thanh cong.', await service.createArtist(req.body), 201));
const getArtistDetail = asyncHandler(async (req, res) => success(res, 'Lay chi tiet nghe si thanh cong.', await service.getArtistDetail(req.params.id)));
const updateArtist = asyncHandler(async (req, res) => success(res, 'Cap nhat nghe si thanh cong.', await service.updateArtist(req.params.id, req.body)));
const deleteArtist = asyncHandler(async (req, res) => { await service.deleteArtist(req.params.id); return success(res, 'Xoa nghe si thanh cong.'); });
const getSchedules = asyncHandler(async (req, res) => success(res, 'Lay lich trinh nghe si thanh cong.', await service.getSchedules(req.params.artistId)));
const createSchedule = asyncHandler(async (req, res) => success(res, 'Them lich trinh thanh cong.', await service.createSchedule(req.user.id, req.params.artistId, req.body), 201));
const getProfileRequests = asyncHandler(async (req, res) => success(res, 'Lay yeu cau cap nhat ho so thanh cong.', await service.getProfileRequests(req.query)));
const approveProfileRequest = asyncHandler(async (req, res) => success(res, 'Duyet yeu cau cap nhat thanh cong.', await service.approveProfileRequest(req.user.id, req.params.id)));
const rejectProfileRequest = asyncHandler(async (req, res) => success(res, 'Tu choi yeu cau cap nhat thanh cong.', await service.rejectProfileRequest(req.user.id, req.params.id, req.body.admin_note)));

module.exports = {
  getArtists,
  createArtist,
  getArtistDetail,
  updateArtist,
  deleteArtist,
  getSchedules,
  createSchedule,
  getProfileRequests,
  approveProfileRequest,
  rejectProfileRequest
};
