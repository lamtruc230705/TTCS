function generateOrderCode() {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `GM${Date.now()}${random}`;
}

module.exports = generateOrderCode;
