# BÁO CÁO CÔNG NGHỆ SỬ DỤNG - PHÂN HỆ FRONTEND & BACKEND LOONGGYM

Tài liệu này tổng hợp chi tiết toàn bộ ngăn xếp công nghệ (Technology Stack) đã được lựa chọn, cấu hình và triển khai trong cả hai phân hệ Frontend và Backend của dự án LoongGym.

---

## 🎨 I. PHÂN HỆ FRONTEND (Giao diện người dùng)

Phân hệ Frontend được xây dựng dựa trên các thư viện hiện đại nhất của hệ sinh thái React, hướng tới hiệu năng cao, tối ưu dung lượng tệp tin tải về (bundle size) và mang lại giao diện Glassmorphism mượt mà.

### 1. Khung phát triển chính (Core Framework & Build Tool)
*   **React 19 (`react`, `react-dom` v19.2.6)**: Phiên bản React mới nhất với các cải tiến vượt bậc về Concurrent Mode, tự động quản lý render và tích hợp React Compiler để tối ưu hóa hiệu năng render.
*   **Vite 8 (`vite` v8.0.12)**: Công cụ build cực nhanh dựa trên ES modules, giúp rút ngắn thời gian khởi động môi trường phát triển (HMR) và tối ưu hóa đóng gói production.
*   **React Router DOM 7 (`react-router-dom` v7.16.0)**: Quản lý định tuyến SPA (Single Page Application) mạnh mẽ, hỗ trợ phân chia tệp mã nguồn tự động (code-splitting/lazy-loading) và quản lý lịch sử điều hướng mượt mà.

### 2. Quản lý trạng thái & Đồng bộ dữ liệu (State Management & Data Fetching)
*   **Redux Toolkit (`@reduxjs/toolkit` v2.12.0) & React Redux (`react-redux` v9.3.0)**:
    *   **RTK Query**: Được sử dụng làm phân hệ chính để quản lý tất cả các kết nối API, tự động quản lý cache, tự động cập nhật cache thời gian thực (Invalidation Tags) và giảm thiểu boilerplate code.
    *   **Redux Store**: Quản lý trạng thái toàn cục cho người dùng (auth slice), giỏ hàng (cart slice) và cài đặt giao diện.

