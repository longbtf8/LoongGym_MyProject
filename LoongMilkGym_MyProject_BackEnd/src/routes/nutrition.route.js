const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const nutritionController = require("@/controllers/nutrition.controller");
const {
  getTodayNutritionSchema,
  saveNutritionTargetSchema,
} = require("@/validations/nutrition.validation");

router.get("/today", authRequire, validate(getTodayNutritionSchema), nutritionController.getTodayNutrition);
router.post("/targets", authRequire, validate(saveNutritionTargetSchema), nutritionController.saveNutritionTarget);
router.get("/foods", authRequire, nutritionController.searchFoods);
router.get("/foods/barcode/:barcode", authRequire, nutritionController.getFoodByBarcode);
router.post("/foods", authRequire, nutritionController.createOrGetFoodItem);

module.exports = router;
