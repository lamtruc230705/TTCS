const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const service = require('../../services/admin/admin-user.service');

const getUsers = asyncHandler(async (req, res) => success(res, 'Lay danh sach nguoi dung thanh cong.', await service.getUsers(req.query)));
const createUser = asyncHandler(async (req, res) => success(res, 'Them nguoi dung thanh cong.', await service.createUser(req.body), 201));
const getUserDetail = asyncHandler(async (req, res) => success(res, 'Lay chi tiet nguoi dung thanh cong.', await service.getUserDetail(req.params.id)));
const updateUser = asyncHandler(async (req, res) => success(res, 'Cap nhat nguoi dung thanh cong.', await service.updateUser(req.params.id, req.body)));
const deleteUser = asyncHandler(async (req, res) => { await service.deleteUser(req.params.id); return success(res, 'Xoa nguoi dung thanh cong.'); });
const changeRole = asyncHandler(async (req, res) => success(res, 'Cap nhat vai tro thanh cong.', await service.changeRole(req.params.id, req.body.role)));

module.exports = { getUsers, createUser, getUserDetail, updateUser, deleteUser, changeRole };
