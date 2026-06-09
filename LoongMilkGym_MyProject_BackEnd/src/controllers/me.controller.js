const userTrainingPlansService = require("@/services/user-training-plans.service");
const { httpCodes } = require("@/config/constants");

const startTrainingPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { programId, title, startDate, dayMapping } = req.validated.body;

    let result;
    if (programId) {
      result = await userTrainingPlansService.startProgramPlan(userId, programId, startDate, dayMapping);
    } else {
      result = await userTrainingPlansService.startCustomPlan(userId, { title, startDate });
    }

    return res.success(result, httpCodes.created, "Khởi tạo lộ trình tập luyện thành công.");
  } catch (error) {
    next(error);
  }
};

const getCurrentPlan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userTrainingPlansService.getActivePlan(userId);
    return res.success(result, httpCodes.success, "Lấy lộ trình tập luyện hiện tại thành công.");
  } catch (error) {
    next(error);
  }
};

const getTrainingPlanDays = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.validated.query;
    const result = await userTrainingPlansService.getTrainingPlanDays(userId, { from, to });
    return res.success(result, httpCodes.success, "Lấy danh sách ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

const updateTrainingPlanDayStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.validated.params;
    const { status, skipReason } = req.validated.body;
    const result = await userTrainingPlansService.updateDayDetails(userId, id, { status, skipReason });
    return res.success(result, httpCodes.success, "Cập nhật trạng thái ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startTrainingPlan,
  getCurrentPlan,
  getTrainingPlanDays,
  updateTrainingPlanDayStatus,
};
