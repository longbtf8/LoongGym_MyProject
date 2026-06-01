/**
 * Phân tích cú pháp lỗi trả về từ API Backend (RTK Query / Axios) thành thông điệp thân thiện với người dùng.
 * Che giấu hoàn toàn các lỗi kỹ thuật thô của cơ sở dữ liệu để đảm bảo bảo mật.
 * 
 * @param {object} err - Đối tượng lỗi từ API
 * @param {string} fallbackMsg - Thông điệp dự phòng nếu không xác định được lỗi
 * @returns {object} { message: string, isSystemError: boolean }
 */
export const parseApiError = (err, fallbackMsg = "Đã xảy ra lỗi, vui lòng thử lại.") => {
  // 1. Kiểm tra lỗi Validation trả về từ Backend (dạng object errors)
  if (err?.data?.errors) {
    const firstErrorKey = Object.keys(err.data.errors)[0];
    const errorMsg = err.data.errors[firstErrorKey][0];
    return {
      message: errorMsg || "Dữ liệu không hợp lệ.",
      isSystemError: false,
    };
  }

  // 2. Kiểm tra thông điệp lỗi dạng chuỗi
  const msg = err?.data?.message || "";
  const lowerMsg = msg.toLowerCase();

  // Phát hiện lỗi hệ thống/cơ sở dữ liệu thô (Prisma, SQL, Database, v.v.) hoặc lỗi status 500
  if (
    err?.status === 500 ||
    lowerMsg.includes("prisma") ||
    lowerMsg.includes("sql") ||
    lowerMsg.includes("database") ||
    lowerMsg.includes("column") ||
    lowerMsg.includes("table")
  ) {
    return {
      message: "Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại sau ít phút.",
      isSystemError: true,
    };
  }

  // 3. Trả về thông điệp lỗi thông thường khác từ Backend hoặc fallback
  return {
    message: msg || fallbackMsg,
    isSystemError: false,
  };
};
