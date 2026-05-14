const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/artist/artist-product.service');

const getProducts = asyncHandler(async (req, res) => {
  const data = await service.getProducts(req.user.id);
  return success(res, 'Lay san pham cua nghe si thanh cong.', data);
});

const createProduct = asyncHandler(async (req, res) => {
  const data = await service.createProduct(req.user.id, req.body);
  return success(res, 'Them san pham thanh cong.', data, 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const data = await service.updateProduct(req.user.id, req.params.id, req.body);
  return success(res, 'Cap nhat san pham thanh cong.', data);
});

const deleteProduct = asyncHandler(async (req, res) => {
  await service.deleteProduct(req.user.id, req.params.id);
  return success(res, 'Xoa san pham thanh cong.');
});

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
