const nutritionService = require("@/services/nutrition.service");
const { httpCodes } = require("@/config/constants");

const getTodayNutrition = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const dateStr = req.query.date; // validated
    const result = await nutritionService.getTodayNutrition(userId, dateStr);
    return res.success(result, httpCodes.success, "Lấy thông tin dinh dưỡng thành công.");
  } catch (error) {
    next(error);
  }
};

const saveNutritionTarget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await nutritionService.saveNutritionTarget(userId, body);
    return res.success(result, httpCodes.success, "Cập nhật mục tiêu dinh dưỡng thành công.");
  } catch (error) {
    next(error);
  }
};

const createMealLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const body = req.validated.body;
    const result = await nutritionService.createMealLog(userId, body);
    return res.success(result, httpCodes.created, "Tạo nhật ký bữa ăn thành công.");
  } catch (error) {
    next(error);
  }
};

const addMealLogItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: mealLogId } = req.validated.params;
    const body = req.validated.body;
    const result = await nutritionService.addMealLogItem(userId, mealLogId, body);
    return res.success(result, httpCodes.created, "Thêm món ăn vào nhật ký thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteMealLogItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id: itemId } = req.validated.params;
    const result = await nutritionService.deleteMealLogItem(userId, itemId);
    return res.success(result, httpCodes.success, "Xóa món ăn khỏi nhật ký thành công.");
  } catch (error) {
    next(error);
  }
};

const searchFoods = async (req, res, next) => {
  try {
    const search = req.query.search;
    const result = await nutritionService.searchFoods(search);
    return res.success(result, httpCodes.success, "Tìm kiếm món ăn thành công.");
  } catch (error) {
    next(error);
  }
};

const getFoodByBarcode = async (req, res, next) => {
  try {
    const barcode = req.params.barcode;
    const result = await nutritionService.getFoodByBarcode(barcode);
    return res.success(result, httpCodes.success, "Tìm món ăn theo mã vạch thành công.");
  } catch (error) {
    next(error);
  }
};

const createOrGetFoodItem = async (req, res, next) => {
  try {
    const result = await nutritionService.createOrGetFoodItem(req.body);
    return res.success(result, httpCodes.created, "Lưu thông tin món ăn thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTodayNutrition,
  saveNutritionTarget,
  createMealLog,
  addMealLogItem,
  deleteMealLogItem,
  searchFoods,
  getFoodByBarcode,
  createOrGetFoodItem,
};
