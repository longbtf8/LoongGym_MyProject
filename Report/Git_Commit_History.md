# LỊCH SỬ PHÁT TRIỂN & CÁC COMMITS TÍNH NĂNG LOONGGYM

Tài liệu này ghi chép lại hành trình phát triển hệ thống LoongGym thông qua lịch sử commits gần đây, thể hiện sự nâng cấp liên tục về mặt tính năng, bảo mật và kiến trúc phần mềm.

---

## 🚀 1. Lộ Trình Phát Triển Qua Lịch Sử Commits

Dưới đây là phân tích chi tiết ý nghĩa và vai trò của các commits gần đây nhất trong dự án:

### 1. `6bf93e1` - Phân rã Monolithic Profile và tích hợp thiết bị hoạt động
*   **Hành động**: Tách trang Hồ sơ cá nhân cồng kềnh thành các component nhỏ gọn và liên kết danh sách các thiết bị đang đăng nhập với API của RTK Query.
*   **Ý nghĩa**: Giúp tăng tốc độ hiển thị và giúp người dùng kiểm soát được bảo mật tài khoản (phát hiện các phiên đăng nhập lạ).

### 2. `ade0b9d` - Khắc phục lỗi Prisma Client Validation Error
*   **Hành động**: Thay thế việc gán trực tiếp khóa ngoại `userId` bằng cách sử dụng kết nối quan hệ lồng nhau (`user: { connect: { id: userId } }`) trong câu lệnh khởi tạo Refresh Token.
*   **Ý nghĩa**: Đảm bảo tuân thủ nghiêm ngặt các ràng buộc khóa ngoại của cơ sở dữ liệu quan hệ và loại bỏ hoàn toàn lỗi xác thực dữ liệu của Prisma.

### 3. `b3c8b6b` - Khóa lỗi thô cơ sở dữ liệu & Đồng bộ Schema
*   **Hành động**: Chạy đồng bộ trực tiếp database schema lên MySQL và cập nhật `exceptionHandler` chặn đứng lỗi thô của Prisma/SQL, trả về lỗi tiếng Việt thân thiện ở các view Đăng nhập/Đăng ký.
*   **Ý nghĩa**: Tăng cường bảo mật bảo vệ cấu trúc bảng DB khỏi các cuộc tấn công khai thác lỗi hiển thị và cải thiện trải nghiệm người dùng Việt Nam.

### 4. `fda32ee` - Thiết kế bộ chuyển đổi lỗi thông minh `errorParser`
*   **Hành động**: Tạo file helper `errorParser.js` xử lý tập trung mọi dạng lỗi thô trả về từ API và sửa lỗi sập ứng dụng khi nhận dạng biểu tượng thiết bị từ giá trị rỗng.
*   **Ý nghĩa**: Loại bỏ sự lặp lại của các khối mã bắt lỗi trên Frontend, tối ưu hóa kích thước file và giúp ứng dụng hoạt động ổn định không bao giờ bị crash trắng màn hình.

### 5. `f1cd0ec` - Tích hợp Header Refresh Token & Ẩn hiện mật khẩu
*   **Hành động**: Bổ sung bảo mật phiên bằng header `x-refresh-token`, cơ chế gom cụm phiên và liên kết API đổi mật khẩu có tích hợp mắt ẩn hiện mật khẩu.
*   **Ý nghĩa**: Nâng cao tính an toàn cho luồng xác thực đa thiết bị, cho phép làm mới phiên an toàn và tăng độ thân thiện của Form đổi mật khẩu.

### 6. `81f6e18` - Mở rộng CORS Header trên Backend & Sửa Confirm Payload
*   **Hành động**: Cho phép header `x-refresh-token` vượt qua CORS của Backend và đồng bộ đúng payload xác nhận mật khẩu trên Frontend.
*   **Ý nghĩa**: Đảm bảo giao tiếp liên nguồn thông suốt không bị trình duyệt chặn và sửa lỗi đổi mật khẩu không khớp.

### 7. `651bf9e` - Tải lười Dynamic Lazy-Loading & Màn hình chờ Neon lộng lẫy
*   **Hành động**: Tách Custom Hook `useProfileForm.js`, nâng cấp hỗ trợ cho PasswordInput và tích hợp màn hình chờ LoadingScreen Neon 3D cao cấp.
*   **Ý nghĩa**: Tối ưu dung lượng tải ban đầu của web, nâng cao hiệu năng hoạt động của giao diện và tạo ấn tượng thiết kế lộng lẫy, premium bậc nhất cho khách hàng ngay từ cái nhìn đầu tiên.

