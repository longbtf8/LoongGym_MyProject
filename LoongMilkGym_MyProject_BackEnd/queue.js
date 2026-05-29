require("module-alias/register");
require("dotenv/config");
const { jobStatus } = require("@/config/constants");
const jobs = require("@/jobs");
const queueService = require("@/services/queue.service");
const sleep = require("@/utils/sleep");

(async () => {
  while (true) {
    const firstJob = await queueService.getFirstJob();
    if (firstJob) {
      const { id, type, payload: jsonPayLoad } = firstJob;
      const payload = JSON.parse(jsonPayLoad);
      queueService.updateStatus(id, jobStatus.inprogress);
      const handle = jobs[type];
      if (handle) {
        try {
          await handle(payload);
          await queueService.updateStatus(id, jobStatus.complete);
        } catch (error) {
          console.error(`Lỗi khi xử lý việc ${type}:`, error);
          await queueService.updateStatus(id, jobStatus.failed);
        }
      } else {
        await queueService.updateStatus(id, jobStatus.failed);
        console.log(`Chưa có logic xử lý việc ${type}`);
      }
    }
    console.log(firstJob);
    await sleep(1000);
  }
})();
