const { prisma } = require("@/lib/prisma");
require("module-alias/register");
const bcrypt = require("bcrypt");
const validate = require("@/middlewares/validate");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} = require("@/validations/auth.validation");
const express = require("express");
const router = express.Router();
const authController = require("@/controllers/auth.controllers");
const authRequire = require("@/middlewares/authRequire");

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authRequire, authController.infoMe);
router.post("/logout", authRequire, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/verify-email", authController.verifyEmail);
router.get("/devices", authRequire, authController.getDevices);
router.delete("/devices/:id", authRequire, authController.revokeDevice);
router.post(
  "/change-password",
  authRequire,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerification,
);
module.exports = router;
