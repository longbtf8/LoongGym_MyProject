const authRequire = require("@/middlewares/authRequire");
const uploadCloud = require("@/utils/upload");
const express = require("express");
const router = express.Router();
const userController = require("@/controllers/user.controllers");

router.post(
  "/me/upload-avatar",
  authRequire,
  uploadCloud.single("image-avatar"),
  userController.uploadAvatar
);

module.exports = router;
