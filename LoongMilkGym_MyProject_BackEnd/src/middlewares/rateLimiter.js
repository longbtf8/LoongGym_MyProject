const { ipKeyGenerator, rateLimit } = require("express-rate-limit");
const { httpCodes } = require("@/config/constants");

const isProduction = process.env.NODE_ENV?.trim() === "production";

const getPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const windowMs = getPositiveInt(
  process.env.RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000,
);

const buildKey = (req) => {
  const sessionId = req.headers["x-session-id"];
  if (sessionId) return `session:${sessionId}`;
  return `ip:${ipKeyGenerator(req.ip, 56)}`;
};

const createLimiter = ({ limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: buildKey,
    skip: (req) => req.method === "OPTIONS" || req.path === "/health",
    handler: (req, res) => {
      return res.error(message, httpCodes.tooManyRequests);
    },
  });

const apiLimiter = rateLimit({
  windowMs,
  limit: getPositiveInt(
    process.env.RATE_LIMIT_API_MAX,
    isProduction ? 600 : 3000,
  ),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: buildKey,
  skip: (req) => req.method === "OPTIONS" || req.path === "/health",
  handler: (req, res) => {
    return res.error("Quá nhiều yêu cầu, vui lòng thử lại sau", httpCodes.tooManyRequests);
  },
});

const authLimiter = createLimiter({
  limit: getPositiveInt(
    process.env.RATE_LIMIT_AUTH_MAX,
    isProduction ? 10 : 50,
  ),
  message: "Bạn thao tác xác thực quá nhiều lần, vui lòng thử lại sau",
});

const tokenLimiter = createLimiter({
  limit: getPositiveInt(
    process.env.RATE_LIMIT_TOKEN_MAX,
    isProduction ? 120 : 600,
  ),
  message: "Bạn làm mới phiên đăng nhập quá nhiều lần, vui lòng thử lại sau",
});

module.exports = { apiLimiter, authLimiter, tokenLimiter };
