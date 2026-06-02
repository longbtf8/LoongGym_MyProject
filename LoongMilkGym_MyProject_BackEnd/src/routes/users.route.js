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

module.exports = router;
