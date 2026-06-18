# BÁO CÁO KẾT QUẢ TRIỂN KHAI GIAO DIỆN TRANG CHỦ & ĐỒNG BỘ DỮ LIỆU THỰC TẾ

Tài liệu này tổng hợp kết quả triển khai giao diện Trang chủ (`src/pages/home/components/`) và kết nối các logic tính toán thực tế từ cơ sở dữ liệu ở Backend.

---

## 1. CÁC NỘI DUNG ĐÃ HOÀN THÀNH

### 1.1. Đồng bộ số liệu thống kê chuẩn xác & Trạng thái chưa đăng nhập (`WeeklyStatsPreview.jsx`)
*   **Backend (`dashboard.service.js`)**:
    *   Tự động tính toán ngày bắt đầu (Thứ 2) và kết thúc (Chủ nhật) của tuần hiện tại theo giờ hệ thống.
    *   Truy vấn các phiên tập luyện hoàn thành (`WorkoutSession` với `status = "completed"`) để tính toán:
        *   `completedWorkoutsThisWeek`: Số buổi đã tập thực tế.
        *   `totalWorkoutMinutesThisWeek`: Tổng số phút luyện tập thực tế.
        *   `caloriesBurnedThisWeek`: Số calo tiêu thụ ước tính (8 Kcal/phút).
    *   Tính toán thời gian ngủ trung bình từ nhật ký phục hồi (`RecoveryLog`) trong tuần.
    *   Xây dựng thuật toán tính chuỗi ngày tập liên tiếp (`currentStreak`) chính xác và liên tục từ hôm nay đi lùi về trước.
    *   Trả về các mảng bản đồ tuần (Mon-Sun) cho số phút tập, calo tiêu hao, giấc ngủ để vẽ biểu đồ trực quan.
*   **Frontend**:
    *   Sử dụng Hook `useAuth` để kiểm tra trạng thái đăng nhập.
    *   **Chưa đăng nhập**: Hiển thị lớp phủ làm mờ thiết kế mờ kính (glassmorphism Backdrop Blur) kèm biểu tượng Khóa bảo mật và nút kêu gọi đăng nhập để bảo vệ thông tin.
    *   **Đã đăng nhập**: Tự động hiển thị các chỉ số thực tế từ API và vẽ đồ thị cột mini tương ứng cho từng ngày từ Thứ 2 đến Chủ nhật.

### 1.2. Gợi ý lộ trình có logic hợp lý khi đã có lộ trình (`RecommendedPrograms.jsx`)
*   **Logic xử lý**:
    *   Kiểm tra lộ trình đang hoạt động của người dùng (`useGetActivePlanQuery`).
    *   **Nếu đã có lộ trình đang kích hoạt**:
        *   Hiển thị một banner nổi bật nằm riêng ở đầu trang: **"Lộ trình tập hiện tại của bạn"** hiển thị tên lộ trình, mô tả tiến trình và cung cấp hai nút thao tác nhanh: **"Tiếp tục tập luyện"** (dẫn đến trang `/my-plan`) và **"Đổi lộ trình khác"** (cuộn mượt mà xuống danh sách thay thế).
        *   Danh sách bên dưới sẽ được đổi tên thành **"Lộ trình thay thế đề xuất"** và tự động lọc bỏ lộ trình hiện tại của người dùng.
        *   Hiển thị cảnh báo màu cam rõ ràng: *"Khi chọn lộ trình mới bên dưới, hệ thống sẽ hủy bỏ lộ trình hiện tại của bạn để thiết lập lộ trình mới. Dữ liệu lịch cũ sẽ được làm sạch."*

### 1.3. Cải tiến Banner HIIT thành Buổi tập đề xuất hôm nay (`HIITBanner.jsx`)
*   **Logic xử lý**:
    *   Truy vấn ngày tập luyện của ngày hôm nay từ lộ trình đang hoạt động (`todayWorkout` từ `getDashboardSummary`).
    *   **Nếu có bài tập hôm nay**: Hiển thị tên bài tập thực tế (ví dụ: *Bài tập hôm nay: Leg Day*), số lượng bài tập, thời gian dự kiến và cường độ tập của lộ trình đó. Nút Play/Bắt đầu dẫn thẳng đến trang `/today-workout`.
    *   **Nếu không có bài tập hoặc chưa đăng nhập/ngày nghỉ**: Hiển thị mặc định giáo án tập luyện HIIT 30 phút tiêu chuẩn kèm nút dẫn tới trang chọn lộ trình.

### 1.4. Tiến độ thực tế & Tủ huy hiệu thành tích đẹp hơn (`ProgressMedals.jsx`)
*   **Tiến độ thực tế**:
    *   Cột biểu đồ thể hiện chính xác trạng thái hoàn thành các ngày trong tuần (Thứ 2 - Chủ nhật) dựa trên dữ liệu thực tế từ database.
    *   Khi hover vào các ngày đã hoàn thành, tooltip sẽ hiển thị số phút tập thực tế.
*   **Tủ thành tích nâng cấp**:
    *   Thay thế huy hiệu đơn điệu bằng tủ trưng bày **3 danh hiệu cao cấp**:
        1.  **Kỷ luật thép**: Mở khóa khi có chuỗi tập luyện liên tục `currentStreak >= 3` (Hiệu ứng lửa cam neon phát sáng).
        2.  **Kiên trì**: Mở khóa khi hoàn thành `>= 3 buổi` trong tuần (Hiệu ứng sấm sét xanh chuối neon).
        3.  **Chinh phục**: Mở khóa khi lượng Calo đã đốt `totalCalories >= 500 Kcal` (Hiệu ứng cúp vàng xanh dương neon).
    *   Các danh hiệu chưa đạt được sẽ bị khóa (hiển thị mờ 55% kèm biểu tượng ổ khóa bảo mật).

### 1.5. Trích dẫn động lực tự động chạy sau 5 giây (`TestimonialQuote.jsx`)
*   **Giao diện & Chuyển động**:
    *   Tích hợp bộ danh sách 5 câu nói truyền cảm hứng tập luyện chuyên nghiệp từ các vận động viên.
    *   Tự động chuyển tiếp câu nói sau mỗi **5 giây** sử dụng `setInterval`.
    *   Thiết kế hiệu ứng chuyển cảnh làm mờ (Fade transition) mượt mà bằng cách kiểm soát độ mờ (`opacity-100` / `opacity-0`) và thu nhỏ (`scale-100` / `scale-95`).
    *   Thêm các nút chấm tròn chỉ số trang (pagination dots) cho phép người dùng click chuyển nhanh hoặc theo dõi slide hiện tại.

---

## 2. KIỂM TRA HỆ THỐNG
*   Backend Service chạy ổn định trên cổng `3009`, kết nối MariaDB truy vấn dữ liệu nhanh chóng và an toàn.
*   Các Cloudinary URLs của ảnh tĩnh được thay thế hoàn toàn thay thế các link Unsplash cũ trên trang chủ, đảm bảo không có link hỏng hoặc không an sau.
