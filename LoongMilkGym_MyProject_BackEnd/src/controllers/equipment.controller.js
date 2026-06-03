const equipmentService = require("@/services/equipment.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller quản lý các yêu cầu liên quan đến thiết bị tập luyện (Equipment)
 */
const getEquipment = async (req, res, next) => {
  try {
    const result = await equipmentService.getEquipment();
    return res.success(result, httpCodes.success, "Lấy danh sách thiết bị thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEquipment,
};
