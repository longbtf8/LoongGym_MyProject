const workoutProgramsService = require("@/services/workout-programs.service");
const { httpCodes } = require("@/config/constants");

const getWorkoutPrograms = async (req, res, next) => {
  try {
    const queryParams = req.validated.query;
    const result = await workoutProgramsService.getWorkoutPrograms(queryParams);
    return res.success(result, httpCodes.success, "Lấy danh sách giáo án thành công.");
  } catch (error) {
    next(error);
  }
};

const getWorkoutProgramById = async (req, res, next) => {
  try {
    const { id } = req.validated.params;
    const result = await workoutProgramsService.getWorkoutProgramById(id);
    return res.success(result, httpCodes.success, "Lấy chi tiết giáo án thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkoutPrograms,
  getWorkoutProgramById,
};
