const pusherConfig = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  host: process.env.PUSHER_HOST || "127.0.0.1",
  port: parseInt(process.env.PUSHER_PORT, 10) || 6002,
  useTLS: process.env.PUSHER_USE_TLS === "true" || false,
};
module.exports = pusherConfig;
