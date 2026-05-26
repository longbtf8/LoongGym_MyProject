require("module-alias/register");
require("dotenv/config");
const { CronJob } = require("cron");
const cleanupExpiredTokens = require("@/schedulers/cleanupExpiredTokens");

new CronJob("0 0 * * * *", cleanupExpiredTokens).start();
