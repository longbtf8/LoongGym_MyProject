const express = require("express");
const router = express.Router();
const exercisesController = require("@/controllers/exercises.controller");
const validate = require("@/middlewares/validate");
const { getExercisesSchema, getExerciseBySlugSchema } = require("@/validations/exercise.validation");

router.get("/", validate(getExercisesSchema), exercisesController.getExercises);
router.get("/:slug", validate(getExerciseBySlugSchema), exercisesController.getExerciseBySlug);

module.exports = router;
