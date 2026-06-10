const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const recoveryController = require("@/controllers/recovery.controller");
const {
  logRecoverySchema,
  logInjurySchema,
  logBodyMetricSchema,
  uploadProgressPhotoSchema,
} = require("@/validations/recovery.validation");

router.get("/today", authRequire, recoveryController.getTodayOverview);
router.post("/log", authRequire, validate(logRecoverySchema), recoveryController.logRecovery);
router.post("/injury", authRequire, validate(logInjurySchema), recoveryController.logInjury);
router.put("/injury/:id", authRequire, recoveryController.updateInjury);
router.post("/metrics", authRequire, validate(logBodyMetricSchema), recoveryController.logBodyMetric);
router.post("/photos", authRequire, validate(uploadProgressPhotoSchema), recoveryController.uploadProgressPhoto);

module.exports = router;
