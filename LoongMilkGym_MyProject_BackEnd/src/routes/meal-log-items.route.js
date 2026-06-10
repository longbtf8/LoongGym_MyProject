const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const nutritionController = require("@/controllers/nutrition.controller");
const {
  deleteMealLogItemSchema,
} = require("@/validations/nutrition.validation");

router.delete("/:id", authRequire, validate(deleteMealLogItemSchema), nutritionController.deleteMealLogItem);

module.exports = router;
