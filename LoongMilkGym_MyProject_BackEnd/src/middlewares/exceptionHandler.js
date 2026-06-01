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
  const message = err.message || "Lỗi máy chủ nội bộ";
  const error =
    process.env.NODE_ENV === "development"
      ? {
          stack: err.stack,
          errors: err.errors || null,
        }
      : err.errors || null;
  return res.error(message, statusCode, error);
};
module.exports = exceptionHandler;
