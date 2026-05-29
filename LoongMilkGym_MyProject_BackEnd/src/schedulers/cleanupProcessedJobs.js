const { prisma } = require("@/lib/prisma");
const { jobStatus } = require("@/config/constants");

async function cleanupProcessedJobs() {
  try {
    console.log("Đang tiến hành dọn dẹp các job đã hoàn thành hoặc thất bại cũ...");
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const result = await prisma.queues.deleteMany({
      where: {
        status: {
          in: [jobStatus.complete, jobStatus.failed],
        },
        updatedAt: {
          lt: twoDaysAgo,
        },
      },
    });
    console.log(`Đã dọn dẹp xong ${result.count} job cũ.`);
  } catch (error) {
    console.error("Lỗi khi dọn dẹp các job cũ:", error);
  }
}

module.exports = cleanupProcessedJobs;
