const express = require("express");
const router = express.Router();
const equipmentController = require("@/controllers/equipment.controller");

router.get("/", equipmentController.getEquipment);

module.exports = router;
