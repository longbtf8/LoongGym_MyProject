require("module-alias/register");
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
const authController = require("@/controllers/auth.controller");
const authRequire = require("@/middlewares/authRequire");
const { authLimiter, tokenLimiter } = require("@/middlewares/rateLimiter");

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.get("/me", authRequire, authController.infoMe);
router.post("/logout", authRequire, authController.logout);
router.post("/refresh-token", tokenLimiter, authController.refreshToken);
router.post("/verify-email", authLimiter, authController.verifyEmail);
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
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/resend-verification",
  authLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification,
);
module.exports = router;
