const { rateLimit } = require("express-rate-limit");
const { httpCodes } = require("@/config/constants");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  limit: 100, // Giới hạn mỗi IP 100 request mỗi cửa sổ (15 phút)
  standardHeaders: "draft-8", // draft-6: header `RateLimit-*`; draft-7 & draft-8: header `RateLimit` gộp
  legacyHeaders: false, // Tắt các header `X-RateLimit-*` cũ
  ipv6Subnet: 56, // Đặt 60 hoặc 64 để ít nghiêm ngặt hơn, 52 hoặc 48 để nghiêm ngặt hơn
  // store: ... , // Redis, Memcached, v.v.

  handler: (req, res) => {
    return res.error("Quá nhiều yêu cầu, vui lòng thử lại sau", httpCodes.tooManyRequests);
  },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    return res.error("Quá nhiều lần đăng nhập, vui lòng thử lại sau", httpCodes.tooManyRequests);
  },
});
module.exports = { apiLimiter, authLimiter };
