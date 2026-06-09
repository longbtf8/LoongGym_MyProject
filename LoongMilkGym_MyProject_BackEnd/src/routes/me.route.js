const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const meController = require("@/controllers/me.controller");
const {
  startTrainingPlanSchema,
  getTrainingPlanDaysSchema,
  updateTrainingPlanDayStatusSchema,
} = require("@/validations/me.validation");

router.post("/training-plans", authRequire, validate(startTrainingPlanSchema), meController.startTrainingPlan);
router.get("/training-plans/current", authRequire, meController.getCurrentPlan);
router.get("/training-plan-days", authRequire, validate(getTrainingPlanDaysSchema), meController.getTrainingPlanDays);
router.patch("/training-plan-days/:id/status", authRequire, validate(updateTrainingPlanDayStatusSchema), meController.updateTrainingPlanDayStatus);

module.exports = router;
