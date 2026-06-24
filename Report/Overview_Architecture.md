# TỔNG QUAN KIẾN TRÚC DỰ ÁN LOONGGYM

Dự án **LoongGym** là một ứng dụng quản lý tập luyện và chăm sóc sức khỏe cao cấp dành cho phòng gym. Dự án được phát triển theo cấu trúc **Monorepo** tích hợp cả giao diện người dùng (Frontend) và hệ thống máy chủ dịch vụ (Backend) trong cùng một kho lưu trữ mã nguồn để tối ưu hóa việc quản lý và phát triển.

---

## 📂 1. Cấu Trúc Tổng Quan Dự Án
Thư mục gốc của dự án chứa hai phân hệ chính hoạt động độc lập nhưng liên kết chặt chẽ với nhau qua các giao thức HTTP RESTful API:

```
LoongMilKGymProject/
├── LoongMilkGym_MyProject_BackEnd/    # Máy chủ dịch vụ (Backend API Node.js & Prisma)
├── LoongMilkGym_MyProject_FrontEnd/   # Giao diện người dùng (Frontend React.js Vite)
├── Report/                            # Thư mục chứa các tài liệu thiết kế hệ thống (Không deploy)
├── README.md                          # Tài liệu giới thiệu tổng quan dự án
└── .gitignore                         # Tệp cấu hình loại trừ mã nguồn Git
```

---

## 🎨 2. Kiến Trúc Phân Hệ Frontend (`LoongMilkGym_MyProject_FrontEnd`)
Frontend được xây dựng trên nền tảng **React (v19)** kết hợp với công cụ đóng gói siêu tốc **Vite** và thư viện quản lý trạng thái **Redux Toolkit (RTK)** kết hợp **RTK Query** để giao tiếp API đồng bộ.

### Cấu Trúc Mã Nguồn Frontend:
```
src/
├── components/           # Các component dùng chung toàn hệ thống (Header, Logo, LoadingScreen,...)
├── config/               # Cấu hình môi trường, hằng số và danh mục đường dẫn (paths)
├── context/              # Các Context Provider toàn cục (ConfirmContext,...)
├── hooks/                # Các Custom Hooks dùng chung (useAuth, useProfileForm,...)
├── layouts/              # Bố cục trang giao diện (DefaultLayout, AuthLayout,...)
├── pages/                # Các trang nghiệp vụ chính
│   ├── account/          # Quản lý tài khoản (Đổi mật khẩu, Chỉnh sửa hồ sơ cá nhân)
│   ├── aiCoach/          # Trợ lý ảo AI Coach chat tương tác
│   ├── auth/             # Đăng nhập, đăng ký, xác thực, khôi phục mật khẩu
│   ├── cart/             # Giỏ hàng sản phẩm số
│   ├── community/        # Bảng tin cộng đồng, tương tác xã hội (Đăng bài, bình luận, follow)
│   ├── dashboard/        # Bảng điều khiển tổng quan cá nhân
│   ├── exercises/        # Thư viện bài tập & chi tiết bài tập
│   ├── myPlan/           # Lộ trình & Lịch tập luyện 30 ngày (Khôi phục, hoán đổi ngày tập)
│   ├── nutrition/        # Theo dõi dinh dưỡng, bữa ăn và nước uống
│   ├── recovery/         # Theo dõi sức khỏe, phục hồi sinh học và chấn thương
│   ├── store/            # Cửa hàng sản phẩm số (Giáo án, thực đơn, ebook)
│   └── todayWorkout/     # Phiên tập luyện hôm nay và thực hiện hiệp làm việc
├── services/             # Lớp kết nối API bằng RTK Query (authApi, communityApi, dashboardApi,...)
├── store/                # Quản lý global State (Redux Toolkit store)
├── utils/                # Các hàm tiện ích dùng chung (errorParser,...)
├── App.jsx               # Thành phần gốc điều hướng định tuyến của ứng dụng
└── main.jsx              # Điểm khởi chạy ứng dụng chính (Mounting DOM)
```

---

## 💻 3. Kiến Trúc Phân Hệ Backend (`LoongMilkGym_MyProject_BackEnd`)
Backend là một máy chủ API RESTful được viết bằng **Express.js (Node.js)** và sử dụng **Prisma ORM** để tương tác với cơ sở dữ liệu quan hệ MySQL. Backend áp dụng mô hình kiến trúc phân lớp sạch sẽ (**Service-Oriented Architecture**):

