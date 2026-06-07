const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const workoutProgramsController = require("@/controllers/workout-programs.controller");
const {
  getWorkoutProgramsSchema,
  getWorkoutProgramByIdSchema,
} = require("@/validations/workout-program.validation");

router.get("/", authRequire, validate(getWorkoutProgramsSchema), workoutProgramsController.getWorkoutPrograms);
router.get("/:id", authRequire, validate(getWorkoutProgramByIdSchema), workoutProgramsController.getWorkoutProgramById);

module.exports = router;
