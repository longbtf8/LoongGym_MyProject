const express = require("express");
const router = express.Router();
const exercisesController = require("@/controllers/exercise.controller");
const validate = require("@/middlewares/validate");
const authRequire = require("@/middlewares/authRequire");
const { 
  getExercisesSchema, 
  getExerciseBySlugSchema,
  toggleFavoriteSchema
} = require("@/validations/exercise.validation");

router.get("/", validate(getExercisesSchema), exercisesController.getExercises);
router.get("/favorites", authRequire, exercisesController.getFavorites);
router.get("/:slug", validate(getExerciseBySlugSchema), exercisesController.getExerciseBySlug);
router.post("/:id/favorite", authRequire, validate(toggleFavoriteSchema), exercisesController.toggleFavorite);

module.exports = router;
