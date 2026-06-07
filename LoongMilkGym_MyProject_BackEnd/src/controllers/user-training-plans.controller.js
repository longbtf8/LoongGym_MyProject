const userTrainingPlansService = require("@/services/user-training-plans.service");
const { httpCodes } = require("@/config/constants");

const getActivePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userTrainingPlansService.getActivePlan(userId);
    return res.success(result, httpCodes.success, "Lấy lộ trình tập luyện hiện tại thành công.");
  } catch (error) {
    next(error);
  }
};

const startProgramPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { programId, startDate, dayMapping } = req.validated.body;
    const result = await userTrainingPlansService.startProgramPlan(userId, programId, startDate, dayMapping);
    return res.success(result, httpCodes.created, "Đã bắt đầu lộ trình tập luyện.");
  } catch (error) {
    next(error);
  }
};

const startCustomPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userTrainingPlansService.startCustomPlan(userId, req.validated.body);
    return res.success(result, httpCodes.created, "Đã tạo lộ trình tự chọn.");
  } catch (error) {
    next(error);
  }
};

const cancelActivePlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userTrainingPlansService.cancelActivePlan(userId);
    return res.success(result, httpCodes.success, "Đã huỷ lộ trình tập luyện hiện tại.");
  } catch (error) {
    next(error);
  }
};

const getDayDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dayId } = req.validated.params;
    const result = await userTrainingPlansService.getDayDetails(userId, dayId);
    return res.success(result, httpCodes.success, "Lấy chi tiết ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

const updateDayDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dayId } = req.validated.params;
    const updateData = req.validated.body;
    const result = await userTrainingPlansService.updateDayDetails(userId, dayId, updateData);
    return res.success(result, httpCodes.success, "Cập nhật ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

const completeDay = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { dayId } = req.validated.params;
    const { notes } = req.body;
    const result = await userTrainingPlansService.completeDay(userId, dayId, notes);
    return res.success(result, httpCodes.success, "Hoàn tất buổi tập thành công.");
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userTrainingPlansService.getStats(userId);
    return res.success(result, httpCodes.success, "Lấy thống kê lộ trình thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivePlan,
  startProgramPlan,
  startCustomPlan,
  cancelActivePlan,
  getDayDetails,
  updateDayDetails,
  completeDay,
  getStats
};
