const userService = require("@/services/user.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller quản lý các hành động của người dùng (User).
 */
const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    const result = await userService.uploadAvatar(userId, file);

    return res.success(result, httpCodes.ok, "Cập nhật ảnh đại diện thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAvatar,
};
