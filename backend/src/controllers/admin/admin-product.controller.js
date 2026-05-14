const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-product.service');

const getProducts = asyncHandler(async (req, res) => success(res, 'Lay danh sach san pham thanh cong.', await service.getProducts(req.query)));
const createProduct = asyncHandler(async (req, res) => success(res, 'Them san pham thanh cong.', await service.createProduct(req.user.id, req.body), 201));
const updateProduct = asyncHandler(async (req, res) => success(res, 'Cap nhat san pham thanh cong.', await service.updateProduct(req.params.id, req.body)));
const deleteProduct = asyncHandler(async (req, res) => { await service.deleteProduct(req.params.id); return success(res, 'Xoa san pham thanh cong.'); });

module.exports = { getProducts, createProduct, updateProduct, deleteProduct };
