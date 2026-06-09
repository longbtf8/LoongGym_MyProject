const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const workoutSessionsController = require("@/controllers/workout-sessions.controller");
const { updateSetSchema } = require("@/validations/workout-session.validation");

router.patch("/:id", authRequire, validate(updateSetSchema), workoutSessionsController.updateSet);

module.exports = router;
