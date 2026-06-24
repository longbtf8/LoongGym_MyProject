const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const requireAdmin = require("@/middlewares/requireAdmin");
const adminController = require("@/controllers/admin/admin.controller");
const usersController = require("@/controllers/admin/users.controller");
const reportsController = require("@/controllers/admin/reports.controller");
const postsController = require("@/controllers/admin/posts.controller");
const productsController = require("@/controllers/admin/products.controller");
const uploadCloud = require("@/utils/upload");

// Áp dụng 2 lớp bảo vệ cho tất cả route admin
router.use(authRequire, requireAdmin);

// API kiểm tra quyền Admin
router.get("/health", adminController.healthCheck);

// API lấy dữ liệu Dashboard tổng quan
router.get("/dashboard", adminController.getDashboard);

// API quản lý người dùng
router.get("/users", usersController.getUsers);
router.get("/users/:id", usersController.getUserDetail);
router.patch("/users/:id/status", usersController.updateUserStatus);
router.patch("/users/:id/role", usersController.updateUserRole);

// API quản lý báo cáo
router.get("/reports", reportsController.getReports);
router.get("/reports/:id", reportsController.getReportDetail);
router.patch("/reports/:id/resolve", reportsController.resolveReport);

// API quản lý bài viết
router.get("/posts", postsController.getPosts);
router.get("/posts/:id", postsController.getPostDetail);
router.patch("/posts/:id/moderation", postsController.moderatePost);

// API quản lý sản phẩm
router.get("/products", productsController.getProducts);
router.get("/products/brands", productsController.getProductBrands);
router.get("/products/:id", productsController.getProductDetail);
router.post("/products", uploadCloud.fields([{ name: "thumbnail", maxCount: 1 }, { name: "images", maxCount: 5 }]), productsController.createProduct);
router.patch("/products/:id", uploadCloud.fields([{ name: "thumbnail", maxCount: 1 }, { name: "images", maxCount: 5 }]), productsController.updateProduct);
router.patch("/products/:id/status", productsController.updateProductStatus);
router.delete("/products/:id", productsController.deleteProduct);

// API quản lý giáo án tập luyện (Workout Programs)
const workoutProgramsController = require("@/controllers/admin/workoutPrograms.controller");
const {
  getAdminWorkoutProgramsSchema,
  createWorkoutProgramSchema,
  updateWorkoutProgramSchema,
  saveWorkoutProgramDaySchema,
  saveWorkoutProgramExerciseSchema,
} = require("@/validations/admin-workout-program.validation");
const validate = require("@/middlewares/validate");

router.get("/workout-programs", validate(getAdminWorkoutProgramsSchema), workoutProgramsController.getPrograms);
router.get("/workout-programs/distinct-filters", workoutProgramsController.getDistinctFilters);
router.get("/workout-programs/exercises", workoutProgramsController.getAdminExercisesList);
router.get("/workout-programs/:id", workoutProgramsController.getProgramDetail);
router.post("/workout-programs", uploadCloud.fields([{ name: "coverImage", maxCount: 1 }]), validate(createWorkoutProgramSchema), workoutProgramsController.createProgram);
router.patch("/workout-programs/:id", uploadCloud.fields([{ name: "coverImage", maxCount: 1 }]), validate(updateWorkoutProgramSchema), workoutProgramsController.updateProgram);
router.patch("/workout-programs/:id/status", workoutProgramsController.updateProgramStatus);
router.delete("/workout-programs/:id", workoutProgramsController.deleteProgram);

// Quản lý ngày tập của giáo án
router.post("/workout-programs/:id/days", validate(saveWorkoutProgramDaySchema), workoutProgramsController.addDay);
router.patch("/workout-programs/:id/days/:dayId", validate(saveWorkoutProgramDaySchema), workoutProgramsController.updateDay);
router.delete("/workout-programs/:id/days/:dayId", workoutProgramsController.deleteDay);

// Quản lý bài tập của ngày tập
router.post("/workout-programs/:id/days/:dayId/exercises", validate(saveWorkoutProgramExerciseSchema), workoutProgramsController.addTemplateExercise);
router.patch("/workout-programs/:id/days/:dayId/exercises/:templateExerciseId", validate(saveWorkoutProgramExerciseSchema), workoutProgramsController.updateTemplateExercise);
router.delete("/workout-programs/:id/days/:dayId/exercises/:templateExerciseId", workoutProgramsController.deleteTemplateExercise);

// Quản lý Thư viện bài tập (Exercise Library)
const exercisesController = require("@/controllers/admin/exercises.controller");
const {
  getAdminExercisesSchema,
  createExerciseSchema,
  updateExerciseSchema,
} = require("@/validations/admin-exercise.validation");

router.get("/exercises", validate(getAdminExercisesSchema), exercisesController.getExercises);
router.get("/exercises/:id", exercisesController.getExerciseDetail);
router.post("/exercises", uploadCloud.fields([{ name: "thumbnail", maxCount: 1 }]), validate(createExerciseSchema), exercisesController.createExercise);
router.patch("/exercises/:id", uploadCloud.fields([{ name: "thumbnail", maxCount: 1 }]), validate(updateExerciseSchema), exercisesController.updateExercise);
router.delete("/exercises/:id", exercisesController.deleteExercise);

module.exports = router;


