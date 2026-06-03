# TÀI LIỆU TRANG TỔNG QUAN (DASHBOARD SUMMARY DOCUMENTATION)

Tài liệu này mô tả chi tiết giao diện người dùng (Frontend) dự kiến và các API Endpoint (Backend) liên quan đến phân hệ **Tổng quan Dashboard (Dashboard Summary)**.

---

## 🎨 I. PHÂN HỆ FRONTEND (GIAO DIỆN & TIỆN ÍCH DỰ KIẾN)

Trang Dashboard đóng vai trò trung tâm hiển thị các thông tin nhanh trong ngày của người dùng:
*   **Thẻ thông tin cá nhân**: Hiển thị tên người dùng, avatar, mục tiêu luyện tập hiện tại và cấp độ thể chất.
*   **Lộ trình tập luyện hôm nay (`todayWorkout`)**: Hiển thị bài tập dự kiến của ngày hôm nay (tạm thời trả về `null`).
*   **Điểm phục hồi (`recoveryScore`)**: Điểm phục hồi thể chất trong ngày (mặc định tạm thời là `85`).
*   **Mục tiêu và Chỉ số Dinh dưỡng (`nutrition`)**:
    - Hiển thị lượng Protein, Carbs, Fat đã nạp trong ngày so với mục tiêu đề ra (`proteinTarget`, `carbsTarget`, `fatTarget`).
*   **Thống kê tuần (`stats`)**: Số lượng bài tập đã hoàn thành, tổng số phút luyện tập trong tuần và chuỗi ngày tập liên tục (Streak).
*   **Hành động nhanh (`quickActions`)**: Các phím tắt chuyển nhanh đến Thư viện bài tập, Chọn lộ trình tập và hỏi AI Coach.

---

## 💻 II. PHÂN HỆ BACKEND & API TỔNG QUAN

### 1. API Lấy Thông Tin Tổng Quan Dashboard (GET Summary)
*   **Endpoint**: `GET /api/dashboard/summary`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Chức năng**: Lấy thông tin tóm tắt hoạt động, thể trạng và mục tiêu dinh dưỡng trong ngày của người dùng.
*   **Luồng xử lý backend**:
    1. Middleware `authRequire.js` xác thực tính hợp lệ của token và lấy `userId`.
    2. Gọi `dashboardService.getDashboardSummary(userId)`.
    3. Truy vấn thông tin người dùng từ bảng `users` kết hợp bảng `user_profile` qua Prisma Client.
    4. Trả về kết quả kèm các giá trị mặc định cho hồ sơ (nếu chưa được thiết lập) và các chỉ số hoạt động tạm thời.
*   **Mẫu phản hồi thành công (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Lấy thông tin tổng quan Dashboard thành công.",
      "data": {
        "user": {
          "id": "83647c9d-049b-4506-94fd-4f079013c486",
          "email": "builong3122005@gmail.com",
          "fullName": "BÙI THÀNH LONG",
          "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
          "goal": "Nâng cao sức bền",
          "fitnessLevel": "intermediate"
        },
        "todayWorkout": null,
        "recoveryScore": 85,
        "nutrition": {
          "protein": 0,
          "proteinTarget": 160,
          "carbs": 0,
          "carbsTarget": 300,
          "fat": 0,
          "fatTarget": 80
        },
        "stats": {
          "completedWorkoutsThisWeek": 0,
          "totalWorkoutMinutesThisWeek": 0,
          "currentStreak": 0
        },
        "quickActions": [
          {
            "label": "Xem thư viện bài tập",
            "path": "/library"
          },
          {
            "label": "Chọn lộ trình tập",
            "path": "/plans"
          },
          {
            "label": "Hỏi AI Coach",
            "path": "/ai-coach"
          }
        ]
      }
    }
    ```

---

## 🛡️ III. CÁC GIÁ TRỊ MẶC ĐỊNH & THUỘC TÍNH TÀI NGUYÊN

1.  **Dữ liệu hồ sơ mặc định**:
    - `fullName`: Trả về `"GymLife User"` nếu người dùng chưa cập nhật họ tên.
    - `goal`: Trả về `"gain_muscle"` nếu chưa thiết lập mục tiêu tập.
    - `fitnessLevel`: Trả về `"beginner"` nếu chưa chọn trình độ thể chất.
2.  **Mục tiêu dinh dưỡng mặc định**:
    - `proteinTarget`: `160` (sẽ liên kết với `NutritionTarget` hoặc `UserProfile` trong tương lai).
    - `carbsTarget`: `300` (sẽ liên kết với `NutritionTarget` trong tương lai).
    - `fatTarget`: `80` (sẽ liên kết với `NutritionTarget` trong tương lai).
