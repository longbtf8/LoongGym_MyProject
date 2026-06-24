require("module-alias/register");
require("dotenv/config");
const { CronJob } = require("cron");
const cleanupExpiredTokens = require("@/schedulers/cleanupExpiredTokens");
const cleanupProcessedJobs = require("@/schedulers/cleanupProcessedJobs");
const backupDB = require("@/schedulers/backupDB");

const runAllCleanups = async () => {
  await cleanupExpiredTokens();
  await cleanupProcessedJobs();
};

new CronJob("0 0 * * * *", runAllCleanups).start();
console.log("[Schedule] Cron job đã khởi động, chạy dọn dẹp mỗi giờ.");

// Chạy backup cơ sở dữ liệu mỗi 7 ngày (vào lúc 3:00 sáng Chủ nhật hàng tuần)
new CronJob("0 0 3 * * 0", backupDB).start();
console.log("[Schedule] Cron job backup CSDL định kỳ 7 ngày đã khởi động (Chủ nhật lúc 3:00 AM).");
