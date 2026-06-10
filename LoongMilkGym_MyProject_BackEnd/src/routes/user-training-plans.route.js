const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const userTrainingPlansController = require("@/controllers/user-training-plans.controller");
const {
  getDayDetailsSchema,
  updateDayDetailsSchema,
  startProgramPlanSchema,
  startCustomPlanSchema
} = require("@/validations/user-training-plan.validation");

router.get("/active", authRequire, userTrainingPlansController.getActivePlan);
router.post("/from-program", authRequire, validate(startProgramPlanSchema), userTrainingPlansController.startProgramPlan);
router.post("/custom", authRequire, validate(startCustomPlanSchema), userTrainingPlansController.startCustomPlan);
router.post("/active/cancel", authRequire, userTrainingPlansController.cancelActivePlan);
router.get("/stats", authRequire, userTrainingPlansController.getStats);
router.get("/days/:dayId", authRequire, validate(getDayDetailsSchema), userTrainingPlansController.getDayDetails);
router.put("/days/:dayId", authRequire, validate(updateDayDetailsSchema), userTrainingPlansController.updateDayDetails);
router.post("/days/:dayId/complete", authRequire, userTrainingPlansController.completeDay);
router.post("/days/swap-dates", authRequire, userTrainingPlansController.swapDaysDates);

module.exports = router;
