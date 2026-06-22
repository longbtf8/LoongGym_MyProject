const { prisma } = require("@/lib/prisma");
const { verifyAccessToken } = require("@/utils/jwt");

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    const accessToken = authHeader.slice(7).trim();
    if (!accessToken) {
      return next();
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch (err) {
      return next();
    }
    if (!payload || payload.exp < Date.now() / 1000) {
      return next();
    }

    const isBlacklistToken = await prisma.revokedTokens.count({
      where: { tokenHash: accessToken, userId: payload.userId },
    });

    if (isBlacklistToken > 0) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        profile: true,
        settings: true,
      },
    });

    if (user && user.status === "ACTIVE") {
      req.user = user;
      req.tokenPayload = payload;
      req.accessToken = accessToken;
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = optionalAuth;
