const cron = require("node-cron");
const { cleanupOldLogs } = require("../services/admin/auditLog.service");

// Chạy vào lúc 03:00 mỗi ngày
cron.schedule("0 3 * * *", async () => {
  console.log("[CRON] Bắt đầu dọn dẹp các lịch sử hoạt động Admin cũ hơn 30 ngày...");
  try {
    const deletedCount = await cleanupOldLogs();
    console.log(`[CRON] Đã xóa thành công ${deletedCount} dòng nhật ký hoạt động cũ.`);
  } catch (err) {
    console.error("[CRON] Gặp lỗi khi dọn dẹp nhật ký hoạt động Admin:", err);
  }
});

console.log("[CRON] Đã đăng ký tác vụ dọn dẹp nhật ký hoạt động Admin lúc 03:00 hàng ngày.");
