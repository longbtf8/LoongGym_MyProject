const { httpCodes } = require("@/config/constants");

const requireAdmin = (req, res, next) => {
  // Kiểm tra người dùng đã đăng nhập chưa
  if (!req.user) {
    return res.error("Bạn chưa đăng nhập", httpCodes.unauthorized);
  }

  // Kiểm tra tài khoản còn hoạt động không
  if (req.user.status !== "ACTIVE") {
    return res.error("Tài khoản hiện không hoạt động", httpCodes.forbidden);
  }

  // Kiểm tra quyền Admin
  if (req.user.role !== "ADMIN") {
    return res.error("Bạn không có quyền truy cập trang quản trị", httpCodes.forbidden);
  }

  next();
};

module.exports = requireAdmin;
