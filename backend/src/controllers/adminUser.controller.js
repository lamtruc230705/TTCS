// admin quản lý người dùng

const { successResponse, errorResponse } = require("../utils/response");

exports.getUsers = async (req, res) => {
  try {
    // Mock data cho danh sách users
    const mockUsers = [
      { user_id: 1, username: "user1", email: "user1@test.com", phone: "123456789", role: "user", status: "active", created_at: "2024-01-01" },
      { user_id: 2, username: "user2", email: "user2@test.com", phone: "987654321", role: "user", status: "active", created_at: "2024-01-02" }
    ];

    return successResponse(res, "Lấy danh sách user thành công (mock)", mockUsers);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    // Mock data cho chi tiết user
    const mockUser = {
      user_id: parseInt(req.params.id),
      username: "user" + req.params.id,
      email: "user" + req.params.id + "@test.com",
      phone: "123456789",
      role: "user",
      status: "active",
      created_at: "2024-01-01"
    };

    return successResponse(res, "Lấy chi tiết user thành công (mock)", mockUser);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};