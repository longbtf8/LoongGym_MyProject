const authRequire = require("@/middlewares/authRequire");
const optionalAuth = require("@/middlewares/optionalAuth");
const uploadCloud = require("@/utils/upload");
const express = require("express");
const router = express.Router();
const usersController = require("@/controllers/users.controller");
const validate = require("@/middlewares/validate");
const { updateProfileSchema } = require("@/validations/user.validation");

router.get("/me", authRequire, usersController.getProfile);

router.put(
  "/me",
  authRequire,
  validate(updateProfileSchema),
  usersController.updateProfile
);

router.post(
  "/me/upload-avatar",
  authRequire,
  uploadCloud.single("image-avatar"),
  usersController.uploadAvatar
);

router.post(
  "/me/upload-cover",
  authRequire,
  uploadCloud.single("image-cover"),
  usersController.uploadCover
);

router.patch("/me/avatar-photo", authRequire, usersController.updateAvatarPhoto);
router.patch("/me/cover-photo", authRequire, usersController.updateCoverPhoto);
router.get("/me/workout-history", authRequire, usersController.getMyWorkoutHistory);

router.get("/:id", optionalAuth, usersController.getUserProfileById);
router.get("/:id/workout-history", optionalAuth, usersController.getUserWorkoutHistory);

module.exports = router;
