# NGUYÊN LÝ HOẠT ĐỘNG PHÂN HỆ BACKEND LOONGGYM

Tài liệu này trình bày chi tiết nguyên lý hoạt động của tầng máy chủ Backend, các lớp kiến trúc xử lý và các cơ chế xử lý cốt lõi.

---

## 🛡️ 1. Lớp Kiểm Tra Ràng Buộc Dữ Liệu Rất Chặt Chẽ (Validation Layer)
Nằm tại **`src/validations/`**, lớp này hoạt động như một "khiên bảo vệ" ngăn chặn hoàn toàn dữ liệu ảo và dữ liệu sai lệch trước khi chạm vào cơ sở dữ liệu.

### Ràng Buộc Zod Tối Tân:
- **Số điện thoại (`phone`)**: Sử dụng Biểu thức chính quy (Regex) tối ưu cho mạng viễn thông Việt Nam: `/^(0|84)(3|5|7|8|9)[0-9]{8}$/`. Chấp nhận cả định dạng quốc tế bắt đầu bằng `84` hoặc số điện thoại trong nước bắt đầu bằng `0`.
- **Ngày sinh (`birthDate`)**: Tích hợp phương thức `.refine()` so sánh ngày nhập với thời gian thực tế hiện tại `new Date()`. Đảm bảo ngày sinh **không bao giờ ở tương lai**.
- **Mục tiêu Calo (`calorieGoal`)**: Bắt buộc nằm trong phạm vi từ `500` đến `10,000` kcal/ngày để duy trì tính chân thực khoa học thể chất.
- **Chặn dữ liệu ảo dựa trên đơn vị (Super Refine)**:
  Tự động bắt cặp đơn vị đo lường và khoảng giá trị nhập để đưa ra thông báo cực kỳ chính xác:
  - **Chiều cao**:
    - Đơn vị `cm`: Giới hạn từ `50` đến `250` cm.
    - Đơn vị `inch`: Giới hạn từ `20` đến `100` inch.
    - Đơn vị `ft`: Giới hạn từ `1.5` đến `8.5` feet.
  - **Cân nặng**:
    - Đơn vị `kg`: Giới hạn từ `20` đến `400` kg.
    - Đơn vị `lb`: Giới hạn từ `40` đến `900` lb.
    - Đơn vị `st`: Giới hạn từ `3` đến `60` stone.

---

## 🧪 2. Lớp Tiện Ích Quy Đổi Đơn Vị Đo Lường (`src/utils/unitConverter.js`)
Để cơ sở dữ liệu luôn nhất quán, Backend áp dụng nguyên lý **"Chuẩn hóa dữ liệu lưu trữ, linh hoạt dữ liệu hiển thị"**:
- Toàn bộ chiều cao lưu xuống MySQL bắt buộc quy đổi về **Centimeters (cm)**.
- Toàn bộ cân nặng lưu xuống MySQL bắt buộc quy đổi về **Kilograms (kg)**.

### Bảng Quy Đổi Hệ Đo Lường:
| Loại Chỉ Số | Đơn Vị Nhập | Hệ Số Quy Đổi Về Hệ Chuẩn | Công Thức Ngược Lại (Hiển Thị) |
| :--- | :--- | :--- | :--- |
| **Chiều cao** | `cm` | Giữ nguyên | Giữ nguyên |
| | `inch` | 1 inch = 2.54 cm | `heightCm / 2.54` |
| | `ft` (feet) | 1 feet = 30.48 cm | `heightCm / 30.48` |
| **Cân nặng** | `kg` | Giữ nguyên | Giữ nguyên |
| | `lb` (pound) | 1 lb = 0.45359237 kg | `weightKg / 0.45359237` |
| | `st` (stone) | 1 st = 6.35029318 kg | `weightKg / 6.35029318` |

---

## ⚙️ 3. Lớp Xử Lý Dịch Vụ Core (`src/services/users.service.js`)
Service Layer là nơi điều phối nghiệp vụ và tương tác với Prisma Client.

