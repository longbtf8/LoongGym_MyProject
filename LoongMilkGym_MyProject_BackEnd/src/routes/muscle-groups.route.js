const express = require("express");
const router = express.Router();
const muscleGroupsController = require("@/controllers/muscle-groups.controller");

router.get("/", muscleGroupsController.getMuscleGroups);

module.exports = router;
