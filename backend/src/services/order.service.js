const cartRepository = require('../repositories/cart.repository');
const orderRepository = require('../repositories/order.repository');

function generateOrderNumber() {
  return `ORD-${Date.now()}`;
}

async function checkout(userId, payload) {
  const cart = await cartRepository.getActiveCartByUserId(userId);
  if (!cart) {
    throw new Error('CART_NOT_FOUND');
  }

  const items = await cartRepository.getCartItems(cart.id);
  if (!items.length) {
    throw new Error('CART_EMPTY');
  }

  let subtotal = 0;
  for (const item of items) {
    if (Number(item.stock) < Number(item.quantity)) {
      throw new Error(`INSUFFICIENT_STOCK_${item.productId}`);
    }
    subtotal += Number(item.quantity) * Number(item.price);
  }

  const shippingFee = 30000;
  const discount = 0;
  const totalAmount = subtotal + shippingFee - discount;

  const orderId = await orderRepository.createOrderWithTransaction({
    userId,
    orderNumber: generateOrderNumber(),
    totalAmount,
    shippingFee,
    discount,
    paymentMethod: payload.paymentMethod,
    notes: payload.notes,
    shippingAddress: payload.shippingAddress,
    items: items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }))
  });

  return { orderId };
}

module.exports = {
  checkout
};