### Hàm `getProfile(userId)`:
1. Truy vấn cơ sở dữ liệu để lấy thông tin hồ sơ `UserProfile` liên kết kèm thông tin cơ bản của `User` (email, role, status, cùng thống kê số lượng followers, following, workout sessions).
2. Nếu tìm thấy, lấy đơn vị người dùng đang thiết lập (`heightUnit`, `weightUnit`).
3. Gọi hàm tiện ích `convertFromStandard` để quy đổi chỉ số `heightCm`, `weightKg` thô trong DB sang đơn vị hiển thị tương ứng của người dùng.
4. Gán kết quả quy đổi vào 2 trường động `displayHeight`, `displayWeight` trả về cho Frontend. Điều này giúp Frontend luôn có dữ liệu chính xác để điền vào form mà không cần tự tính toán.

### Hàm `updateProfile(userId, data)`:
1. Trích xuất dữ liệu thô gửi lên gồm cả Calo, Cân nặng, Chiều cao, Đơn vị đo.
2. Kiểm tra sự tồn tại của hồ sơ cá nhân hiện tại trong DB.
3. Tính toán giá trị quy đổi chuẩn hóa:
   - Quy đổi Chiều cao thô sang CM (qua `convertToCm`).
   - Quy đổi Cân nặng thô sang KG (qua `convertToKg`).
4. Thực hiện câu lệnh cập nhật thông tin qua `prisma.userProfile.update` bao gồm cả việc ép kiểu trường Calo `calorieGoal` thành số thực `Number` hoặc `null` nếu để trống.

---

## 📁 4. Lớp Controller (`src/controllers/users.controller.js`)
Được viết dưới dạng lớp tiếp nhận nghiệp vụ số nhiều (`users.controller.js` thay thế hoàn toàn cho `user.controllers.js` cũ):
- Tách biệt hoàn toàn phần xử lý logic HTTP khỏi nghiệp vụ.
- Nhận `userId` từ token đã được giải mã nằm trong `req.user.id`.
- Nhận dữ liệu đã qua kiểm định sạch sẽ ở tầng Zod nằm trong `req.validated.body`.
- Chuyển tiếp đến `usersService` và phản hồi kết quả đẹp đẽ về client thông qua hàm mở rộng dùng chung `res.success()`.

---

## 🚨 5. Tầng Bảo Mật Xử Lý Lỗi Hệ Thống (`src/middlewares/exceptionHandler.js`)
Lớp Middleware này đóng vai trò tối quan trọng trong việc bảo mật cơ sở dữ liệu:
- Chặn toàn bộ các lỗi liên kết thô từ cơ sở dữ liệu phát sinh từ Prisma (lỗi khóa ngoại, lỗi kết nối cơ sở dữ liệu SQL, lỗi cú pháp truy vấn).
- Thay vì trả về lỗi kỹ thuật có chứa tên bảng, tên cột nhạy cảm dễ bị hacker khai thác, `exceptionHandler` sẽ tự động chuyển hóa thành các thông điệp cảnh báo thân thiện tiếng Việt (ví dụ: *"Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại sau ít phút"*).

---

## 7. Kịch Bản Seed Dữ Liệu Tự Động (`src/seeds/`)
Để phục vụ kiểm thử và phát triển nhanh chóng, dự án cung cấp bộ công cụ seed dữ liệu tự động cho các bảng sản phẩm số:
- **Kịch bản seed v2 đến v5**:
  - Tạo mới danh mục sản phẩm: Sách điện tử (E-book), Kế hoạch dinh dưỡng (Nutrition Plan), Giáo trình tập luyện (Workout Program).
  - Tự động gán hình ảnh minh họa chất lượng cao từ Cloudinary và thiết lập giá tiền, thương hiệu tương ứng.
  - Liên kết các file tài liệu số đính kèm để người dùng có thể tải về sau khi mua hàng thành công.
- **Cách chạy**: Sử dụng lệnh `npm run seed` để nạp nhanh dữ liệu mẫu vào MySQL thông qua Prisma.

---

