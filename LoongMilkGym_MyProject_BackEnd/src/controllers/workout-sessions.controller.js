const workoutSessionsService = require("@/services/workout-sessions.service");
const { httpCodes } = require("@/config/constants");

const startSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await workoutSessionsService.startSession(userId, body);
    return res.success(result, httpCodes.created, "Bắt đầu buổi tập thành công.");
  } catch (error) {
    next(error);
  }
};

const getSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.validated.params;
    const result = await workoutSessionsService.getSession(userId, id);
    return res.success(result, httpCodes.success, "Lấy chi tiết buổi tập thành công.");
  } catch (error) {
    next(error);
  }
};

const addSet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: sessionId, sessionExerciseId } = req.validated.params;
    const body = req.validated.body;
    const result = await workoutSessionsService.addSet(userId, sessionId, sessionExerciseId, body);
    return res.success(result, httpCodes.created, "Thêm set tập mới thành công.");
  } catch (error) {
    next(error);
  }
};

const updateSet = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: setId } = req.validated.params;
    const body = req.validated.body;
    const result = await workoutSessionsService.updateSet(userId, setId, body);
    return res.success(result, httpCodes.success, "Cập nhật set tập thành công.");
  } catch (error) {
    next(error);
  }
};

const completeSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.validated.params;
    const body = req.validated.body;
    const result = await workoutSessionsService.completeSession(userId, id, body);
    return res.success(result, httpCodes.success, "Hoàn thành buổi tập thành công.");
  } catch (error) {
    next(error);
  }
};

const getSessionByPlanDay = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { planDayId } = req.params;
    const result = await workoutSessionsService.getSessionByPlanDay(userId, planDayId);
    return res.success(result, httpCodes.success, "Lấy buổi tập theo ngày kế hoạch thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startSession,
  getSession,
  addSet,
  updateSet,
  completeSession,
  getSessionByPlanDay,
};
