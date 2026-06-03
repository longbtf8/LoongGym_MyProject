/**
 * Lớp lỗi tùy chỉnh mang theo HTTP status code.
 * Giúp giảm 3 dòng throw Error truyền thống xuống còn 1 dòng duy nhất.
 *
 * Sử dụng: throw new AppError("Thông báo lỗi", httpCodes.notFound);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

module.exports = AppError;