## 🔐 8. Cơ Chế Hỗ Trợ Truy Cập Công Khai Cho Khách Vãng Lai (Guest Auth Support) - *Mới Thêm*
Để hỗ trợ Frontend có thể hiển thị bảng tin cộng đồng công khai mà không bắt buộc người dùng đăng nhập ngay lập tức:
- **Middleware Xác Thực Không Bắt Buộc (`optionalAuth`)**:
  - Được xây dựng tại `src/middlewares/optionalAuth.js`.
  - Tự động tìm kiếm token trong header `Authorization: Bearer <token>`.
  - Nếu token tồn tại và hợp lệ, giải mã thông tin phiên đăng nhập và gán vào `req.user`.
  - Nếu không có token hoặc token hết hạn, middleware **không chặn lỗi 401** như `authRequire` truyền thống, mà chỉ đơn giản gán `req.user = null` và gọi `next()` để đi tiếp vào Controller.
  - Áp dụng thành công cho các tuyến đọc bài viết công khai: `GET /posts`, `GET /posts/:id`, và `GET /media/:id` tại `community.route.js`.
- **Xử lý Relational Filter Constraint trong Prisma**:
  - Khi thực hiện các câu truy vấn quan hệ lồng nhau (ví dụ: lọc các bài viết mà người dùng hiện tại không ẩn `hiddenBy: { none: { userId } }` hoặc đã lưu `saves: { some: { userId } }`), Prisma không chấp nhận giá trị `null` cho khóa ngoại so sánh.
  - Nếu truyền `null`, cơ sở dữ liệu sẽ bị lỗi logic truy vấn gây sập luồng API.
  - **Giải pháp xử lý**: Trong `community.service.js`, hệ thống kiểm tra nếu `userId` truyền xuống là `null` (khách vãng lai chưa đăng nhập), giá trị này sẽ được tự động thay thế bằng một UUID giả lập không có thực (`activeUserId = userId || "00000000-0000-0000-0000-000000000000"`).
  - Việc này giúp câu lệnh Prisma hoạt động bình thường, bảo đảm kết quả trả về chính xác cho khách vãng lai (không bị ẩn bài đăng, chưa lưu bài đăng nào) mà không bị sập API.

---

## 🏋️ 9. Phân Hệ Thư Viện Bài Tập & Đồng Bộ Cloudinary
Để thiết lập thư viện bài tập nền tảng cho ứng dụng, hệ thống đã thực hiện quy trình nạp dữ liệu mẫu (Seeding) chuyên nghiệp:
- **Dữ liệu nạp**: 12 Nhóm cơ (Muscle Groups), 5 Thiết bị tập (Equipment), và 21 Bài tập (Exercises) chuẩn thể hình kèm chi tiết các bước thực hiện, lỗi sai thường gặp, thẻ phân loại và mức độ khó.
- **Quy trình đồng bộ ảnh**:
  1. Ảnh thumbnail của các bài tập ban đầu được trích xuất từ dữ liệu mở `free-exercise-db`.
  2. Một tiến trình chạy tự động tải các ảnh này về thư mục tạm `public/temp_thumbnails` tại backend.
  3. Ảnh được đẩy trực tiếp lên Cloudinary lưu trữ tập trung tại thư mục `LoongMilkGym_APP/exercises` với tên file (`public_id`) khớp chính xác theo **slug** của bài tập để tối ưu hóa tìm kiếm.
  4. Toàn bộ ảnh tạm và thư mục tạm tại backend được giải phóng sạch sẽ ngay khi tải lên thành công.
  5. Cập nhật các liên kết Cloudinary `secure_url` này làm dữ liệu gốc để nạp vào DB MySQL qua Prisma Client.

---

