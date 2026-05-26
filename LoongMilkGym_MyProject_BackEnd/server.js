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

app.use(express.json());
app.use(responseFormat);
app.use("/api", apiLimiter);
app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(exceptionHandler);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
