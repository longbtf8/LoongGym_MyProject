const authConfig = require("@/config/auth.config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const randomRefreshToken = require("./randomRefreshToken");
const { prisma } = require("@/lib/prisma");
require("module-alias/register");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const signAccessToken = (payload) => {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};
const verifyAccessToken = (token) => {
  return jwt.verify(token, authConfig.jwtSecret);
};
const createRefreshToken = async (user, metadata = {}) => {
  const refreshToken = randomRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);
  const date = new Date();
  date.setDate(date.getDate() + authConfig.refreshTokenExpires);

  // Dọn dẹp phiên đăng nhập cũ trên CÙNG một trình duyệt/thiết bị để tránh bị lặp bản ghi
  if (user.id && metadata.userAgent) {
    try {
      await prisma.refreshTokens.deleteMany({
        where: {
          userId: user.id,
          userAgent: metadata.userAgent,
        },
      });
    } catch (err) {
      console.error("Lỗi khi dọn dẹp phiên RefreshToken cũ:", err);
    }
  }

  await prisma.refreshTokens.create({
    data: {
      user: user.id ? { connect: { id: user.id } } : undefined,
      token: refreshTokenHash,
      expiresAt: date,
      userAgent: metadata.userAgent || null,
      deviceName: metadata.deviceName || null,
      ipAddress: metadata.ipAddress || null,
    },
  });
  return refreshToken;
};
const generateAuthTokens = async (user, metadata = {}) => {
  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = await createRefreshToken(user, metadata);
  return { accessToken, refreshToken };
};
module.exports = {
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  generateAuthTokens,
};
