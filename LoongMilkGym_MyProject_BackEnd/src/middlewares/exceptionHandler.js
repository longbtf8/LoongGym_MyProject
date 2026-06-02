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
