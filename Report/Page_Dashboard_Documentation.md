# TÀI LIỆU TRANG TỔNG QUAN (DASHBOARD SUMMARY DOCUMENTATION)

Tài liệu này mô tả chi tiết giao diện người dùng (Frontend) dự kiến và các API Endpoint (Backend) liên quan đến phân hệ **Tổng quan Dashboard (Dashboard Summary)**.

---

## 🎨 I. PHÂN HỆ FRONTEND (GIAO DIỆN & TIỆN ÍCH HIỆN TẠI)

Trang Dashboard đã được triển khai đầy đủ tại đường dẫn `/dashboard` (được bảo vệ bởi `AuthGuard`), thiết kế tối giản, hiện đại và chuẩn xác theo mockup:

1.  **Giao diện & Cấu trúc Grid (3 Cột trên Desktop, 2 Cột trên Tablet, 1 Cột trên Mobile)**:
    -   **Khu vực A (Greeting Banner)**: Lời chào cá nhân hóa "Xin chào, [Tên]" kèm ảnh đại diện (avatar) của người dùng hoặc ký tự đại diện với viền gradient nổi bật, hiển thị Badge mục tiêu tập (ví dụ: "Tăng cơ") và nút kêu gọi hành động (CTA) "Bắt đầu tập hôm nay" dạng capsule màu Neon nổi bật.
    -   **Khu vực B (Bài tập hôm nay)**: Card bài tập (mặc định "Ngực & Tay sau") với 3 Stat Chips dạng ô vuông (8 Bài - Số lượng, 60 Phút - Thời gian, Khó - Mức độ) và nút khởi chạy tập luyện "Bắt đầu tập" bo góc.
    -   **Khu vực C (Dinh dưỡng hôm nay)**: Các thanh tiến độ (Progress Bars) thể hiện tỉ lệ nạp Protein, Carbs, Fat trong ngày, tự động tính toán tỷ lệ % so với mục tiêu và nút "Thêm bữa ăn".
    -   **Khu vực D (AI Coach Insight)**: Khung lời khuyên dinh dưỡng và tập luyện từ AI Coach với định dạng quote nghiêng sang trọng kèm nút "Hỏi AI Coach" phản hồi nhanh.
    -   **Khu vực E (Tiến độ tuần này)**: Biểu đồ cột biểu diễn hoạt động từ T2 đến CN bằng CSS thuần trực quan, tự động làm nổi bật ngày hiện tại bằng màu Neon phát sáng.
    -   **Khu vực F (Chỉ số phục hồi)**: Vòng tròn đo điểm số phục hồi (Recovery Score) sử dụng SVG hình khuyên hiển thị tỷ lệ động (mặc định 85% Tốt), kèm 3 thông số phụ chi tiết (Giấc ngủ, Năng lượng, Đau cơ) ở dưới.
    -   **Khu vực G (Hành động nhanh)**: Lưới 2x2 nút điều hướng nhanh tới Thư viện, Lộ trình, Cửa hàng và Cộng đồng với hiệu ứng hover co giãn phóng to nhẹ thu hút tương tác.
    -   **Khu vực H (Bảng xếp hạng tuần)**: Danh sách Top 3 bảng xếp hạng người dùng trong tuần trực quan, có viền nổi bật cho người dẫn đầu và thẻ ghi nhận thứ hạng của chính người dùng hiện tại ("Alex (Bạn)").

2.  **Khả năng tương thích Thiết kế Sáng/Tối (Light/Dark Mode)**:
    -   Sử dụng hoàn toàn các biến CSS hệ thống của LoongMilkGym (`--bg-color`, `--bg-secondary`, `--text-color`, `--text-muted`, `--border-color`).
    -   Ở chế độ sáng, nền trang và card chuyển sang xám nhạt mịn màng, chữ đen rõ ràng. Ở chế độ tối, nền tối sâu và các card màu xám đen bóng bẩy chuẩn xu hướng tối giản.

3.  **Tích hợp điều hướng Mobile**:
    -   Thanh Bottom Sheet menu khi click vào nút "Thêm" trên thiết bị di động đã được tích hợp thêm nút "Bảng điều khiển" (sử dụng icon `LayoutDashboard` màu cam) để người dùng mobile dễ dàng truy cập.

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
