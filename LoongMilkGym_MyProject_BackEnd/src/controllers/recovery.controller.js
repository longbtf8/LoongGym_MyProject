const recoveryService = require("@/services/recovery.service");
const { httpCodes } = require("@/config/constants");

const getTodayOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dateStr = req.query.date; // e.g. YYYY-MM-DD
    const result = await recoveryService.getTodayOverview(userId, dateStr);
    return res.success(result, httpCodes.success, "Lấy thông tin phục hồi thành công.");
  } catch (error) {
    next(error);
  }
};

const logRecovery = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await recoveryService.logRecovery(userId, body);
    return res.success(result, httpCodes.success, "Ghi nhận chỉ số phục hồi thành công.");
  } catch (error) {
    next(error);
  }
};

const logInjury = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await recoveryService.logInjury(userId, body);
    return res.success(result, httpCodes.created, "Ghi nhận chấn thương thành công.");
  } catch (error) {
    next(error);
  }
};

const updateInjury = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const injuryId = req.params.id;
    const body = req.body; // Partial updates allowed or customized via service
    const result = await recoveryService.updateInjury(userId, injuryId, body);
    return res.success(result, httpCodes.success, "Cập nhật chấn thương thành công.");
  } catch (error) {
    next(error);
  }
};

const logBodyMetric = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await recoveryService.logBodyMetric(userId, body);
    return res.success(result, httpCodes.created, "Ghi nhận chỉ số cơ thể thành công.");
  } catch (error) {
    next(error);
  }
};

const uploadProgressPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await recoveryService.uploadProgressPhoto(userId, body);
    return res.success(result, httpCodes.created, "Đăng tải ảnh tiến trình thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteProgressPhoto = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const photoId = req.params.id;
    const result = await recoveryService.deleteProgressPhoto(userId, photoId);
    return res.success(result, httpCodes.success, "Xóa ảnh tiến trình thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayOverview,
  logRecovery,
  logInjury,
  updateInjury,
  logBodyMetric,
  uploadProgressPhoto,
  deleteProgressPhoto,
};
