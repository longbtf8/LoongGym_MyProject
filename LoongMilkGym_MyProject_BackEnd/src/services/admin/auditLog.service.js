const { prisma } = require("@/lib/prisma");

/**
 * Tạo một log hoạt động mới của Admin
 */
const createAuditLog = async ({
  adminId,
  action,
  targetType,
  targetId = null,
  description = null,
  metadata = null,
}) => {
  return await prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      description,
      metadata: metadata || undefined,
    },
  });
};

/**
 * Xóa các audit logs cũ hơn 30 ngày
 */
const cleanupOldLogs = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await prisma.adminAuditLog.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });

  return result.count;
};

/**
 * Lấy danh sách audit logs mới nhất
 */
const getRecentLogs = async (limit = 5) => {
  return await prisma.adminAuditLog.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
  });
};

module.exports = {
  createAuditLog,
  cleanupOldLogs,
  getRecentLogs,
};
