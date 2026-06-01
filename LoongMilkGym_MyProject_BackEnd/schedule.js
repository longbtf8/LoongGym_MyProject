require("module-alias/register");
require("dotenv/config");
const { CronJob } = require("cron");
const cleanupExpiredTokens = require("@/schedulers/cleanupExpiredTokens");
const cleanupProcessedJobs = require("@/schedulers/cleanupProcessedJobs");

const runAllCleanups = async () => {
  await cleanupExpiredTokens();
  await cleanupProcessedJobs();
};

new CronJob("0 0 * * * *", runAllCleanups).start();
console.log("[Schedule] Cron job đã khởi động, chạy dọn dẹp mỗi giờ.");