## 🖼️ 10. Cơ Chế Tự Động Xóa Ảnh Đại Diện & Ảnh Bìa Trên Cloudinary
Khi người dùng tải lên ảnh đại diện hoặc ảnh bìa mới, để tránh lãng phí dung lượng lưu trữ trên Cloudinary, hệ thống áp dụng cơ chế tự động dọn dẹp:
- **Truy vấn lịch sử**: Trước khi ghi đè đường dẫn ảnh mới, hàm `uploadAvatar` hoặc `uploadCover` trong `users.service.js` sẽ truy vấn cơ sở dữ liệu để lấy URL ảnh hiện tại của người dùng.
- **Trích xuất Public ID & Xóa ảnh vật lý**: Hàm tiện ích `getPublicIdFromUrl` phân tách URL của Cloudinary để lấy ra `public_id` chính xác và gọi API `cloudinary.uploader.destroy(oldPublicId)` để xóa vĩnh viễn tệp tin cũ.
- **Xử lý ngoại lệ an toàn**: Lệnh xóa được bọc trong khối `try...catch` riêng biệt để nếu có lỗi phát sinh từ Cloudinary, hệ thống sẽ ghi log nhưng không làm nghẽn luồng lưu trữ DB của người dùng.

---

## 💾 11. Hệ Thống Quản Lý Phiên Đăng Nhập & Bảo Mật Refresh Token (SHA-256)
- **Băm bảo mật SHA-256 một chiều**: Backend thực hiện băm một chiều Refresh Token bằng thuật toán **SHA-256** trước khi ghi dữ liệu xuống bảng `refresh_tokens`. Client chỉ giữ token thô, giúp ngăn chặn tấn công giả mạo token nếu database bị lộ.
- **Quản lý phiên dựa trên Session ID**: Mỗi lần đăng nhập tạo ra một mã định danh phiên duy nhất (`session_id` dạng UUID) đính kèm vào Refresh Token, cho phép người dùng xem danh sách thiết bị đang hoạt động và đăng xuất từ xa từng thiết bị.
- **Thu hồi Access Token chủ động**: Khi đăng xuất, Access Token hiện tại được đưa vào bảng `revoked_tokens` để vô hiệu hóa ngay lập tức. Tác vụ định kỳ `cleanupExpiredTokens.js` quét sạch các token hết hạn thực tế trong bảng blacklist để tối ưu dung lượng.

---

## 🍎 12. Phân Hệ Dinh Dưỡng & Thực Đơn Ở Backend (Nutrition API & Food Engine)
- **Thiết kế Schema**: `NutritionTarget` (mục tiêu Calo/Macros hàng ngày với khóa chính phức hợp `userId_targetDate`), `FoodItem` (thực phẩm mẫu cục bộ kết hợp trường `metadata` linh hoạt), `MealLog` (nhật ký ăn uống theo ngày/bữa), và `MealLogItem` (món ăn chi tiết kèm khối lượng tiêu thụ).
- **Chuẩn Hóa Ngày Tháng**: Backend định nghĩa hàm helper `normalizeDate` phân tích chuỗi ngày gửi lên và đưa về mốc 0 giờ UTC của ngày đó để tránh lệch múi giờ.
- **Tích Hợp API Ngoài**: Khi tìm thực phẩm, backend ưu tiên tìm cục bộ trong database. Nếu không có, hệ thống gọi API Open Food Facts toàn cầu (giới hạn thời gian chờ 2.5 giây) và tự động lưu cache thông tin sản phẩm mới vào MySQL.

---

## 📅 13. Phân Hệ Kế Hoạch Tập Luyện Cá Nhân Hóa (User Training Plans Engine)
- **Quản Lý Lộ Trình**: Bảng `UserTrainingPlan` quản lý lịch trình 30 ngày kích hoạt. Các thông tin tùy biến bài tập (`customExercises`) được lưu trực tiếp trong trường JSON `metadata` của ngày tương ứng (`UserTrainingPlanDay`).
- **Giao Dịch An Toàn**: Khi kích hoạt lộ trình, toàn bộ 30 ngày được chèn vào database thông qua khối `prisma.$transaction` để đảm bảo tính toàn vẹn dữ liệu.
- **Đề xuất và khôi phục**: Backend hỗ trợ hoán đổi ngày tập bằng cách thay đổi giá trị trường `scheduledDate` trong một transaction, đồng thời hỗ trợ khôi phục lịch tập gốc của một ngày bằng cách chép ngược danh sách từ `metadata.originalExercises` vào `customExercises`.

---

