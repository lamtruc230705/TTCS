const pool = require('../configs/db');

async function createOrderWithTransaction(payload) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      userId,
      orderNumber,
      totalAmount,
      shippingFee,
      discount,
      paymentMethod,
      notes,
      shippingAddress,
      items
    } = payload;

    const [orderResult] = await connection.query(`
      INSERT INTO Orders
      (orderNumber, userId, totalAmount, shippingFee, discount, paymentMethod, paymentStatus, orderStatus, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', 'pending', ?)
    `, [
      orderNumber,
      userId,
      totalAmount,
      shippingFee,
      discount,
      paymentMethod,
      notes || null
    ]);

    const orderId = orderResult.insertId;

    await connection.query(`
      INSERT INTO ShippingAddresses
      (orderId, fullName, phone, address, city, district)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      shippingAddress.fullName,
      shippingAddress.phone,
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.district
    ]);

    for (const item of items) {
      await connection.query(`
        INSERT INTO OrderItems (orderId, productId, quantity, price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
        item.quantity * item.price
      ]);

      await connection.query(`
        UPDATE Products
        SET stock = stock - ?
        WHERE id = ? AND stock >= ?
      `, [
        item.quantity,
        item.productId,
        item.quantity
      ]);
    }

    await connection.query(`
      INSERT INTO Payments (orderId, amount, method, status)
      VALUES (?, ?, ?, 'pending')
    `, [
      orderId,
      totalAmount,
      paymentMethod
    ]);

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createOrderWithTransaction
};