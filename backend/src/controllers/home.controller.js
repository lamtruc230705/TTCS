const { successResponse, errorResponse } = require("../utils/response");

exports.summary = async (req, res) => {
  try {
    // Mock data khi DB không available
    return successResponse(res, "Lấy dữ liệu trang chủ thành công (mock data)", {
      featuredArtists: [
        { artist_id: 1, stage_name: "Artist 1", image: "image1.jpg" },
        { artist_id: 2, stage_name: "Artist 2", image: "image2.jpg" }
      ],
      featuredProducts: [
        { product_id: 1, name: "Product 1", price: 100, image: "product1.jpg" },
        { product_id: 2, name: "Product 2", price: 200, image: "product2.jpg" }
      ]
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};