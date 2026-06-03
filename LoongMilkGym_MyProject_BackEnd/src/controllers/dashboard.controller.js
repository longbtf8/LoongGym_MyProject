const dashboardService = require("@/services/dashboard.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller tiếp nhận yêu cầu lấy thông tin tổng quan Dashboard
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await dashboardService.getDashboardSummary(userId);
    return res.success(result, httpCodes.success, "Lấy thông tin tổng quan Dashboard thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
