const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");

/**
 * Service quản lý các nghiệp vụ của User và Profile.
 */
const uploadAvatar = async (userId, file) => {
  if (!file) {
    const error = new Error("Vui lòng tải lên một file hình ảnh.");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }

  // URL hình ảnh được lưu trữ trên Cloudinary từ middleware multer-storage-cloudinary nằm trong file.path
  const avatarUrl = file.path || file.secure_url;

  if (!avatarUrl) {
    const error = new Error("Tải ảnh lên Cloudinary thất bại.");
    error.statusCode = httpCodes.badRequest;
    throw error;
  }

  // Cập nhật avatar_url trong bảng user_profile thông qua Prisma
  const updatedProfile = await prisma.userProfile.update({
    where: { userId },
    data: { avatarUrl },
  });

  return {
    avatarUrl: updatedProfile.avatarUrl,
    updatedAt: updatedProfile.updatedAt,
  };
};

module.exports = {
  uploadAvatar,
};
