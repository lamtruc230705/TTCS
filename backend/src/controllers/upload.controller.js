const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const service = require('../services/upload.service');

const uploadImage = asyncHandler(async (req, res) => {
  const data = await service.uploadGeneralImage(req.file, req.user, req.body);
  return success(res, 'Upload anh thanh cong.', data, 201);
});

const uploadProductImage = asyncHandler(async (req, res) => {
  const isMain = req.body.is_main === undefined ? true : req.body.is_main === true || req.body.is_main === 'true' || req.body.is_main === '1';
  const data = await service.uploadProductImage(req.params.productId, req.file, req.user, isMain);
  return success(res, 'Upload anh san pham thanh cong.', data, 201);
});

const uploadArtistImage = asyncHandler(async (req, res) => {
  const data = await service.uploadArtistImage(req.params.artistId, req.file, req.user);
  return success(res, 'Upload anh nghe si thanh cong.', data, 201);
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const data = await service.uploadAvatar(req.file, req.user);
  return success(res, 'Upload anh dai dien thanh cong.', data, 201);
});

const getUploadedFiles = asyncHandler(async (req, res) => {
  const data = await service.getUploadedFiles(req.query);
  return success(res, 'Lay danh sach anh da upload thanh cong.', data);
});

module.exports = {
  uploadImage,
  uploadProductImage,
  uploadArtistImage,
  uploadAvatar,
  getUploadedFiles
};
