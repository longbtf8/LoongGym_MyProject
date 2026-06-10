const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const nutritionController = require("@/controllers/nutrition.controller");
const {
  createMealLogSchema,
  addMealLogItemSchema,
} = require("@/validations/nutrition.validation");

router.post("/", authRequire, validate(createMealLogSchema), nutritionController.createMealLog);
router.post("/:id/items", authRequire, validate(addMealLogItemSchema), nutritionController.addMealLogItem);

module.exports = router;
