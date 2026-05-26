const authConfig = require("@/config/auth.config");
const jwt = require("jsonwebtoken");
const randomRefreshToken = require("./randomRefreshToken");
const { prisma } = require("@/lib/prisma");
require("module-alias/register");

const signAccessToken = (payload) => {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });
};
const verifyAccessToken = (token) => {
  return jwt.verify(token, authConfig.jwtSecret);
};
const createRefreshToken = async (user) => {
  const refreshToken = randomRefreshToken();
  const date = new Date();
  date.setDate(date.getDate() + authConfig.refreshTokenExpires);
  await prisma.refreshTokens.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: date,
    },
  });
  return refreshToken;
};
module.exports = { signAccessToken, verifyAccessToken, createRefreshToken };
