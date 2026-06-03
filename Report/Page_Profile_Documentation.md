# TÀI LIỆU TRANG HỒ SƠ CÁ NHÂN (USER PROFILE DOCUMENTATION)

Tài liệu này mô tả chi tiết giao diện người dùng (Frontend), luồng xử lý dữ liệu và các API Endpoint (Backend) liên quan đến phân hệ **Hồ sơ cá nhân (User Profile)**.

---

## 🎨 I. PHÂN HỆ FRONTEND (GIAO DIỆN & LOGIC HỒ SƠ)

### 1. File Giao Diện Chính & Cấu Trúc Component
*   **Đường dẫn file gốc**: `src/pages/account/profile/index.jsx`
*   **Mô-đun hóa giao diện (`PersonalInfoSection/`)**:
    Để tối ưu hóa hiệu suất và khả năng bảo trì, phần thông tin cá nhân được chia nhỏ thành các component độc lập:
    *   `AvatarCard.jsx`: Hiển thị Avatar người dùng, Hạng thành viên (Membership Tier), Cấp độ thể chất (Fitness Level), Bio và nút bấm tải lên ảnh đại diện mới.
    *   `StatsGrid.jsx`: Hiển thị 3 chỉ số quan trọng: **Chiều cao**, **Cân nặng**, và **Mục tiêu Calo** kèm theo lựa chọn đơn vị hiển thị tương ứng.
    *   `ProfileDetailsList.jsx`: Hiển thị danh sách các thông tin khác như Ngày sinh, Giới tính, Số điện thoại, Địa chỉ, và Mục tiêu luyện tập.
    *   `SecuritySection.jsx`: Quản lý đổi mật khẩu và thiết lập bảo mật tài khoản.

### 2. Logic Form & Đồng Bộ Hóa
*   **Custom Hook `useProfileForm.js`**:
    - Quản lý toàn bộ State của form thông tin cá nhân.
    - Nhận dữ liệu hồ sơ từ Redux Store, tự động chuyển đổi đơn vị đo lường và đưa vào các ô nhập liệu.
    - Tích hợp hàm `handleCancel` giúp phục hồi dữ liệu ban đầu từ DB ngay lập tức nếu người dùng hủy chỉnh sửa.
    - Gửi request cập nhật và bóc tách lỗi validate từ API trả về hiển thị trực quan thông báo lỗi tiếng Việt.

---

## 💻 II. PHÂN HỆ BACKEND & CÁC API ENDPOINTS LIÊN QUAN

Phân hệ Hồ sơ cá nhân tương tác trực tiếp với các API Endpoint thông qua lớp xác thực Bearer Token (JWT).

### 1. API Lấy Thông Tin Hồ Sơ (GET Profile)
*   **Endpoint**: `GET /api/users/profile`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Chức năng**: Lấy thông tin hồ sơ của người dùng đang đăng nhập.
*   **Luồng xử lý backend**:
    1. Middleware `authRequire.js` giải mã Access Token để lấy `userId`.
    2. Gọi `usersService.getProfile(userId)`.
    3. Truy vấn bảng `user_profile` liên kết với bảng `users` qua Prisma.
    4. Tự động đọc thiết lập đơn vị (`heightUnit`, `weightUnit`) của người dùng, thực hiện quy đổi giá trị chuẩn trong DB (Centimeter/Kilogram) sang đơn vị hiển thị và gửi về dưới dạng `displayHeight` và `displayWeight`.
*   **Mẫu phản hồi thành công (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Lấy thông tin hồ sơ thành công",
      "data": {
        "id": "user-uuid-1234",
        "email": "user@example.com",
        "profile": {
          "fullName": "Bùi Long",
          "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
          "phone": "0912345678",
          "address": "Hà Nội, Việt Nam",
          "gender": "male",
          "birthDate": "1998-10-15T00:00:00.000Z",
          "heightCm": 175.0,
          "weightKg": 70.0,
          "heightUnit": "cm",
          "weightUnit": "kg",
          "displayHeight": 175.0,
          "displayWeight": 70.0,
          "membershipTier": "VIP",
          "fitnessLevel": "intermediate",
          "goal": "Tăng cơ giảm mỡ"
        }
      }
    }
    ```

### 2. API Cập Nhật Thông Tin Hồ Sơ (PUT Profile)
*   **Endpoint**: `PUT /api/users/profile`
*   **Headers**: `Authorization: Bearer <accessToken>`
*   **Body**: JSON chứa các trường thông tin cần cập nhật.
*   **Chức năng**: Cập nhật thông tin hồ sơ, tự động chuẩn hóa đơn vị đo lường và dọn dẹp ảnh cũ trên Cloudinary.
*   **Luồng xử lý backend**:
    1. Xác thực người dùng qua JWT.
    2. Chạy qua lớp Zod Validation (`updateProfileSchema`) để lọc bỏ dữ liệu ảo hoặc không hợp lệ (ví dụ: ngày sinh ở tương lai, số điện thoại sai định dạng mạng Việt Nam).
    3. Quy đổi chiều cao/cân nặng từ đơn vị người dùng lựa chọn về đơn vị chuẩn (`cm` / `kg`) trước khi ghi xuống CSDL MySQL qua Prisma.
    4. Nếu người dùng thay đổi ảnh đại diện mới, tiến hành lấy URL ảnh cũ, trích xuất `public_id` và gọi API Cloudinary `cloudinary.uploader.destroy()` để xóa vĩnh viễn ảnh cũ khỏi đám mây.
*   **Mẫu phản hồi thành công (200 OK)**:
    ```json
    {
      "success": true,
      "message": "Cập nhật hồ sơ thành công",
      "data": {
        "fullName": "Bùi Long",
        "phone": "0912345678",
        "heightCm": 175.0,
        "weightKg": 70.0,
        "heightUnit": "cm",
        "weightUnit": "kg"
      }
    }
    ```

---

## 🔒 III. RÀNG BUỘC BẢO MẬT & ĐẶC TÍNH NỔI BẬT

1.  **Chuẩn hóa Đơn vị Đo Lường**: Toàn bộ dữ liệu thô trong cơ sở dữ liệu luôn nhất quán ở hệ đo lường chuẩn mét (`cm` và `kg`), đảm bảo khả năng tính toán chỉ số BMI khoa học, trong khi người dùng có thể tùy ý xem và nhập liệu bằng `inch`, `ft`, `lb`, hay `st`.
2.  **Khắc phục lỗi chớp nháy Avatar**: Nút cập nhật Avatar trên frontend được thiết lập vùng đệm giúp việc tương tác mượt mà, không bị giật lag khung ảnh khi di chuyển con trỏ chuột.
3.  **Hủy ảnh rác tự động**: Ngăn chặn rác bộ nhớ lưu trữ đám mây Cloudinary bằng cách xóa bỏ hoàn toàn tệp tin cũ ngay khi tải lên tệp tin mới thành công.
