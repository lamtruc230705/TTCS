const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const service = require('../services/product-public.service');

const getProducts = asyncHandler(async (req, res) => {
  const data = await service.getProducts(req.query);
  return success(res, 'Lay danh sach san pham thanh cong.', data);
});

const getProductDetail = asyncHandler(async (req, res) => {
  const data = await service.getProductDetail(req.params.id);
  return success(res, 'Lay chi tiet san pham thanh cong.', data);
});

module.exports = { getProducts, getProductDetail };
