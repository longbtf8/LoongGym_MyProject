const { UAParser } = require("ua-parser-js");

/**
 * Trích xuất metadata từ HTTP request (device name, IP, session ID)
 * Sử dụng chung cho nhiều controller cần ghi lại thông tin thiết bị.
 *
 * @param {Object} req - Express request object
 * @returns {{ sessionId: string|null, deviceName: string, ipAddress: string }}
 */
const getRequestMetadata = (req) => {
  const userAgentStr = req.headers["user-agent"] || "";
  const sessionId = req.headers["x-session-id"] || null;
  // Lấy IP chính xác từ headers (xử lý danh sách IP đi qua proxy) hoặc express client IP
  let ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
  if (ipAddress.includes(",")) {
    ipAddress = ipAddress.split(",")[0].trim();
  }
  
  const parser = new UAParser(userAgentStr);
  const ua = parser.getResult();
  
  let deviceName = "Thiết bị không xác định";
  if (ua.os.name) {
    deviceName = `${ua.os.name}`;
    if (ua.browser.name) {
      deviceName += ` (${ua.browser.name})`;
    }
  } else if (ua.browser.name) {
    deviceName = ua.browser.name;
  }

  return {
    sessionId,
    deviceName,
    ipAddress,
  };
};

module.exports = getRequestMetadata;
