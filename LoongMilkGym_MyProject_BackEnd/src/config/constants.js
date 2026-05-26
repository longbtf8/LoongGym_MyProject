const constants = {
  httpCodes: {
    // 2xx: Thành công
    success: 200, // Yêu cầu thành công (GET/PUT)
    created: 201, // Tạo mới thành công (POST)
    accepted: 202, // Đã nhận, đang xử lý ngầm (Queue)
    noContent: 204, // Thành công nhưng không trả dữ liệu (DELETE)

    // 3xx: Chuyển hướng
    movedPermanently: 301, // Đổi URL vĩnh viễn
    found: 302, // Đổi URL tạm thời
    notModified: 304, // Dữ liệu không đổi, dùng cache

    // 4xx: Lỗi Client (Người dùng)
    badRequest: 400, // Sai cú pháp, thiếu tham số
    unauthorized: 401, // Chưa đăng nhập / Sai Token
    forbidden: 403, // Đã đăng nhập nhưng không có quyền
    notFound: 404, // Sai URL hoặc không thấy dữ liệu
    methodNotAllowed: 405, // Sai phương thức HTTP (GET/POST...)
    conflict: 409, // Xung đột (Trùng email, tài khoản...)
    unprocessableEntity: 422, // Lỗi validate dữ liệu (Dữ liệu không hợp lệ)
    tooManyRequests: 429, // Spam, gửi quá nhiều yêu cầu (Rate limit)

    // 5xx: Lỗi Server (Hệ thống)
    internalServerError: 500, // Lỗi code Backend sập
    notImplemented: 501, // Tính năng chưa được code
    badGateway: 502, // Lỗi kết nối proxy/Nginx
    serviceUnavailable: 503, // Server quá tải / Bảo trì
    gatewayTimeout: 504, // Hết thời gian chờ phản hồi
  },
};

module.exports = constants;
