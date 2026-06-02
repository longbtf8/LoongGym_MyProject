const usersService = require("@/services/users.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller quản lý các hành động và thông tin hồ sơ của người dùng (dạng số nhiều).
 */

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await usersService.getProfile(userId);
    return res.success(result, httpCodes.success, "Lấy thông tin hồ sơ thành công.");
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.validated.body;

    const result = await usersService.updateProfile(userId, updateData);
    return res.success(result, httpCodes.success, "Cập nhật hồ sơ tài khoản thành công.");
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    const result = await usersService.uploadAvatar(userId, file);
    return res.success(result, httpCodes.ok, "Cập nhật ảnh đại diện thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
};
