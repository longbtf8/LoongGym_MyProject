const Pusher = require("pusher");
const pusherConfig = require("@/config/pusher.config");

const pusher = new Pusher({
  appId: pusherConfig.appId,
  key: pusherConfig.key,
  secret: pusherConfig.secret,
  host: pusherConfig.host,
  port: pusherConfig.port,
  useTLS: pusherConfig.useTLS,
});

module.exports = pusher;
