const exercisesService = require("@/services/exercises.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller quản lý các yêu cầu liên quan đến bài tập (Exercises)
 */
const getExercises = async (req, res, next) => {
  try {
    const queryParams = req.validated.query;
    const result = await exercisesService.getExercises(queryParams);
    return res.success(result, httpCodes.success, "Lấy danh sách bài tập thành công.");
  } catch (error) {
    next(error);
  }
};

const getExerciseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.validated.params;
    const result = await exercisesService.getExerciseBySlug(slug);
    return res.success(result, httpCodes.success, "Lấy chi tiết bài tập thành công.");
  } catch (error) {
    next(error);
  }
};

const toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const exerciseId = req.validated.params.id;
    const result = await exercisesService.toggleFavorite(userId, exerciseId);
    return res.success(result, httpCodes.success, result.message);
  } catch (error) {
    next(error);
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await exercisesService.getFavorites(userId);
    return res.success(result, httpCodes.success, "Lấy danh sách bài tập yêu thích thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseBySlug,
  toggleFavorite,
  getFavorites,
};
