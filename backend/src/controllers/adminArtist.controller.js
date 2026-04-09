const { successResponse, errorResponse } = require("../utils/response");

exports.getArtists = async (req, res) => {
  try {
    // Mock data cho danh sách artists
    const mockArtists = [
      { artist_id: 1, user_id: 1, stage_name: "Artist One", full_name: "Nguyen Van A", image: "artist1.jpg", is_active: 1, created_at: "2024-01-01" },
      { artist_id: 2, user_id: 2, stage_name: "Artist Two", full_name: "Tran Thi B", image: "artist2.jpg", is_active: 1, created_at: "2024-01-02" }
    ];

    return successResponse(res, "Lấy danh sách nghệ sĩ thành công (mock)", mockArtists);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

exports.toggleArtistStatus = async (req, res) => {
  try {
    // Mock toggle status
    return successResponse(res, "Cập nhật trạng thái nghệ sĩ thành công (mock)", {
      artist_id: parseInt(req.params.id),
      new_status: "toggled"
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};