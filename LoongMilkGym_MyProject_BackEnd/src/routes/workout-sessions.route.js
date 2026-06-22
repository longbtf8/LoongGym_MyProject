const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const workoutSessionsController = require("@/controllers/workout-sessions.controller");
const {
  startSessionSchema,
  getSessionSchema,
  addSetSchema,
  completeSessionSchema,
} = require("@/validations/workout-session.validation");

router.get("/", authRequire, workoutSessionsController.listSessions);
router.post("/start", authRequire, validate(startSessionSchema), workoutSessionsController.startSession);
router.get("/:id", authRequire, validate(getSessionSchema), workoutSessionsController.getSession);
router.post("/:id/exercises/:sessionExerciseId/sets", authRequire, validate(addSetSchema), workoutSessionsController.addSet);
router.post("/:id/complete", authRequire, validate(completeSessionSchema), workoutSessionsController.completeSession);
router.get("/by-plan-day/:planDayId", authRequire, workoutSessionsController.getSessionByPlanDay);

module.exports = router;
