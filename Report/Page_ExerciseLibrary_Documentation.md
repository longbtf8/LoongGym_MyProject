# TÀI LIỆU TRANG THƯ VIỆN BÀI TẬP (EXERCISE LIBRARY DOCUMENTATION)

Tài liệu này mô tả chi tiết giao diện người dùng (Frontend), luồng xử lý bộ lọc, phân trang ổn định chiều cao và các API Endpoint (Backend) liên quan đến phân hệ **Thư viện bài tập (Exercise Library)**.

---

## 🎨 I. PHÂN HỆ FRONTEND (GIAO DIỆN & BỘ LỌC ĐỘNG)

### 1. Cấu Trúc Các Trang & Thành Phần (Pages & Components)
*   **Trang danh sách bài tập**: `src/pages/exercises/index.jsx`
*   **Trang chi tiết bài tập**: `src/pages/exercises/detail/index.jsx`
*   **Thành phần giao diện nâng cao**:
    *   `ExerciseCard.jsx`: Thẻ hiển thị tóm tắt thông tin bài tập (Thumbnail, Tên bài tập, Nhóm cơ tác động chính, Thiết bị chính, Cấp độ). Hỗ trợ hover chống chớp nháy bằng container tĩnh.
    *   `FilterSidebar.jsx`: Thanh bộ lọc bên (hoặc Bottom Sheet trên Mobile) hỗ trợ lọc theo Thiết bị, Nhóm cơ và Cấp độ khó.
    *   `SortDropdown.jsx`: Menu thả xuống sắp xếp bài tập theo tên, độ khó hoặc ngày tạo.
    *   `Pagination.jsx`: Thanh phân trang tối giản điều hướng giữa các trang kết quả.

### 2. Quản Lý Trạng Thái Bộ Lọc (State & Query Params)
*   **Custom Hook `useExerciseFilters.js`**:
    - Quản lý đồng bộ bộ lọc thông qua Query Parameters trên URL (`?search=...&difficulty=...`). Điều này giúp người dùng có thể chia sẻ trực tiếp liên kết trang kèm bộ lọc đang chọn.
    - Cung cấp hàm `resetFilters` phục hồi trạng thái tìm kiếm mặc định.

### 3. Cơ Chế Khóa Chiều Cao Ổn Định (Layout Stability)
Để loại bỏ hiện tượng nhảy/thò thụt giật lag của Footer và thanh phân trang khi số lượng kết quả bài tập thay đổi giữa các trang, hệ thống quy định chiều cao tối thiểu (`min-h`) cứng cho container chính theo từng breakpoint thiết bị:
- **Mobile (mặc định)**: Chiều cao tối thiểu `min-h-[850px]` (Đảm bảo chứa 8 bài tập chia thành 4 hàng, 2 cột).
- **Tablet (`sm:`)**: Chiều cao tối thiểu `min-h-[1300px]` (Phù hợp kích thước card lớn hơn ở máy tính bảng).
- **Desktop (`lg:`)**: Chiều cao tối thiểu `min-h-[1100px]` (Đảm bảo chứa 8 bài tập chia thành 3 hàng, 3 cột).

---

## 💻 II. PHÂN HỆ BACKEND & CÁC API ENDPOINTS LIÊN QUAN

Phân hệ Thư viện bài tập cung cấp các API công khai (Public API) cho phép truy xuất dữ liệu nhanh chóng mà không bắt buộc đăng nhập.

### 1. API Lấy Danh Sách Bài Tập (GET Exercises List)
*   **Endpoint**: `GET /api/exercises`
*   **Query Parameters**:
    - `search` (string): Tìm kiếm bài tập theo tên hoặc mô tả.
    - `difficulty` (string): Lọc theo độ khó (`beginner`, `intermediate`, `advanced`).
    - `muscle` (string): Lọc theo danh sách slug nhóm cơ (ngăn cách bằng dấu phẩy).
    - `equipment` (string): Lọc theo danh sách slug thiết bị (ngăn cách bằng dấu phẩy).
    - `sort` (string): Tiêu chí sắp xếp (`name_asc`, `name_desc`, `difficulty_asc`, `difficulty_desc`, `newest`).
    - `page` (number): Số thứ tự trang cần lấy (mặc định = 1).
    - `limit` (number): Số bài tập tối đa trên một trang (mặc định = 8).
*   **Luồng xử lý backend**:
    1. Trích xuất các query params và xây dựng đối tượng `where` động cho Prisma Client.
    2. Thực hiện truy vấn kết hợp nhiều bảng (nhóm cơ tác động, thiết bị chính) thông qua Prisma ORM.
    3. Tính toán tổng số trang (`totalPages`) và phân trang dữ liệu bằng câu lệnh `take` và `skip`.
*   **Mẫu phản hồi thành công (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Lấy danh sách bài tập thành công",
      "data": {
        "data": [
          {
            "id": "exercise-uuid-1",
            "name": "Bench Press",
            "slug": "bench-press",
            "difficulty": "intermediate",
            "thumbnailUrl": "https://res.cloudinary.com/.../bench-press.jpg",
            "muscles": [
              {
                "role": "primary",
                "muscleGroup": { "name": "Ngực" }
              }
            ],
            "primaryEquipment": { "name": "Barbell" }
          }
        ],
        "pagination": {
          "total": 21,
          "page": 1,
          "limit": 8,
          "totalPages": 3
        }
      }
    }
    ```

### 2. API Lấy Chi Tiết Bài Tập (GET Exercise Detail)
*   **Endpoint**: `GET /api/exercises/:slug`
*   **Chức năng**: Lấy thông tin chi tiết của một bài tập cụ thể bằng đường dẫn thân thiện (slug).
*   **Mẫu phản hồi thành công (200 OK)**:
    Trả về toàn bộ các bước thực hiện (`steps`), lỗi sai kỹ thuật thường gặp (`commonMistakes`), danh sách các nhóm cơ chịu tác động chính/phụ và video hướng dẫn chi tiết.

### 3. API Lấy Danh Sách Nhóm Cơ (GET Muscle Groups)
*   **Endpoint**: `GET /api/muscle-groups`
*   **Chức năng**: Trả về danh sách các nhóm cơ được hỗ trợ phân loại trong hệ thống.

### 4. API Lấy Danh Sách Thiết Bị (GET Equipment List)
*   **Endpoint**: `GET /api/equipment`
*   **Chức năng**: Trả về danh sách tất cả các dụng cụ/trang thiết bị tập luyện trong phòng gym.

---

## 🔒 III. ĐẶC TÍNH NỔI BẬT & HIỆU SUẤT UI/UX

1.  **Dữ liệu ảnh đồng bộ hóa Cloudinary**: Các ảnh thumbnail và video của bài tập được lưu trữ tập trung trên đám mây Cloudinary, đảm bảo tốc độ tải ảnh cực nhanh và tối ưu hóa băng thông cho máy chủ gốc.
2.  **Khắc phục lỗi chớp giật thẻ Card**: Thẻ `ExerciseCard` áp dụng cơ chế bọc lớp tĩnh để kích hoạt hiệu ứng dịch chuyển, đảm bảo trượt chuột mượt mà 100% không bị rung giật màn hình.
3.  **Hạn chế giật cục giao diện khi tải dữ liệu**: Khi bộ lọc hoặc phân trang thay đổi, dữ liệu được tải bất đồng bộ (RTK Query isFetching), chiều cao tối thiểu của grid được khóa giúp phần phân trang nằm yên một chỗ tạo cảm giác cực kỳ êm ái cho mắt người dùng.
