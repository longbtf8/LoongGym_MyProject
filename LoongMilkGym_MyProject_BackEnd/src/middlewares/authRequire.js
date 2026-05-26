const { prisma } = require("@/lib/prisma");
const { verifyAccessToken } = require("@/utils/jwt");

const authRequire = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }
    const accessToken = authHeader?.slice(6)?.trim();

    const payload = await verifyAccessToken(accessToken);
    const isBlacklistToken = await prisma.revokedTokens.count({
      where: { tokenHash: accessToken, userId: payload.userId },
    });

    if (isBlacklistToken > 0 || payload.exp < Date.now() / 1000) {
      return res.error("Token không hợp lệ hoặc đã hết hạn", 401);
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
    if (!user) {
      return res.error("Token không hợp lệ", 401);
    }

    if (user.status !== "ACTIVE") {
      return res.error("Tài khoản đã bị khóa hoặc không hoạt động", 403);
    }
    req.user = user;
    req.tokenPayload = payload;
    req.accessToken = accessToken;
    next();
  } catch (error) {
    console.log(error);
    return res.error("Token không hợp lệ hoặc đã hết hạn", 401);
  }
};
module.exports = authRequire;
