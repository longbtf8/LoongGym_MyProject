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

    const result = await usersService.uploadAvatar(userId, file, req.body.avatarProfile);
    return res.success(result, httpCodes.ok, "Cập nhật ảnh đại diện thành công.");
  } catch (error) {
    next(error);
  }
};

const uploadCover = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    const result = await usersService.uploadCover(userId, file, req.body.coverPhotoProfile);
    return res.success(result, httpCodes.ok, "Cập nhật ảnh nền thành công.");
  } catch (error) {
    next(error);
  }
};

const updateAvatarPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await usersService.updateAvatarPhoto(userId, req.body);
    return res.success(result, httpCodes.ok, "Cập nhật ảnh đại diện thành công.");
  } catch (error) {
    next(error);
  }
};

const updateCoverPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await usersService.updateCoverPhoto(userId, req.body);
    return res.success(result, httpCodes.ok, "Cập nhật ảnh bìa thành công.");
  } catch (error) {
    next(error);
  }
};

const getUserProfileById = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const { id } = req.params;

    const result = await usersService.getUserProfileById(id, currentUserId);
    return res.success(result, httpCodes.success, "Lấy thông tin hồ sơ người dùng thành công.");
  } catch (error) {
    next(error);
  }
};

const getMyWorkoutHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const result = await usersService.getWorkoutHistory(userId, { page, limit });
    return res.success(result, httpCodes.success, "Lấy lịch sử tập luyện thành công.");
  } catch (error) {
    next(error);
  }
};

const getUserWorkoutHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit } = req.query;
    const result = await usersService.getWorkoutHistory(id, { page, limit });
    return res.success(result, httpCodes.success, "Lấy lịch sử tập luyện thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  updateAvatarPhoto,
  updateCoverPhoto,
  getUserProfileById,
  getMyWorkoutHistory,
  getUserWorkoutHistory,
};
