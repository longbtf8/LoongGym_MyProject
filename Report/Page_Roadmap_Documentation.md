# PHÂN HỆ LỘ TRÌNH VÀ TRACKER TẬP LUYỆN THÔNG MINH (ROADMAP)

Tài liệu này mô tả chi tiết thiết kế kiến trúc, nguyên lý hoạt động, giải pháp mô-đun hóa thành phần và logic nghiệp vụ của phân hệ Lộ trình & Tracker Tập luyện (Roadmap) trong dự án LoongGym.

---

## 🧭 1. Tổng Quan Phân Hệ Roadmap
Phân hệ Lộ trình tập luyện (`/roadmap`) cung cấp công cụ đồng hành toàn diện cho người dùng gym:
*   **Chọn giáo án (Plan Selection)**: Lựa chọn các giáo án có sẵn (PPL, Upper/Lower, Full Body, Bro Split) hoặc tạo lộ trình tự chọn cá nhân.
*   **Lập lịch chu kỳ (Cycle Scheduling)**: Kéo thả/thiết lập thứ tự tập luyện các ngày trong chu kỳ trước khi kích hoạt giáo án.
*   **Theo dõi hàng ngày (Daily Tracker)**: Check-in bài tập, điều chỉnh Sets/Reps/Weight trực tiếp, ghi chú buổi tập (Session Notes), và đánh dấu hoàn thành buổi tập.
*   **Phân tích & Thống kê (Analytics)**: Biểu đồ khối lượng tập (Volume Chart) hàng tuần và chỉ số đo lường dinh dưỡng.

---

## 🎨 2. Giải Pháp Mô-đun Hóa Thành Phần (Direction B Refactor)
Để trang chính `index.jsx` đạt mức tinh gọn tối đa và dễ quản lý, toàn bộ logic truy vấn API (queries/mutations) và state cục bộ đã được phân bổ trực tiếp vào các component con:

```
src/pages/roadmap/
├── index.jsx                   # Nhạc trưởng điều phối chính (Orchestrator)
└── components/                 # Các component con tự trị (Autonomous Components)
    ├── PlanSelector.jsx        # Lựa chọn giáo án & Lộ trình tự chọn
    ├── SchedulerModal.jsx      # Thiết lập lịch tập chu kỳ
    ├── SwapModal.jsx           # Thay thế & thêm mới bài tập từ thư viện
    ├── CancelModal.jsx         # Xác nhận huỷ lộ trình hoạt động
    ├── CalendarSlider.jsx      # Thanh trượt chọn ngày theo tuần (7 ngày)
    ├── ExerciseList.jsx        # Danh sách bài tập & Chế độ chỉnh sửa thông số
    └── AnalysisSidebar.jsx     # Sidebar thống kê dinh dưỡng, biểu đồ và nút Hoàn tất
```

### Chi Tiết Hoạt Động Của Các Component Con:

#### A. Trình Chọn Giáo Án (`PlanSelector.jsx`):
*   **Tự quản lý dữ liệu**: Sử dụng query `useGetWorkoutProgramsQuery` để tải danh sách giáo án có sẵn từ DB.
*   **Tự khởi tạo lộ trình tự chọn**: Quản lý state tiêu đề tự chọn và gọi mutation `useStartCustomPlanMutation` độc lập.
*   **Helper Tần suất**: Hàm `getProgramFrequency` phân tích slug để gợi ý số buổi tập mỗi chu kỳ cho người dùng.

#### B. Modal Thiết Lập Chu Kỳ (`SchedulerModal.jsx`):
*   **Tự động tải chi tiết**: Nhận vào `programId` từ trang cha, tự động kích hoạt query `useGetWorkoutProgramQuery` để lấy danh sách ngày mẫu.
*   **Quản lý sắp xếp**: Cho phép kéo thả hoặc hoán đổi thứ tự ngày tập qua state `schedulerDays`.
*   **Mutation khởi tạo**: Trực tiếp gọi `useStartProgramPlanMutation` để gửi mảng `dayMapping` và kích hoạt lộ trình 30 ngày tập thực tế.

#### C. Modal Thay Thế Bài Tập (`SwapModal.jsx`):
*   **Chống ô nhiễm dữ liệu**: Tự quản lý state tìm kiếm `searchKeyword` và query `useGetExercisesQuery` lọc theo nhóm cơ mục tiêu của ngày tập (`dayDetails?.focusArea`).
*   **Gọi có điều kiện**: Chỉ kích hoạt query khi modal ở trạng thái mở (`skip: !isOpen`), tối ưu hóa băng thông mạng.

