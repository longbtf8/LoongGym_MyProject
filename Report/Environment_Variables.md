# CẤU HÌNH BIẾN MÔI TRƯỜNG DỰ ÁN LOONGGYM

Tài liệu này hướng dẫn chi tiết các cấu hình biến môi trường (`.env`) dùng cho cả phân hệ Backend và Frontend của dự án LoongGym. Nhằm đảm bảo bảo mật tối đa, toàn bộ các khóa và mật khẩu thô thực tế đều được lược bỏ và chỉ hiển thị dưới dạng mô tả/ví dụ chuẩn hóa.

---

## 💻 1. Cấu Hình Backend (`LoongMilkGym_MyProject_BackEnd/.env`)
Tệp tin `.env` của Backend được đặt ở thư mục gốc của phân hệ Backend và chứa các tham số kết nối hệ thống cốt lõi:

| Tên Biến Môi Trường | Giá Trị Mẫu | Vai Trò & Nguyên Lý Hoạt Động |
| :--- | :--- | :--- |
| **`NODE_ENV`** | `development` | Xác định chế độ chạy của Node.js (`development` khi phát triển, `production` khi triển khai thực tế). Khi ở chế độ production, các lỗi kỹ thuật chi tiết sẽ được che giấu triệt để hơn. |
| **`DATABASE_URL`** | `mysql://user:pass@host:port/dbname` | Chuỗi kết nối cơ sở dữ liệu quan hệ (MySQL Connection String) dùng cho Prisma ORM để tạo cổng giao tiếp và đồng bộ bảng. |
| **`DATABASE_USER`** | `root` | Tài khoản quản trị cơ sở dữ liệu MySQL cục bộ. |
| **`DATABASE_PASSWORD`**| `********` | Mật khẩu kết nối an toàn cơ sở dữ liệu MySQL. |
| **`DATABASE_NAME`** | `MyGymProject` | Tên cơ sở dữ liệu MySQL dành riêng cho ứng dụng LoongGym. |
| **`DATABASE_HOST`** | `localhost` | Địa chỉ máy chủ lưu trữ MySQL (Cục bộ hoặc đám mây Cloud). |
| **`DATABASE_PORT`** | `3306` | Cổng dịch vụ mặc định để kết nối vào MySQL Server. |
| **`JWT_SECRET`** | `secret_signature_key` | Khóa bí mật dùng để ký và xác thực mã thông báo truy cập **Access Token** dạng JWT của người dùng khi đăng nhập. |
| **`JWT_EXPIRES_IN`** | `1h` | Thời gian hết hạn của Access Token (Mặc định là 1 giờ). |
| **`AUTH_REFRESH_TOKEN`**| `7` | Thời hạn sống của mã thông báo làm mới **Refresh Token** tính bằng ngày (Mặc định 7 ngày). |
| **`AUTH_VERIFICATION_JWT_SECRET`**| `verify_signature_key` | Khóa ký bảo mật dùng riêng cho luồng gửi email xác thực tài khoản đăng ký mới. |
| **`AUTH_VERIFICATION_EXPIRES_IN`**| `1h` | Thời gian giới hạn liên kết kích hoạt tài khoản trong email có hiệu lực (Mặc định 1 giờ). |
| **`AUTH_PASSWORD_RESET_EXPIRES_IN`**| `15` | Thời gian giới hạn liên kết khôi phục mật khẩu gửi qua email có hiệu lực tính bằng phút (Mặc định 15 phút). |
| **`MAIL_APP_PASSWORD`**| `app_specific_gmail_pass` | Mật khẩu ứng dụng (App Password) của tài khoản Gmail gửi thư tự động (SMTP Server Gmail). |
| **`MAIL_FROM_ADDRESS`**| `system_sender@gmail.com` | Địa chỉ hòm thư gửi email tự động của LoongGym đến khách hàng. |
| **`MAIL_FROM_NAME`** | `"LoongMilkGym"` | Tên định danh hiển thị ở hòm thư người gửi của khách hàng. |
| **`FRONTEND_URL`** | `http://localhost:5173` | Địa chỉ nguồn gốc của Frontend dùng để thiết lập lớp bảo mật **CORS (Cross-Origin Resource Sharing)** trên Backend, ngăn chặn các trang web lạ thực hiện các cuộc gọi API trái phép. |
| **`CLOUDINARY_CLOUD_NAME`** | `dvlp6zqdo` | Tên tài khoản dịch vụ lưu trữ đám mây Cloudinary dùng để upload/lưu trữ ảnh. |
| **`CLOUDINARY_API_KEY`** | `437941945764349` | Khóa công khai kết nối Cloudinary API. |
| **`CLOUDINARY_API_SECRET`** | `********` | Khóa bảo mật (Secret Key) kết nối Cloudinary API. |
| **`DB_BACKUP_LOCAL_DIR`** | `./src/storage/DBBackup` | Thư mục cục bộ tạm thời dùng để chứa file `.sql` xuất ra từ database. |
| **`DB_BACKUP_REMOTE`** | `LoongMilkGymBackupDB` | Tên của rclone remote đã được cấu hình (ví dụ: Google Drive). |
| **`DB_BACKUP_REMOTE_DIR`** | `DBLoongMilkGym` | Thư mục đích trên cloud lưu trữ các file backup CSDL. |

---

## 🎨 2. Cấu Hìng Frontend (`LoongMilkGym_MyProject_FrontEnd/.env`)
Tệp tin `.env` của Frontend được đặt ở thư mục gốc của phân hệ Frontend và chỉ chứa duy nhất một tham số chỉ đường cho Vite biên dịch:

| Tên Biến Môi Trường | Giá Trị Mẫu | Vai Trò & Nguyên Lý Hoạt Động |
| :--- | :--- | :--- |
| **`VITE_API_BASE_URL`**| `http://localhost:3009/api` | Địa chỉ URL máy chủ API gốc của Backend. Khi chạy lệnh biên dịch `npm run build`, Vite sẽ tự động tìm kiếm các khóa có tiền tố `VITE_` và nhúng trực tiếp giá trị vào mã nguồn đóng gói để React có thể gọi API chính xác. |

---

## 🛡️ 3. Nguyên Tắc Bảo Mật Biến Môi Trường
Để đảm bảo dự án không bao giờ bị rò rỉ thông tin quan trọng ra Internet, toàn bộ hệ thống tuân thủ nghiêm ngặt các nguyên tắc sau:
1.  **Không bao giờ cam kết `.env` vào Git**: Các tệp tin `.env` thực tế của cả Frontend và Backend đều nằm trong danh sách loại trừ của `.gitignore`. Git sẽ không bao giờ theo dõi hay tải các tệp tin này lên GitHub.
2.  **Sử dụng tệp tin `.env.example`**: Chỉ các tệp tin `.env.example` chứa cấu trúc khóa trống mới được đưa lên Git để hướng dẫn người phát triển khác cấu hình dự án mà không để lộ mật khẩu thực tế.
3.  **Mã hóa thông tin thô**: Các chuỗi khóa như `JWT_SECRET`, `MAIL_APP_PASSWORD` thực tế đều được mã hóa bằng các chuỗi ngẫu nhiên dài từ 32 đến 64 ký tự an toàn.