### Cấu Trúc Mã Nguồn Backend:
```
src/
├── config/               # Cấu hình kết nối cơ sở dữ liệu, các hằng số hệ thống (constants, passport)
├── controllers/          # Tầng tiếp nhận Request và trả về Response (auth, users, community, cart,...)
├── jobs/                 # Các tác vụ chạy ngầm gửi email và dọn dẹp hệ thống
├── lib/                  # Thư viện cài đặt bên thứ 3 (prisma, nodemailer)
├── middlewares/          # Các tầng trung gian (xử lý lỗi exceptionHandler, rateLimiter, xác thực authRequire)
├── resources/            # Tài nguyên tĩnh và mẫu email (mail templates)
├── routes/               # Định nghĩa các tuyến đường API RESTful (auth, users, community, cart,...)
├── schedulers/           # Tác vụ định kỳ (cleanupExpiredTokens, cleanupProcessedJobs, backupDB)
├── services/             # Tầng chứa logic nghiệp vụ chính (auth, users, community, cart,...)
├── utils/                # Hàm tiện ích hệ thống (unitConverter, upload, jwt,...)
├── validations/          # Tầng kiểm tra ràng buộc đầu vào bằng Zod Schema (user, exercise, cart,...)
├── server.js             # Điểm khởi động máy chủ API Express
└── prisma/               # Cấu hình schema.prisma, các bản migrations và dữ liệu mẫu seed CSDL
```

---

## 🛡️ 4. Nguyên Lý Hoạt Động & Chu Kỳ Luồng Dữ Liệu (Data Flow)

Để hiểu rõ cách hệ thống hoạt động, dưới đây là chu kỳ từ lúc người dùng thao tác trên Frontend cho tới khi dữ liệu được ghi vào Database của Backend:

```mermaid
sequenceDiagram
    participant FE as Frontend React (Vite)
    participant VAL as Zod Validation Layer (Backend)
    participant CTL as Controller Layer (users.controller)
    participant SVC as Service Layer (users.service)
    participant DB as MySQL Database (Prisma)

    FE->>VAL: Gửi Request HTTP PUT /api/users/profile (kèm dữ liệu nhập liệu)
    Note over VAL: Kiểm tra định dạng đầu vào<br/>(SĐT Việt Nam, Chiều cao/Cân nặng tương ứng đơn vị)
    
    ALT Dữ liệu không hợp lệ (Dữ liệu ảo)
    VAL-->>FE: Trả về lỗi 400 (kèm thông điệp tiếng Việt thân thiện)
    Note over FE: Hiển thị lỗi lên UI ngay trên Form thông qua Toast
    ELSE Dữ liệu hợp lệ
        VAL->>CTL: Chuyển tiếp Request sạch
        CTL->>SVC: Gọi hàm updateProfile(userId, data)
        Note over SVC: Chạy logic quy đổi đơn vị đo lường<br/>(cm/inch/ft -> CM; kg/lb/st -> KG)
        SVC->>DB: Thực hiện câu lệnh Prisma.userProfile.update
        DB-->>SVC: Trả về bản ghi đã lưu thành công
        SVC->>SVC: Quy đổi ngược đơn vị để gửi về hiển thị
        SVC-->>CTL: Trả về dữ liệu hồ sơ mới
        CTL-->>FE: HTTP 200 Success (kèm dữ liệu mới đã được chuẩn hóa)
        Note over FE: Cập nhật State toàn cục<br/>(Hiển thị chỉ số lộng lẫy lên giao diện và hiển thị Toast)
    END
```

### Các Đặc Điểm Tương Tác Nổi Bật:

1. **Hộp Thoại Xác Nhận Tùy Biến (Custom Confirm System)**:
   - Thay thế hoàn toàn các lệnh `confirm()` hoặc `alert()` mặc định của trình duyệt bằng `ConfirmProvider` và custom modal Glassmorphism đồng nhất, tăng tính thẩm mỹ premium.
   - Hộp thoại này sử dụng React Portals đẩy trực tiếp ra ngoài DOM body để không chịu ảnh hưởng từ cấu trúc layout trang hiện tại.

2. **Tải Trang Mượt Mà (Lazy-Loading & Suspense)**:
   - Các trang nghiệp vụ được tải chậm để tiết kiệm dung lượng ban đầu. Trong lúc chờ tải chunk, màn hình chờ Neon cao cấp **LoadingScreen** xoay ngược chiều kim đồng hồ mang đậm phong cách fitness sẽ xuất hiện.

3. **Đồng Bộ Bộ Nhớ Đệm Đám Mây (Cloudinary)**:
   - Avatar người dùng và ảnh bìa trang cá nhân được upload lên Cloudinary. Tự động xóa ảnh vật lý cũ trên Cloudinary khi thay đổi ảnh mới để giải phóng dung lượng rác.
   - Ảnh các bài tập mẫu và giáo án cũng được đồng bộ hóa từ Cloudinary và quản lý qua cơ sở dữ liệu quan hệ MySQL.
