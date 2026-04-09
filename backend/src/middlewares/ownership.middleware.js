// kiểm tra quyền sở hữu tài nguyên

const { errorResponse } = require("../utils/response");

module.exports = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getOwnerId(req);

      if (!ownerId) {
        return errorResponse(res, "Không tìm thấy tài nguyên", 404);
      }

      if (Number(ownerId) !== Number(req.user.user_id) && req.user.role !== "admin") {
        return errorResponse(res, "Bạn không có quyền thao tác tài nguyên này", 403);
      }

      next();
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  };
};