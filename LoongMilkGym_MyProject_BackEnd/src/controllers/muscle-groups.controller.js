const muscleGroupsService = require("@/services/muscle-groups.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller quản lý các yêu cầu liên quan đến nhóm cơ (Muscle Groups)
 */
const getMuscleGroups = async (req, res, next) => {
  try {
    const result = await muscleGroupsService.getMuscleGroups();
    return res.success(result, httpCodes.success, "Lấy danh sách nhóm cơ thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMuscleGroups,
};
