const pusher = require("@/lib/pusher");

const emitAdminEvent = async (channel, event, data) => {
  try {
    await pusher.trigger(channel, event, data);
  } catch (err) {
    console.error(`Lỗi gửi Pusher [${channel}] ${event}:`, err);
  }
};

module.exports = { emitAdminEvent };