### 8. `17d8337` & `fa66c73` - Tích hợp Tải Ảnh đại diện Avatar cao cấp
*   **Hành động**: Cấu hình package `multer` tại Backend và tích hợp upload ảnh trực tiếp lên kho lưu trữ đám mây Cloudinary thông qua Controller & Service riêng biệt.
*   **Ý nghĩa**: Cho phép người dùng cá nhân hóa hồ sơ bằng cách thay đổi avatar trực tiếp trên UI một cách an toàn và nhanh chóng.

### 9. `1ee2071` - Đồng bộ hóa Zod Schema toàn diện
*   **Hành động**: Bổ sung validation schema `updateProfileSchema` khớp chính xác từng trường trong database bao gồm giới tính, địa chỉ, trình độ, bio, hạng thành viên, chiều cao, cân nặng.
*   **Ý nghĩa**: Đảm bảo tính toàn vẹn dữ liệu từ tầng Client cho tới tầng Database và không cho phép lọt bất kỳ dữ liệu rác nào.

### 10. `feat/seed-db-cloudinary` - Khởi tạo Thư viện Bài tập & Đồng bộ Ảnh Cloudinary
*   **Hành động**: Viết script tải tạm ảnh bài tập từ `free-exercise-db` về backend, upload tập trung lên Cloudinary (`LoongMilkGym_APP/exercises`) khớp theo slug bài tập, sau đó dọn dẹp ảnh tạm ở backend và nạp 21 bài tập mẫu vào cơ sở dữ liệu qua Prisma.
*   **Ý nghĩa**: Xây dựng kho dữ liệu bài tập chuẩn hóa làm nền tảng phát triển tính năng thư viện, đồng bộ hóa tối ưu tài nguyên lưu trữ đám mây.

### 11. `fix/avatar-cleanup` - Tự động dọn dẹp Avatar cũ trên Cloudinary
*   **Hành động**: Tích hợp hàm `getPublicIdFromUrl` để trích xuất `public_id` và gọi lệnh `cloudinary.uploader.destroy()` xóa ảnh avatar cũ trước khi cập nhật đường dẫn ảnh mới vào database.
*   **Ý nghĩa**: Tránh phát sinh file ảnh rác và tiết kiệm tối đa không gian lưu trữ cho tài khoản Cloudinary.

### 12. `feat: resolve tooltip flicker, redesign mobile bottom nav, fix page layout jumps, and secure backend auth`
*   **Hành động**:
    - Thay thế `transition-all` bằng `transition-colors` và thêm phần tử đệm vô hình `before:` trên Avatar và ThemeToggle để loại bỏ hoàn toàn lỗi chớp nháy tooltip.
    - Cấu hình lại Bottom Nav dạngcontigous 5 cột (`grid-cols-5`) dính liền phẳng, loại bỏ viền đen/xanh đậm mặc định và áp dụng hiệu ứng chuyển đổi nền `transition-colors duration-200` mượt mà khi chọn.
    - Thiết lập chiều cao tối thiểu (`min-h`) cứng cho grid bài tập theo từng breakpoint (`850px` / `1300px` / `1100px`) để khóa vị trí của phân trang và footer.
    - Bảo mật hóa Refresh Token thông qua SHA-256 hash trước khi ghi xuống CSDL và áp dụng cơ chế xác thực Session ID (UUID) kiểm soát đa phiên hoạt động.
*   **Ý nghĩa**: Mang lại trải nghiệm UI/UX di động cực kỳ hoàn hảo, mượt mà và gia tăng mức độ bảo mật cho hệ thống xác thực.

### 13. `docs: add separate profile and exercise library page documentation reports`
*   **Hành động**: Viết riêng 2 tài liệu thiết kế nghiệp vụ hoàn chỉnh cho trang Hồ sơ cá nhân (`Page_Profile_Documentation.md`) và trang Thư viện bài tập (`Page_ExerciseLibrary_Documentation.md`).
*   **Ý nghĩa**: Chuẩn hóa tài liệu thiết kế hệ thống giúp việc bàn giao hoặc cộng tác lập trình diễn ra hiệu quả hơn.

### 14. `feat: implement GET /api/dashboard/summary API and page documentation`
*   **Hành động**:
    - Xây dựng tầng Route (`dashboard.route.js`), Controller (`dashboard.controller.js`), và Service (`dashboard.service.js`) để phục vụ API lấy thông tin tổng quan Dashboard.
    - Áp dụng kiểm tra xác thực qua middleware `authRequire.js` và xử lý các giá trị mặc định cho người dùng (`fullName`, `goal`, `fitnessLevel`) và mục tiêu dinh dưỡng tạm thời.
    - Soạn thảo tài liệu nghiệp vụ chi tiết cho trang Dashboard tại `Report/Page_Dashboard_Documentation.md`.
