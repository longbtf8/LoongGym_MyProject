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
└── .gitignore                         # Tệp cấu hình loại trừ mã nguồn Git (Đã ẩn thư mục Report)
```

---

## 🎨 2. Kiến Trúc Phân Hệ Frontend (`LoongMilkGym_MyProject_FrontEnd`)
Frontend được xây dựng trên nền tảng **React (v19)** kết hợp với công cụ đóng gói siêu tốc **Vite (v8)** và thư viện quản lý trạng thái **Redux Toolkit (RTK)** kết hợp **RTK Query** để giao tiếp API đồng bộ.

### Cấu Trúc Mã Nguồn Frontend:
```
src/
├── components/           # Các component dùng chung toàn hệ thống (Header, Logo, LoadingScreen,...)
├── config/               # Cấu hình môi trường và các hằng số ứng dụng
├── hooks/                # Các Custom Hooks dùng chung (useAuth,...)
├── pages/                # Các trang nghiệp vụ chính
│   ├── account/          # Quản lý tài khoản
│   │   └── profile/      # Hồ sơ cá nhân (Đã được mô-đun hóa cực kỳ tối ưu)
│   ├── auth/             # Đăng nhập, đăng ký, xác thực, khôi phục mật khẩu
│   ├── exercises/        # Thư viện bài tập & Chi tiết bài tập (Mới thêm)
│   ├── roadmap/          # Lộ trình & Tracker tập luyện (Mô-đun hóa Direction B)
│   └── home/             # Trang chủ giới thiệu
├── services/             # Lớp kết nối API bằng RTK Query (authApi, exerciseApi,...)
├── store/                # Quản lý global State (Redux Toolkit store)
├── utils/                # Các hàm tiện ích dùng chung (errorParser,...)
├── App.jsx               # Thành phần gốc của ứng dụng React
└── main.jsx              # Điểm khởi chạy ứng dụng chính
```

---

## 💻 3. Kiến Trúc Phân Hệ Backend (`LoongMilkGym_MyProject_BackEnd`)
Backend là một máy chủ API RESTful được viết bằng **Express.js (Node.js)** và sử dụng **Prisma ORM** để tương tác với cơ sở dữ liệu quan hệ MySQL cục bộ. Backend áp dụng mô hình kiến trúc phân lớp sạch sẽ (**Service-Oriented Architecture**):

### Cấu Trúc Mã Nguồn Backend:
```
src/
├── config/               # Cấu hình kết nối cơ sở dữ liệu, các hằng số hệ thống
├── controllers/          # Tầng tiếp nhận Request và trả về Response (auth, users, exercises,...)
├── jobs/                 # Các tác vụ chạy ngầm gửi email và dọn dẹp hệ thống
├── lib/                  # Thư viện cài đặt bên thứ 3 (prisma, nodemailer)
├── middlewares/          # Các tầng trung gian (xử lý lỗi exceptionHandler, xác thực authRequire)
├── resources/            # Tài nguyên tĩnh và mẫu email (mail templates)
├── routes/               # Định nghĩa các tuyến đường API RESTful (auth, users, exercises,...)
├── schedulers/           # Tác vụ định kỳ (cleanupExpiredTokens, cleanupProcessedJobs)
├── services/             # Tầng chứa logic nghiệp vụ chính (auth, users, exercises,...)
├── utils/                # Hàm tiện ích hệ thống (unitConverter, upload, jwt,...)
├── validations/          # Tầng kiểm tra ràng buộc đầu vào bằng Zod Schema (user, exercise,...)
├── server.js             # Điểm khởi động máy chủ API Express
└── prisma/               # Cấu hình schema.prisma và các bản chuyển đổi DB
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
        Note over FE: Hiển thị lỗi lên UI ngay trên Form
    ELSE Dữ liệu hợp lệ
        VAL->>CTL: Chuyển tiếp Request sạch
        CTL->>SVC: Gọi hàm updateProfile(userId, data)
        Note over SVC: Chạy logic quy đổi đơn vị đo lường<br/>(cm/inch/ft -> CM; kg/lb/st -> KG)
        SVC->>DB: Thực hiện câu lệnh Prisma.userProfile.update
        DB-->>SVC: Trả về bản ghi đã lưu thành công
        SVC->>SVC: Quy đổi ngược đơn vị để gửi về hiển thị
        SVC-->>CTL: Trả về dữ liệu hồ sơ mới
        CTL-->>FE: HTTP 200 Success (kèm dữ liệu mới đã được chuẩn hóa)
        Note over FE: Cập nhật State toàn cục<br/>(Hiển thị chỉ số lộng lẫy lên giao diện)
    END
```

*   **Tải trang (Lazy-Loading)**: Ứng dụng phân rã mã nguồn thành các file chunk độc lập để tải nhanh. Khi chuyển trang, React Suspense sẽ hiển thị component **LoadingScreen** với hiệu ứng vòng xoay Neon và logo màu sắc thương hiệu nổi bật.
*   **Tích hợp Lưu Trữ Đám Mây (Cloudinary)**: 
    *   Hồ sơ người dùng hỗ trợ upload Avatar trực tiếp lên Cloudinary. Khi có Avatar mới, hệ thống tự động gọi API Cloudinary để hủy bỏ (destroy) tệp tin ảnh cũ dựa trên `public_id`, giải phóng bộ nhớ.
    *   Thư viện bài tập (21 bài tập chính) sử dụng ảnh mẫu chất lượng cao được lưu trữ tập trung trên thư mục `LoongMilkGym_APP/exercises` của Cloudinary và đồng bộ hóa qua DB MySQL.
    *   Giáo án lộ trình có sẵn sử dụng ảnh bìa gym/fitness chất lượng cao lưu trữ tại `LoongMilkGym_APP/program_covers` trên Cloudinary và được đồng bộ hóa qua DB thông qua cơ chế seed database.

*   **Bảo mật dữ liệu**: Hệ thống không lưu trữ mật khẩu hay khóa thô. Lớp bảo mật `exceptionHandler` chặn đứng toàn bộ mã lỗi kỹ thuật của Prisma/SQL để tránh rò rỉ cấu trúc DB ra ngoài Internet.
