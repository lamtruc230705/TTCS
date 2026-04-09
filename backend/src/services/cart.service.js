const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');

async function addToCart(userId, { productId, quantity }) {
  const product = await productRepository.getProductById(productId);
  if (!product) {
    throw new Error('PRODUCT_NOT_FOUND');
  }

  if (Number(product.stock) < Number(quantity)) {
    throw new Error('INSUFFICIENT_STOCK');
  }

  let cart = await cartRepository.getActiveCartByUserId(userId);

  if (!cart) {
    const cartId = await cartRepository.createCart(userId);
    cart = { id: cartId };
  }

  const existingItem = await cartRepository.getCartItem(cart.id, productId);

  if (existingItem) {
    await cartRepository.updateCartItemQuantity(
      existingItem.id,
      Number(existingItem.quantity) + Number(quantity),
      product.price
    );
  } else {
    await cartRepository.insertCartItem(
      cart.id,
      productId,
      quantity,
      product.price
    );
  }

  return { message: 'Đã thêm vào giỏ hàng' };
}

module.exports = {
  addToCart
};