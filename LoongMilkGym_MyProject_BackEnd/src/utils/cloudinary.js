const cloudinary = require("cloudinary").v2;

/**
 * Trích xuất public_id từ URL Cloudinary
 * @param {string} url - URL ảnh Cloudinary
 * @returns {string|null} public_id hoặc null nếu URL không hợp lệ
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    const remaining = parts[1].replace(/^v\d+\//, "");
    const lastDotIndex = remaining.lastIndexOf(".");
    return lastDotIndex === -1 ? remaining : remaining.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Lỗi khi trích xuất public_id từ Cloudinary URL:", error);
    return null;
  }
};

/**
 * Xóa ảnh cũ trên Cloudinary theo URL
 * @param {string} url - URL ảnh Cloudinary cần xóa
 */
const deleteOldImage = async (url) => {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    console.log(`[Cloudinary] Đang xóa ảnh cũ có public_id: ${publicId}`);
    await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Đã xóa thành công ảnh cũ.`);
  } catch (destroyError) {
    console.error(`[Cloudinary] Lỗi khi xóa ảnh cũ (bỏ qua để tiếp tục):`, destroyError.message);
  }
};

module.exports = {
  getPublicIdFromUrl,
  deleteOldImage,
};
