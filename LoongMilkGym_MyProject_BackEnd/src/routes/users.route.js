const authRequire = require("@/middlewares/authRequire");
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

router.get("/:id", authRequire, usersController.getUserProfileById);

module.exports = router;