## 👥 14. Phân Hệ Cộng Đồng & Tương Tác Xã Hội (Community Engine) - *Mới Thêm*
- **Quản Lý Bài Đăng (`CommunityPost`)**: Hỗ trợ đăng bài kèm tối đa 10 ảnh tải lên Cloudinary thông qua middleware `uploadCloud.array("images", 10)`. Các bài đăng lưu trữ thông tin phân loại (`postType`), trạng thái hiển thị (`visibility`), và liên kết tùy chọn tới một buổi tập luyện thực tế (`relatedWorkoutSessionId`).
- **Tương Tác Chi Tiết Ảnh (`PostMedia`)**: Cho phép bình luận (`PostMediaComment`) và tương tác cảm xúc (`PostMediaReaction`) trên từng hình ảnh riêng lẻ trong loạt ảnh của bài viết.
- **Hệ Thống Phản Hồi Bình Luận**: Hỗ trợ cấu trúc cha-con (`parentCommentId`) để tạo luồng trả lời bình luận nhiều cấp. Các bình luận có thể được thích (`CommentReaction`) hoặc ẩn đi đối với từng user (`CommentUserHidden`).
- **Theo Dõi Người Dùng (`UserFollow`)**: Thiết lập mối quan hệ theo dõi hai chiều (follower/following) thông qua khóa chính tổ hợp `[followerId, followingId]`. Bộ lọc tìm kiếm người dùng tự động loại trừ khả năng người dùng theo dõi chính mình.

---

## 🛒 15. Phân Hệ Cửa Hàng & Giỏ Hàng (Digital Store & Cart Engine) - *Mới Thêm*
- **Danh Mục & Sản Phẩm Số (`Product`, `ProductCategory`, `ProductAsset`)**: Phục vụ phân phối sản phẩm số như Ebook PDF, Video khóa học, hoặc giáo án. Các tệp tài nguyên thực tế (`ProductAsset`) được kiểm soát quyền truy cập chặt chẽ thông qua các quy tắc cấu hình (`accessRule`).
- **Quản Lý Giỏ Hàng (`Cart`, `CartItem`)**:
  - Tự động tìm hoặc tạo mới giỏ hàng ở trạng thái kích hoạt `active` cho người dùng qua hàm `getOrCreateActiveCart(userId)`.
  - Hỗ trợ thêm sản phẩm, tự động cộng dồn số lượng nếu sản phẩm đã tồn tại, lưu lại đơn giá tại thời điểm thêm sản phẩm để đảm bảo không bị ảnh hưởng nếu sản phẩm thay đổi giá sau này.
  - Hỗ trợ cập nhật số lượng và xóa sản phẩm khỏi giỏ hàng nhanh chóng.
- **Tạo Đơn Hàng & Thanh Toán (`Order`, `OrderItem`, `Payment`)**: Khi người dùng tiến hành thanh toán, hệ thống chốt thông tin giỏ hàng để tạo đơn hàng mới với mã số duy nhất (`orderNumber`), ghi nhận trạng thái thanh toán và lưu vết phản hồi từ cổng thanh toán đối tác (Stripe, VNPay, Momo).

---

## 💾 16. Hệ Thống Tự Động Sao Lưu Cơ Sở Dữ Liệu (MySQL Database Auto-Backup)
Hệ thống tích hợp tiến trình tự động sao lưu định kỳ để bảo đảm an toàn dữ liệu:
- **Tần suất**: Thiết lập chạy định kỳ mỗi 7 ngày một lần vào lúc 3:00 AM sáng Chủ nhật hàng tuần.
- **Cơ chế sao lưu**:
  1. Sử dụng tiện ích `mysqldump` để tạo file kết xuất CSDL MySQL `.sql` lưu trữ tạm thời tại thư mục cục bộ backend (`./src/storage/DBBackup/`).
  2. Định dạng tên file tự động theo mốc thời gian: `MyGymProject_YYYYMMDD_HHmmss.sql`.
  3. Sử dụng công cụ `rclone` để đẩy trực tiếp file backup lên thư mục lưu trữ chuyên biệt `DBLoongMilkGym` trên Google Drive thông qua cấu hình kết nối đám mây an toàn.

