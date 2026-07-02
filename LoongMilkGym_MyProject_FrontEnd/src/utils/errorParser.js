/**
 * Phân tích cú pháp lỗi trả về từ API Backend (RTK Query / Axios) thành thông điệp thân thiện với người dùng.
 * Che giấu hoàn toàn các lỗi kỹ thuật thô của cơ sở dữ liệu để đảm bảo bảo mật.
 * 
 * @param {object} err - Đối tượng lỗi từ API
 * @param {string} fallbackMsg - Thông điệp dự phòng nếu không xác định được lỗi
 * @returns {object} { message: string, isSystemError: boolean }
 */
export const parseApiError = (err, fallbackMsg = "Đã xảy ra lỗi, vui lòng thử lại.") => {
  // 1. Kiểm tra lỗi mất kết nối máy chủ hoặc lỗi hệ thống nghiêm trọng
  const msg = err?.data?.message || "";
  const lowerMsg = msg.toLowerCase();

  const isNetworkOrSystemError =
    !err ||
    !err.status ||
    err.status === 500 ||
    err.status === "FETCH_ERROR" ||
    err.status === "TIMEOUT_ERROR" ||
    lowerMsg.includes("prisma") ||
    lowerMsg.includes("sql") ||
    lowerMsg.includes("database") ||
    lowerMsg.includes("column") ||
    lowerMsg.includes("table") ||
    (typeof err.data === "string" && (
      err.data.toLowerCase().includes("network error") ||
      err.data.toLowerCase().includes("failed to fetch") ||
      err.data.toLowerCase().includes("connection")
    )) ||
    (err.message && (
      err.message.toLowerCase().includes("network error") ||
      err.message.toLowerCase().includes("failed to fetch") ||
      err.message.toLowerCase().includes("connection")
    ));

  if (isNetworkOrSystemError) {
    return {
      message: "Máy chủ đang bảo trì hoặc đang bận. Vui lòng thử lại sau.",
      isSystemError: true,
    };
  }

  // 2. Kiểm tra lỗi Validation trả về từ Backend (dạng object errors)
  if (err?.data?.errors) {
    const fieldLabels = {
      fullName: "Họ và tên",
      phone: "Số điện thoại",
      birthDate: "Ngày sinh",
      gender: "Giới tính",
      address: "Địa chỉ",
      height: "Chiều cao",
      weight: "Cân nặng",
      heightUnit: "Đơn vị chiều cao",
      weightUnit: "Đơn vị cân nặng",
      calorieGoal: "Mục tiêu Calo",
      fitnessLevel: "Trình độ thể chất",
      goal: "Mục tiêu tập luyện",
      bio: "Tiểu sử",
    };

    const messages = Object.entries(err.data.errors).flatMap(([field, errors]) => {
      const label = fieldLabels[field] || field;
      const fieldErrors = Array.isArray(errors) ? errors : [errors];
      return fieldErrors.filter(Boolean).map((message) => `${label}: ${message}`);
    });

    return {
      message: messages.join("\n") || "Dữ liệu không hợp lệ.",
      isSystemError: false,
    };
  }

  // 3. Trả về thông điệp lỗi thông thường khác từ Backend hoặc fallback
  return {
    message: msg || fallbackMsg,
    isSystemError: false,
  };
};
