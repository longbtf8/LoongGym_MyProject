require("module-alias/register");
require("dotenv/config");
const QueueService = require("@/services/queue.service");

(async () => {
  await QueueService.push("test", { data: "1243" });
})();
