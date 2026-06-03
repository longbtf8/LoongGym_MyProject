const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const dashboardController = require("@/controllers/dashboard.controller");

router.get("/summary", authRequire, dashboardController.getDashboardSummary);

module.exports = router;
