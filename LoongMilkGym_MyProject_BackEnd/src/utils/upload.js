const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

const maxFileSizeMb = Number(process.env.FILE_UPLOAD_MAX_SIZE_MB || 10);
const maxFiles = Number(process.env.FILE_UPLOAD_MAX_FILES || 10);

// 1. Cấu hình tài khoản Cloudinary của bạn
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Thiết lập CloudinaryStorage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "LoongMilkGym_APP", // Tên thư mục lưu trữ trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"], // Định dạng file cho phép
  },
});

// 3. Khởi tạo middleware upload từ cấu hình storage trên
const uploadCloud = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
    files: maxFiles,
  },
});

module.exports = uploadCloud;
