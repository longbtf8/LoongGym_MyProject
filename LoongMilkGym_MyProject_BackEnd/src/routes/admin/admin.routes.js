const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const requireAdmin = require("@/middlewares/requireAdmin");
const adminController = require("@/controllers/admin/admin.controller");

// Áp dụng 2 lớp bảo vệ cho tất cả route admin
router.use(authRequire, requireAdmin);

// API kiểm tra quyền Admin
router.get("/health", adminController.healthCheck);

module.exports = router;
