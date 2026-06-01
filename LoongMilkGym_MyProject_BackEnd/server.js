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

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-refresh-token"],
  })
);

app.use(express.json());
app.use(responseFormat);
app.use("/api", apiLimiter);
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(exceptionHandler);
app.listen(port, () => {
  console.log(`Server đang chạy tại port ${port}`);
});
