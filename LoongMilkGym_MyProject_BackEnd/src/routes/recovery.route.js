const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const uploadCloud = require("@/utils/upload");
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

// Handle Cloudinary upload with multer if a file is uploaded
router.post(
  "/photos",
  authRequire,
  uploadCloud.single("photo"),
  (req, res, next) => {
    if (req.file) {
      req.body.photoUrl = req.file.path; // Multer-storage-cloudinary stores URL in path
    }
    next();
  },
  validate(uploadProgressPhotoSchema),
  recoveryController.uploadProgressPhoto
);

router.delete("/photos/:id", authRequire, recoveryController.deleteProgressPhoto);

module.exports = router;
