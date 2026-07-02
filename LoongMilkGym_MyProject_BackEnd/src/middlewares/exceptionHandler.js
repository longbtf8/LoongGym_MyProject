const { JsonWebTokenError } = require("jsonwebtoken");
const { httpCodes } = require("@/config/constants");

const exceptionHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Exception:", err);

  if (err instanceof JsonWebTokenError) {
    return res.error("Không được phép");
  }

  if (err.name === "MulterError") {
    const uploadMessages = {
      LIMIT_FILE_SIZE: "Ảnh tải lên quá lớn. Vui lòng chọn ảnh nhỏ hơn hoặc nén ảnh trước khi đăng.",
      LIMIT_FILE_COUNT: "Bạn đã chọn quá nhiều ảnh. Vui lòng giảm số lượng ảnh và thử lại.",
      LIMIT_UNEXPECTED_FILE: "Trường tải ảnh không hợp lệ. Vui lòng thử lại.",
    };

    return res.error(
      uploadMessages[err.code] || "Không thể tải ảnh lên. Vui lòng kiểm tra lại tệp ảnh.",
      httpCodes.badRequest,
      { code: err.code }
    );
  }

  const statusCode = err.statusCode || err.status || httpCodes.internalServerError;
  let message = err.message || "Lỗi máy chủ nội bộ";
  let error = null;

  if (err.name && err.name.startsWith("PrismaClient")) {
    message = "Đã xảy ra lỗi hệ thống khi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.";
  } else {
    error = process.env.NODE_ENV === "development"
      ? {
          stack: err.stack,
          errors: err.errors || null,
        }
      : err.errors || null;
  }

  return res.error(message, statusCode, error);
};
module.exports = exceptionHandler;