### 3. Giao diện & Trải nghiệm người dùng (Styling & UX)
*   **Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/vite` v4.3.0)**: Công cụ CSS tiện ích thế hệ mới được tích hợp trực tiếp dưới dạng Vite Plugin, tối ưu tốc độ biên dịch và giúp xây dựng giao diện tùy chỉnh nhanh chóng.
*   **Lucide React (`lucide-react` v1.16.0)**: Bộ thư viện icon vector hiện đại, sắc nét và nhẹ, hỗ trợ đầy đủ chế độ hiển thị Sáng/Tối (Light/Dark mode).
*   **React Markdown (`react-markdown` v10.1.0)**: Dùng để chuyển đổi các nội dung định dạng Markdown của AI Coach phản hồi thành HTML hiển thị đẹp mắt trên khung chat.

### 4. Quản lý biểu mẫu & Xác thực dữ liệu (Form Handling & Validation)
*   **React Hook Form (`react-hook-form` v7.77.0)**: Quản lý trạng thái form hiệu năng cao, giảm số lần re-render không cần thiết khi người dùng gõ phím.
*   **Zod (`zod` v4.4.3)**: Thư viện kiểm tra định dạng dữ liệu (validation schema) mạnh mẽ từ client, đồng bộ chặt chẽ với cấu trúc validation của Backend.
*   **Hook Form Resolvers (`@hookform/resolvers` v5.4.0)**: Cầu nối tích hợp Zod schema vào React Hook Form để tự động bắt lỗi nhập liệu trực quan.

### 5. Kết nối & Tiện ích bổ sung (Networking & Utilities)
*   **Axios (`axios` v1.16.1)**: HTTP Client cấu hình interceptors trung tâm để tự động gắn Access Token, mã hóa Session ID và xử lý tự động làm mới phiên đăng nhập (refresh token) khi token cũ hết hạn.
*   **Pusher JS (`pusher-js` v8.5.0)**: Client nhận các luồng dữ liệu thời gian thực (Real-time WebSockets) phát đi từ server, phục vụ cho AI Coach streaming phản hồi.
*   **Html5 Qrcode (`html5-qrcode` v2.3.8)**: Thư viện quét mã vạch sản phẩm (barcode) qua camera thiết bị, dùng trong chức năng tìm kiếm và thêm nhanh món ăn của nhật ký dinh dưỡng.

---

## ⚡ II. PHÂN HỆ BACKEND (Máy chủ dịch vụ & Cơ sở dữ liệu)

Phân hệ Backend thiết kế theo mô hình kiến trúc MVC hướng dịch vụ (Service-Oriented Architecture), xử lý đồng thời, lập lịch và tích hợp trí tuệ nhân tạo (AI).

### 1. Máy chủ chính & Định tuyến (Application Server)
*   **Express 5 (`express` v5.2.1)**: Phiên bản Express thế hệ mới cải tiến cơ chế xử lý lỗi bất đồng bộ (async errors) tự động, giúp định tuyến API gọn gàng và ổn định.
*   **CORS (`cors` v2.8.6)**: Cấu hình an toàn chia sẻ tài nguyên giữa các nguồn gốc (Cross-Origin Resource Sharing), cho phép Frontend giao tiếp bảo mật với Backend.
*   **Module Alias (`module-alias` v2.3.4)**: Cấu hình ánh xạ thư mục (ví dụ dùng `@/` thay cho `../../src`) giúp quản lý import file backend khoa học.

### 2. Tương tác Cơ sở dữ liệu (ORM & Database Client)
*   **Prisma Client (`@prisma/client` v6.19.3 & `prisma` dev-dep)**: ORM thế hệ mới tự động ánh xạ cơ sở dữ liệu thành các kiểu dữ liệu an toàn (Typesafe), tối ưu hóa câu truy vấn SQL và tự động quản lý các mối quan hệ bảng phức tạp (như bài viết, bình luận, người dùng).
*   **MariaDB/MySQL Adapter (`@prisma/adapter-mariadb` v7.8.0)**: Kết nối và tối ưu hóa hiệu suất truy vấn cơ sở dữ liệu MariaDB/MySQL.
*   **MySQL2 (`mysql2` v3.22.3)**: Driver kết nối MySQL tầng thấp có hiệu năng cao, hỗ trợ Connection Pooling giúp xử lý hàng nghìn truy vấn đồng thời mà không nghẽn kết nối.

### 3. Tích hợp Trí tuệ nhân tạo (AI & LLM Integration)
*   **Vercel AI SDK (`ai` v6.0.205)**: Khung tích hợp AI cao cấp giúp chuẩn hóa phản hồi, quản lý ngữ cảnh trò chuyện và truyền phát dữ liệu dạng dòng chảy (streaming) trực tiếp cho người dùng.
*   **DeepSeek SDK Adapter (`@ai-sdk/deepseek` v2.0.38)**: Adapter tích hợp mô hình ngôn ngữ lớn DeepSeek, xử lý phân tích thông số cơ thể và đề xuất lộ trình tập luyện/thực đơn dinh dưỡng.

### 4. Xác thực & Bảo mật ứng dụng (Security & Authentication)
*   **JSON Web Token (`jsonwebtoken` v9.0.3)**: Tạo và xác thực mã Token đăng nhập (Access Token & Refresh Token) theo chuẩn mã hóa an toàn.
*   **Bcrypt & Bcryptjs (`bcrypt` v6.0.0, `bcryptjs` v3.0.3)**: Mã hóa một chiều mật khẩu người dùng bằng thuật toán Salt trước khi lưu trữ vào Cơ sở dữ liệu.
*   **Express Rate Limit (`express-rate-limit` v8.5.2)**: Giới hạn tần suất gửi request từ mỗi địa chỉ IP (Rate Limiter) nhằm bảo vệ máy chủ khỏi các cuộc tấn công Brute-force hoặc Spam API.

### 5. Xử lý thời gian thực & Truyền thông (Broadcasting & Communication)
*   **Pusher Server (`pusher` v5.3.4)**: SDK phía server để phát đi các sự kiện (events) real-time đến các kênh WebSocket riêng tư của từng khách hàng (như streaming câu trả lời từ AI Coach).
*   **Nodemailer (`nodemailer` v8.0.10)**: Kết nối với máy chủ SMTP để gửi email tự động xác nhận tài khoản, lấy lại mật khẩu hoặc thông báo giao dịch.

### 6. Xử lý đa nhiệm & Lập lịch tự động (Multi-processing & Schedulers)
*   **Cron (`cron` v4.4.0)**: Thiết lập các tác vụ chạy ngầm định kỳ (Cron Jobs) như tự động dọn dẹp các cache gợi ý ăn uống cũ, cập nhật trạng thái lịch tập hàng ngày.
*   **Concurrently (`concurrently` v9.2.1)**: Công cụ quản lý khởi chạy đồng thời nhiều tiến trình độc lập trong môi trường phát triển (HTTP Server, Queue Processor, Cron Scheduler) chỉ bằng một câu lệnh duy nhất.
*   **Multer & Cloudinary (`multer` v2.1.1, `cloudinary` v1.41.0, `multer-storage-cloudinary` v4.0.0)**: Middleware trung gian tiếp nhận hình ảnh từ request gửi lên, tự động tối ưu hóa kích thước và tải lên kho lưu trữ đám mây Cloudinary.
