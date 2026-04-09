const { successResponse, errorResponse } = require("../utils/response");

exports.getSummary = async (req, res) => {
  try {
    // Mock data cho admin dashboard
    return successResponse(res, "Lấy dashboard admin thành công (mock)", {
      total_users: 150,
      total_artists: 25,
      total_products: 200,
      total_orders: 75,
      total_revenue: 50000,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};