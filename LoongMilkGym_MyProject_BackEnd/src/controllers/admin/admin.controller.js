const { httpCodes } = require("@/config/constants");
const dashboardService = require("@/services/admin/dashboard.service");

const healthCheck = (req, res) => {
  return res.success(
    {
      adminId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
    },
    httpCodes.success,
    "Admin API đang hoạt động"
  );
};

const getDashboard = async (req, res, next) => {
  try {
    const result = await dashboardService.getDashboardStats();
    return res.success(result, httpCodes.success, "Lấy thông tin tổng quan Dashboard thành công");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  healthCheck,
  getDashboard,
};