*   **Ý nghĩa**: Cung cấp API lõi phục vụ hiển thị thông tin trang chủ của người dùng và đồng bộ hóa tài liệu hệ thống.

### 15. `feat: implement dashboard frontend UI, routes, tablet header optimization, and mobile navigation sheet`
*   **Hành động**:
    - Thiết kế giao diện Dashboard `/dashboard` với 8 phân vùng thông tin cốt lõi hiển thị lời chào, mục tiêu, thẻ tập luyện hôm nay, tiến trình dinh dưỡng, chỉ số phục hồi SVG, biểu đồ tuần, hành động nhanh và bảng xếp hạng tuần.
    - Cấu hình định tuyến lazy load tại `src/routes/index.js` và bổ sung path `dashboard: "/dashboard"` tại `src/config/path.js`.
    - Tối ưu hóa kích thước chữ và ẩn nút Đăng ký khi chiều rộng màn hình gần tới tablet (`lg:hidden xl:inline-flex`) tránh xuống dòng.
    - Thay thế thanh Bottom Nav di động sang dạng 4 tab chính + 1 nút "Thêm" gọi Bottom Sheet Slide-up kính mờ (Glassmorphism) chứa thông tin tài khoản VIP và lưới hành động phụ (bao gồm nút Bảng điều khiển mới).
*   **Ý nghĩa**: Hoàn thiện toàn bộ hệ thống giao diện Dashboard cao cấp chuẩn thiết kế mockup, nâng tầm trải nghiệm điều hướng trên di động và tối ưu hóa hiển thị responsive.

### 16. `feat: link dashboard to desktop header and scale down mobile text size`
*   **Hành động**:
    - Thêm mục Bảng điều khiển vào mảng `NAV_ITEMS` trên desktop và dropdown Avatar của Header.
    - Cấu hình lại kích thước của Logo (`text-3xl sm:text-4xl`) và tiêu đề h1 (`text-2xl sm:text-4xl`) trên các trang đăng nhập, đăng ký, quên mật khẩu, đổi mật khẩu và trang chi tiết bài tập để không bị quá to trên di động.
### 17. `feat/refactor: modularize dashboard and header, unify controller naming, centralize helpers, and implement dashboard rtk query`
*   **Hành động**:
    - Phân rã Monolith Header: Tách `BottomNavBar` và `MobileBottomSheet` thành các component con riêng biệt đặt trong cùng một thư mục `src/components/Header/`.
    - Phân rã Monolith Dashboard: Tách giao diện trang Dashboard cồng kềnh thành 8 component con độc lập trong thư mục `src/pages/dashboard/components/` bao gồm: `GreetingBanner`, `TodayWorkoutCard`, `NutritionTracker`, `RecoveryScore`, `AICoachInsight`, `WeeklyProgressChart`, `QuickActionsGrid`, và `WeeklyLeaderboard`.
    - Tích hợp RTK Query cho Dashboard: Tạo dịch vụ `dashboardApi.js`, cấu hình trong Redux store, và sử dụng hook `useGetDashboardSummaryQuery` thay thế cho lệnh gọi axios thô.
    - Cấu trúc lại Backend: Đổi tên file controller sang dạng số ít nhất quán (`exercises.controller.js` -> `exercise.controller.js`), cập nhật route tương ứng, và tối ưu hóa việc trích xuất metadata với tiện ích `requestMetadata.js`.
    - Chuẩn hóa Tiện ích và Lỗi: Xây dựng class `AppError` mang status code và di chuyển các helper xử lý Cloudinary sang `utils/cloudinary.js` để tái sử dụng, đồng thời áp dụng `AppError` vào các service.
    - Vá lỗi xác thực: Sửa lỗi trích xuất token tại `authRequire.js` từ `slice(6)` thành `slice(7)` để khớp chính xác độ dài của chuỗi `"Bearer "`.
*   **Ý nghĩa**: Làm sạch đáng kể cấu trúc mã nguồn ở cả hai phía Client/Server, nâng cao khả năng bảo trì hệ thống và đảm bảo tính đồng bộ kiến trúc.

---

## 🛠️ 2. Nguyên Tắc Cập Nhật Commit Chuẩn Mực
Dự án LoongGym áp dụng tiêu chuẩn đặt tên commit khoa học (**Conventional Commits**):
*   `feat`: Khi bổ sung tính năng mới hoàn chỉnh.
*   `fix`: Khi sửa lỗi nghiệp vụ hoặc lỗi cú pháp lập trình.
*   `refactor`: Khi tái cấu trúc lại mã nguồn sạch hơn mà không đổi hành vi hệ thống.
*   `chore`: Khi cài đặt thêm thư viện, cập nhật cấu hình dự án.
*   `style`: Khi thay đổi giao diện CSS, căn lề, định dạng mã nguồn.
