const { prisma } = require("@/lib/prisma");
const { verifyAccessToken } = require("@/utils/jwt");
const { httpCodes } = require("@/config/constants");

const authRequire = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(httpCodes.unauthorized).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }
    const accessToken = authHeader.slice(7).trim();

    const payload = await verifyAccessToken(accessToken);
    const isBlacklistToken = await prisma.revokedTokens.count({
      where: { tokenHash: accessToken, userId: payload.userId },
    });

    if (isBlacklistToken > 0 || payload.exp < Date.now() / 1000) {
      return res.error("Token không hợp lệ hoặc đã hết hạn", httpCodes.unauthorized);
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isSuperAdmin: true,
        suspendedUntil: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        profile: true,
        settings: true,
      },
    });
    if (!user) {
      return res.error("Token không hợp lệ", httpCodes.unauthorized);
    }

    if (user.status !== "ACTIVE") {
      if (user.status === "SUSPENDED" && user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
        // Hết thời hạn khóa -> tự động kích hoạt lại
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: "ACTIVE",
            suspendedUntil: null,
          },
        });
        user.status = "ACTIVE";
        user.suspendedUntil = null;
      } else {
        return res.error("Tài khoản đã bị khóa hoặc không hoạt động", httpCodes.forbidden);
      }
    }
    req.user = user;
    req.tokenPayload = payload;
    req.accessToken = accessToken;
    next();
  } catch (error) {
    if (error.name !== "TokenExpiredError" && error.name !== "JsonWebTokenError") {
      console.error("Lỗi xác thực Token không mong muốn:", error);
    }
    return res.error("Token không hợp lệ hoặc đã hết hạn", httpCodes.unauthorized);
  }
};
module.exports = authRequire;
