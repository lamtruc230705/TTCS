const productService = require('../services/product.service');

async function getAllProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    return res.json({
      success: true,
      data: products
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}

async function getProductById(req, res) {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    return res.json({
      success: true,
      data: product
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}

async function createProduct(req, res) {
  try {
    const productId = await productService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: { productId }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct
};