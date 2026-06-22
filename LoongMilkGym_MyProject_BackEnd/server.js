// Đăng ký alias module và load biến môi trường
require("module-alias/register");
require("dotenv/config");
const express = require("express");
const app = express();
const port = 3009;
const apiRouter = require("@/routes/index");
const responseFormat = require("@/middlewares/responseFormat");
const exceptionHandler = require("@/middlewares/exceptionHandler");
const notFoundHandler = require("@/middlewares/notFoundHandler");
const { apiLimiter } = require("@/middlewares/rateLimiter");

const cors = require("cors");

// Cấu hình CORS cho phép frontend kết nối
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  process.env.ADMIN_URL || "http://localhost:5174",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token", "x-session-id"],
  })
);

// Middleware phân tích cú pháp dữ liệu JSON và URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseFormat);

// Áp dụng giới hạn tần suất yêu cầu cho các API
app.use("/api", apiLimiter);
app.use("/api", apiRouter);

// Xử lý lỗi không tìm thấy trang và lỗi hệ thống
app.use(notFoundHandler);
app.use(exceptionHandler);

app.listen(port, () => {
  console.log(`Server đang chạy tại port ${port}`);
});

// Reload trigger for new routes: user-training-plans, recovery
