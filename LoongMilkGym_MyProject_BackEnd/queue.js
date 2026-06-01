require("module-alias/register");
require("dotenv/config");
const { jobStatus } = require("@/config/constants");
const jobs = require("@/jobs");
const queueService = require("@/services/queue.service");
const sleep = require("@/utils/sleep");

console.log("[Queue] Worker đang chạy, chờ xử lý job...");

(async () => {
  while (true) {
    const firstJob = await queueService.getFirstJob();
    if (firstJob) {
      const { id, type, payload: jsonPayLoad } = firstJob;
      const payload = JSON.parse(jsonPayLoad);
      console.log(`[Queue] Đang xử lý job #${id} - ${type}`);
      queueService.updateStatus(id, jobStatus.inprogress);
      const handle = jobs[type];
      if (handle) {
        try {
          await handle(payload);
          await queueService.updateStatus(id, jobStatus.complete);
          console.log(`[Queue] Hoàn thành job #${id} - ${type}`);
        } catch (error) {
          console.error(`[Queue] Lỗi khi xử lý job #${id} - ${type}:`, error);
          await queueService.updateStatus(id, jobStatus.failed);
        }
      } else {
        await queueService.updateStatus(id, jobStatus.failed);
        console.warn(`[Queue] Chưa có logic xử lý cho job type: ${type}`);
      }
    }
    await sleep(1000);
  }
})();