#### D. Modal Huỷ Lộ Trình (`CancelModal.jsx`):
*   **Giao diện xác nhận**: Cảnh báo người dùng về việc xóa vĩnh viễn dữ liệu 30 ngày tập.
*   **Tự kích hoạt**: Gọi trực tiếp mutation `useCancelActivePlanMutation` và gửi tín hiệu báo thành công (`onSuccess`) về trang cha để dọn dẹp view.

---

## ⚡ 3. Logic Nghiệp Vụ Đặc Thù

### A. Logic Hoàn Tất Ngày Tập Theo Thời Gian Thực (Time-Relative Completion Rule)
Hệ thống so sánh ngày của buổi tập được chọn (`dayDetails?.day?.scheduledDate`) với ngày hiện tại của Client (lấy theo định dạng chuẩn hóa `YYYY-MM-DD` để tránh sai lệch múi giờ).

1.  **Ngày Hiện Tại (Hôm nay)**: 
    *   Nút "Hoàn tất buổi tập" ở Sidebar hoạt động bình thường, hiển thị trạng thái sẵn sàng bấm. Sau khi bấm, nút chuyển sang trạng thái disabled hiển thị `"Đã hoàn thành"`.
    *   Nếu là ngày nghỉ (`rest`), nút hiển thị `"Ngày nghỉ"` và bị disabled.
2.  **Ngày Đã Qua (Quá khứ)**:
    *   **Sidebar**: Nút "Hoàn tất" bị vô hiệu hóa hoàn toàn, tự động hiển thị trạng thái `"Đã hoàn thành"`.
    *   **Lịch trượt (`CalendarSlider.jsx`)**: Để tạo động lực tập luyện, các ngày quá khứ khác ngày nghỉ (dù trên DB chưa click hoàn thành) vẫn sẽ được đánh dấu bằng dấu tích xanh (`Check` icon) như một ngày hoàn thành mặc định.
3.  **Ngày Sắp Tới (Tương lai)**:
    *   Nút bị vô hiệu hóa và hiển thị chữ `"Chưa đến ngày tập"`.

### B. Chế Chỉnh Sửa Bài Tập Trực Quan (Highlight Edit Mode)
Trong component `ExerciseList.jsx`, khi người dùng bấm nút "Sửa" một bài tập bất kỳ:
*   Các ô nhập liệu số lượng hiệp (Sets), số lần lặp (Reps) và khối lượng (Weight) sẽ sáng lên rõ ràng nhờ viền màu chủ đạo nổi bật (`border-primary/70 bg-[var(--bg-color)]`).
*   Áp dụng hiệu ứng scale phóng to nhẹ và bóng đổ bên trong (`shadow-inner`) giúp người dùng nhận biết ngay vùng có thể click nhập số và tương tác.

---

## 🔄 4. Đồng Bộ Hóa Cache & Chống Cache Giáo Án Cũ (Cache Invalidation)
Để giải quyết triệt để vấn đề cache dữ liệu cũ sau khi hủy giáo án hoặc chuyển đổi lộ trình mới (người dùng phải F5 refresh lại trang):
*   Đã bổ sung cấu hình thẻ Cache Tags chuyên biệt trong `roadmapApi.js`: `"DayDetails"`, `"Roadmap"`, và `"RoadmapStats"`.
*   Khi người dùng bắt đầu lộ trình mới hoặc huỷ lộ trình cũ, hệ thống tự động phát tín hiệu invalidates các tags này, ép buộc RTK Query xóa cache cũ và fetch lại dữ liệu hoàn toàn mới ngay lập tức trên UI.

---

## 🖼️ 5. Quản Lý Ảnh Bìa Lộ Trình (Cloudinary Integration)
*   **Tải lên đám mây**: 4 ảnh gym/fitness chất lượng cao đã được tải lên Cloudinary tại thư mục `LoongMilkGym_APP/program_covers/` để làm ảnh bìa cho 4 giáo án mặc định.
*   **Cập nhật Database**: Đã cập nhật mảng cấu hình `programsConfig` trong file seed `seed-roadmap.js` trỏ trực tiếp đến các URL secure của Cloudinary và chạy lại lệnh seed database thành công.
*   **Kết quả**: Giao diện tuyển chọn giáo án hiển thị ảnh bìa sắc nét, tốc độ tải tối ưu thông qua CDN của Cloudinary.
