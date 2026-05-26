const { prisma } = require("@/lib/prisma");

async function cleanupExpiredTokens() {
  try {
    console.log("Đang tiến hành dọn dẹp các revoked tokens đã hết hạn...");
    await prisma.revokedTokens.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    console.log("Đã clean Token hết hạn");
  } catch (error) {
    console.error("Lỗi khi dọn dẹp expired tokens:", error);
  }
}
module.exports = cleanupExpiredTokens;
