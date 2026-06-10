# NGUYÊN LÝ HOẠT ĐỘNG PHÂN HỆ BACKEND LOONGGYM

Tài liệu này trình bày chi tiết nguyên lý hoạt động của tầng máy chủ Backend, các lớp kiến trúc xử lý và các cơ chế xử lý cốt lõi.

---

## 🛡️ 1. Lớp Kiểm Tra Ràng Buộc Dữ Liệu Rất Chặt Chẽ (Validation Layer)
Nằm tại **`src/validations/user.validation.js`**, lớp này hoạt động như một "khiên bảo vệ" ngăn chặn hoàn toàn dữ liệu ảo và dữ liệu sai lệch trước khi chạm vào cơ sở dữ liệu.

### Ràng Buộc Zod Tối Tân:
*   **Số điện thoại (`phone`)**: Sử dụng Biểu thức chính quy (Regex) tối ưu cho mạng viễn thông Việt Nam: `/^(0|84)(3|5|7|8|9)[0-9]{8}$/`. Chấp nhận cả định dạng quốc tế bắt đầu bằng `84` hoặc số điện thoại trong nước bắt đầu bằng `0`.
*   **Ngày sinh (`birthDate`)**: Tích hợp phương thức `.refine()` so sánh ngày nhập với thời gian thực tế hiện tại `new Date()`. Đảm bảo ngày sinh **không bao giờ ở tương lai**.
*   **Mục tiêu Calo (`calorieGoal`)**: Bắt buộc nằm trong phạm vi từ `500` đến `10,000` kcal/ngày để duy trì tính chân thực khoa học thể chất.
*   **Chặn dữ liệu ảo dựa trên đơn vị (Super Refine)**:
    Tự động bắt cặp đơn vị đo lường và khoảng giá trị nhập để đưa ra thông báo cực kỳ chính xác:
    *   **Chiều cao**:
        *   Đơn vị `cm`: Giới hạn từ `50` đến `250` cm.
        *   Đơn vị `inch`: Giới hạn từ `20` đến `100` inch.
        *   Đơn vị `ft`: Giới hạn từ `1.5` đến `8.5` feet.
    *   **Cân nặng**:
        *   Đơn vị `kg`: Giới hạn từ `20` đến `400` kg.
        *   Đơn vị `lb`: Giới hạn từ `40` đến `900` lb.
        *   Đơn vị `st`: Giới hạn từ `3` đến `60` stone.

---

## 🧪 2. Lớp Tiện Ích Quy Đổi Đơn Vị Đo Lường (`src/utils/unitConverter.js`)
Để cơ sở dữ liệu luôn nhất quán, Backend áp dụng nguyên lý **"Chuẩn hóa dữ liệu lưu trữ, linh hoạt dữ liệu hiển thị"**:
*   Toàn bộ chiều cao lưu xuống MySQL bắt buộc quy đổi về **Centimeters (cm)**.
*   Toàn bộ cân nặng lưu xuống MySQL bắt buộc quy đổi về **Kilograms (kg)**.

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
1.  Truy vấn cơ sở dữ liệu để lấy thông tin hồ sơ `UserProfile` liên kết kèm thông tin cơ bản của `User` (email, role, status).
2.  Nếu tìm thấy, lấy đơn vị người dùng đang thiết lập (`heightUnit`, `weightUnit`).
3.  Gọi hàm tiện ích `convertFromStandard` để quy đổi chỉ số `heightCm`, `weightKg` thô trong DB sang đơn vị hiển thị tương ứng của người dùng.
4.  Gán kết quả quy đổi vào 2 trường động `displayHeight`, `displayWeight` trả về cho Frontend. Điều này giúp Frontend luôn có dữ liệu chính xác để điền vào form mà không cần tự tính toán.

### Hàm `updateProfile(userId, data)`:
1.  Trích xuất dữ liệu thô gửi lên gồm cả Calo, Cân nặng, Chiều cao, Đơn vị đo.
2.  Kiểm tra sự tồn tại của hồ sơ cá nhân hiện tại trong DB.
3.  Tính toán giá trị quy đổi chuẩn hóa:
    *   Quy đổi Chiều cao thô sang CM (qua `convertToCm`).
    *   Quy đổi Cân nặng thô sang KG (qua `convertToKg`).
4.  Thực hiện câu lệnh cập nhật thông tin qua `prisma.userProfile.update` bao gồm cả việc ép kiểu trường Calo `calorieGoal` thành số thực `Number` hoặc `null` nếu để trống.

---

## 📁 4. Lớp Controller (`src/controllers/users.controller.js`)
Được viết dưới dạng lớp tiếp nhận nghiệp vụ số nhiều (`users.controller.js` thay thế hoàn toàn cho `user.controllers.js` cũ):
*   Tách biệt hoàn toàn phần xử lý logic HTTP khỏi nghiệp vụ.
*   Nhận `userId` từ token đã được giải mã nằm trong `req.user.id`.
*   Nhận dữ liệu đã qua kiểm định sạch sẽ ở tầng Zod nằm trong `req.validated.body`.
*   Chuyển tiếp đến `usersService` và phản hồi kết quả đẹp đẽ về client thông qua hàm mở rộng dùng chung `res.success()`.

---

## 🚨 5. Tầng Bảo Mật Xử Lý Lỗi Hệ Thống (`src/middlewares/exceptionHandler.js`)
Lớp Middleware này đóng vai trò tối quan trọng trong việc bảo mật cơ sở dữ liệu:
*   Chặn toàn bộ các lỗi liên kết thô từ cơ sở dữ liệu phát sinh từ Prisma (lỗi khóa ngoại, lỗi kết nối cơ sở dữ liệu SQL, lỗi cú pháp truy vấn).
*   Thay vì trả về lỗi kỹ thuật có chứa tên bảng, tên cột nhạy cảm dễ bị hacker khai thác, `exceptionHandler` sẽ tự động chuyển hóa thành các thông điệp cảnh báo thân thiện tiếng Việt (ví dụ: *"Đã xảy ra lỗi kết nối hệ thống. Vui lòng thử lại sau ít phút"*).

---

## 🏋️ 6. Phân Hệ Thư Viện Bài Tập & Đồng Bộ Cloudinary
Để thiết lập thư viện bài tập nền tảng cho ứng dụng, hệ thống đã thực hiện quy trình nạp dữ liệu mẫu (Seeding) chuyên nghiệp:
*   **Dữ liệu nạp**: 12 Nhóm cơ (Muscle Groups), 5 Thiết bị tập (Equipment), và 21 Bài tập (Exercises) chuẩn thể hình kèm chi tiết các bước thực hiện, lỗi sai thường gặp, thẻ phân loại và mức độ khó.
*   **Quy trình đồng bộ ảnh**:
    1. Ảnh thumbnail của các bài tập ban đầu được trích xuất từ dữ liệu mở `free-exercise-db`.
    2. Một tiến trình chạy tự động tải các ảnh này về thư mục tạm `public/temp_thumbnails` tại backend.
    3. Ảnh được đẩy trực tiếp lên Cloudinary lưu trữ tập trung tại thư mục `LoongMilkGym_APP/exercises` với tên file (`public_id`) khớp chính xác theo **slug** của bài tập để tối ưu hóa tìm kiếm.
    4. Toàn bộ ảnh tạm và thư mục tạm tại backend được giải phóng sạch sẽ ngay khi tải lên thành công.
    5. Cập nhật các liên kết Cloudinary `secure_url` này làm dữ liệu gốc để nạp vào DB MySQL qua Prisma Client.

---

## 🖼️ 7. Cơ Chế Tự Động Xóa Avatar Cũ Trên Cloudinary
Khi người dùng tải lên ảnh đại diện mới, để tránh lãng phí dung lượng lưu trữ trên Cloudinary (tránh tích tụ các file ảnh rác của các lần đổi avatar trước đó), hệ thống áp dụng cơ chế tự động dọn dẹp:
*   **Truy vấn lịch sử**: Trước khi ghi đè đường dẫn ảnh mới, hàm `uploadAvatar` trong `users.service.js` sẽ truy vấn cơ sở dữ liệu để lấy `avatarUrl` hiện tại của người dùng.
*   **Trích xuất Public ID**: Hàm tiện ích `getPublicIdFromUrl` phân tách URL của Cloudinary để lấy ra `public_id` chính xác của ảnh cũ (ví dụ: `LoongMilkGym_APP/avatar_user1`).
*   **Xóa ảnh vật lý**: Gọi API `cloudinary.uploader.destroy(oldPublicId)` để xóa vĩnh viễn tệp tin cũ trên đám mây Cloudinary.
*   **Xử lý ngoại lệ an toàn (Fault Tolerance)**: Lệnh xóa được bọc trong khối `try...catch` riêng biệt. Nếu có lỗi phát sinh từ phía Cloudinary (ví dụ: ảnh cũ đã bị xóa trước đó hoặc sai cấu hình), hệ thống sẽ ghi nhận lỗi ra log nhưng không chặn đứng luồng nghiệp vụ. Người dùng vẫn cập nhật được avatar mới thành công mà không gặp bất kỳ lỗi gián đoạn nào.

---

## 💾 8. Hệ Thống Quản Lý Phiên Đăng Nhập & Bảo Mật Refresh Token (SHA-256)
Để ngăn chặn các cuộc tấn công chiếm đoạt tài khoản thông qua rò rỉ cơ sở dữ liệu, phân hệ xác thực đã được tăng cường bảo mật sâu sắc:
*   **Băm bảo mật SHA-256 một chiều**:
    - Khi người dùng đăng nhập thành công, hệ thống tạo ra một Refresh Token ngẫu nhiên (dạng UUID/chuỗi ngẫu nhiên dài).
    - Client nhận Refresh Token dạng thuần để lưu trữ Cookie/Local Storage bảo mật. Tuy nhiên, trước khi ghi dữ liệu xuống bảng `refresh_tokens` trong MySQL, Backend sẽ thực hiện băm một chiều Refresh Token đó bằng thuật toán **SHA-256**.
    - Khi client gửi Refresh Token để xin Access Token mới, backend sẽ băm token nhận được và so sánh với giá trị băm trong DB. Bằng cách này, ngay cả khi cơ sở dữ liệu bị lộ, kẻ tấn công cũng không thể sử dụng dữ liệu trong bảng để giả mạo token đăng nhập của người dùng.
*   **Quản lý phiên dựa trên Session ID**:
    - Mỗi lần đăng nhập tạo ra một mã định danh phiên duy nhất (`session_id` dạng UUID).
    - `session_id` được đính kèm vào thông tin Refresh Token, cho phép hệ thống phân biệt chính xác phiên hoạt động trên từng thiết bị (Ví dụ: Web Chrome, Mobile App, Safari Tablet).
    - Người dùng có thể xem danh sách thiết bị đang hoạt động và thực hiện đăng xuất từ xa bằng cách xóa bản ghi Refresh Token tương ứng với `session_id` đó.
*   **Thu hồi Access Token chủ động (Token Blacklist / Revocation)**:
    - Khi người dùng chọn Đăng xuất, Access Token hiện tại (vẫn còn hạn) sẽ bị đưa vào bảng `revoked_tokens` (Danh sách đen token) kèm theo thời gian hết hạn ban đầu của nó.
    - Mọi request tiếp theo sử dụng Access Token nằm trong blacklist sẽ bị middleware `authRequire.js` chặn đứng ngay lập tức với lỗi `401 Unauthorized`.
    - Một scheduler chạy tự động định kỳ (`cleanupExpiredTokens.js`) quét dọn sạch các token đã hết hạn thực tế trong bảng blacklist để giải phóng dung lượng DB.

---

## 🍎 9. Phân Hệ Dinh Dưỡng & Thực Đơn Ở Backend (Nutrition API & Food Engine)
Hệ thống quản lý Calo và Thực phẩm ở Backend được xây dựng thông suốt qua các lớp kiến trúc để phục vụ việc tính toán năng lượng nạp:
*   **Thiết kế Schema Cơ sở dữ liệu**:
    -   `NutritionTarget`: Quản lý mục tiêu dinh dưỡng hàng ngày của từng người dùng (`userId`), bao gồm lượng Calo (`caloriesTarget`), các nhóm chất đạm/tinh bột/chất béo (`proteinGTarget`, `carbsGTarget`, `fatGTarget`), chất xơ (`fiberGTarget`) và lượng nước uống (`waterMlTarget`). Sử dụng khóa chính phức hợp `userId_targetDate` để đảm bảo mỗi ngày một người dùng chỉ có duy nhất một bộ mục tiêu.
    -   `FoodItem`: Lưu trữ thông tin thực phẩm mẫu, hỗ trợ tìm kiếm theo tên, nhãn hiệu (`brand`), kích thước định lượng (`servingSizeG`), các chỉ số dinh dưỡng cho mỗi serving size, và trường `metadata` dạng JSON để lưu trữ linh hoạt mã vạch sản phẩm (`barcode`) cùng hình ảnh minh họa (`imageUrl`).
    -   `MealLog`: Lưu vết nhật ký ăn uống theo ngày và phân loại bữa ăn (Sáng, Trưa, Tối, Nhỏ...).
    -   `MealLogItem`: Lưu chi tiết các món ăn đã nạp trong một `MealLog`, ghi nhận khối lượng thực phẩm nạp thực tế (`quantityG`) và tự động tính toán quy đổi lượng Calo/chất nạm thực chất tương ứng.
*   **Kiểm Tra Ràng Buộc Dữ Liệu Chặt Chẽ (`nutrition.validation.js`)**:
    -   Tất cả tham số `mealLogId` hoặc `itemId` đều được xác thực định dạng UUID nghiêm ngặt.
    -   Các trường chỉ số nạp hoặc chỉ số mục tiêu đều được giới hạn khoảng an toàn thông qua thư viện Zod: Calo từ 1 đến 10,000; các chỉ số chất đạm/bột/béo/chất xơ từ 0 đến 1,000g; nước uống từ 1 đến 10,000 ml.
*   **Thuật Toán Chuẩn Hóa Ngày Tháng Theo Múi Giờ**:
    -   Để giải quyết triệt để lỗi chênh lệch múi giờ cục bộ giữa Client và Server (làm lệch ngày ghi nhận ăn uống sang hôm trước hoặc hôm sau), backend định nghĩa hàm helper `normalizeDate`.
    -   Hàm này phân tích chuỗi ngày gửi lên và đưa về mốc 0 giờ UTC của ngày đó (`Date.UTC(year, month, date)`), giữ cho mọi hoạt động lưu và truy vấn dữ liệu đồng nhất.
*   **Cơ Chế Quy Đổi Dinh Dưỡng Tự Động**:
    -   Khi người dùng thêm món ăn từ thư viện qua `addMealLogItem`, API tiếp nhận `foodItemId` và khối lượng thực tế `quantityG`.
    -   Dịch vụ truy vấn thông tin gốc của `FoodItem`, tính toán tỷ lệ `factor = quantityG / servingSizeG`.
    -   Tự động tính và làm tròn các chỉ số năng lượng (`factor * calories`, `factor * proteinG`, v.v.) trước khi ghi bản ghi vào bảng `MealLogItem`.
*   **Tìm Kiếm Thực Phẩm Kết Hợp (Local & Open Food Facts Global API)**:
    -   Khi tìm kiếm món ăn bằng từ khóa hoặc quét mã vạch qua API `searchFoods` và `getFoodByBarcode`:
    -   **Bước 1 (Local Search)**: Backend tìm kiếm trong bảng `FoodItem` các sản phẩm nội bộ hoặc đã cache để trả về nhanh nhất.
    -   **Bước 2 (Global Lookup)**: Nếu không tìm thấy cục bộ hoặc cần mở rộng kết quả, backend sẽ gọi API Open Food Facts toàn cầu (được cấu hình thời gian chờ `fetchWithTimeout` tối đa 2.5 giây để tránh treo request).
    -   **Bước 3 (Auto Caching)**: Các món ăn mới tìm thấy từ API toàn cầu sẽ được tự động lưu (cache) vào cơ sở dữ liệu MySQL dưới dạng một bản ghi `FoodItem` mới kèm metadata mã vạch, giúp các lượt tìm kiếm tiếp theo của toàn bộ hệ thống diễn ra tức thời.

---

## 📅 10. Phân Hệ Kế Hoạch Tập Luyện Cá Nhân Hóa (User Training Plans Engine)
Phân hệ này chịu trách nhiệm khởi tạo, cấu hình và quản lý lộ trình tập luyện 30 ngày cho từng hội viên:
*   **Bảng Cơ Sở Dữ Liệu Tương Tác**:
    -   `UserTrainingPlan`: Lưu thông tin kế hoạch đang kích hoạt (active), liên kết với giáo án mẫu (`WorkoutProgram`) hoặc thiết lập chế độ tập tự do cá nhân hóa.
    -   `UserTrainingPlanDay`: Lưu thông tin chi tiết của từng ngày trong 30 ngày kế hoạch. Mỗi ngày lưu trạng thái (`pending`, `completed`), ghi chú và danh sách bài tập tùy biến (`customExercises`) trong trường `metadata`.
*   **Khởi Tạo Giáo Án Giao Dịch An Toàn (`startProgramPlan` / `startCustomPlan`)**:
    -   Khi người dùng chọn một giáo án mặc định hoặc tự thiết lập lịch tập cá nhân, hệ thống thực hiện khởi tạo toàn bộ lộ trình 30 ngày trong khối giao dịch an toàn `prisma.$transaction`. Nếu có bất kỳ lỗi nào xảy ra khi chèn dữ liệu hàng loạt, hệ thống tự động rollback để tránh tình trạng lộ trình bị khuyết ngày.
*   **Đề Xuất Bài Tập Thông Minh Theo Nhóm Cơ**:
    -   Để hỗ trợ tính năng chọn bài tập thay thế (Swap Exercise), backend phân tích từ khóa nhóm cơ (`focusArea` / `focusKeywords`).
    -   Khi người dùng muốn thay thế bài tập, backend gợi ý các bài tập trong thư viện có cùng nhóm cơ đích (`exerciseMatchesFocus`) giúp người dùng duy trì đúng mục tiêu huấn luyện ban đầu.
*   **Hoán Đổi Ngày Tập (Swap Days Date)**:
    -   Hỗ trợ chuyển đổi ngày tập linh hoạt (ví dụ: đổi ngày tập ngực hôm nay sang ngày mai và ngược lại) bằng cách hoán đổi giá trị trường ngày lên lịch `scheduledDate` trong một transaction an toàn.

---

## ⚡ 11. Phân Hệ Theo Dõi Buổi Tập Thực Tế (Workout Sessions & Set Tracker)
Đây là động cơ ghi nhận thời gian thực quá trình luyện tập của người dùng:
*   **Bảng Cơ Sơ Dữ Liệu Tương Tác**:
    -   `WorkoutSession`: Buổi tập thực tế (trạng thái `in_progress` hoặc `completed`), ghi nhận thời gian bắt đầu, kết thúc, tổng số giây tập luyện và nỗ lực cảm nhận (`perceivedEffort` từ 1 đến 10).
    -   `WorkoutSessionExercise`: Các bài tập được đưa vào thực hiện trong buổi tập hiện tại.
    -   `WorkoutSet`: Các hiệp tập thực tế của bài tập, ghi nhận số lần lặp (reps), cân nặng (weightKg), thời gian giữ hoặc cự ly di chuyển, chỉ số nỗ lực RPE và trạng thái hoàn thành (`isCompleted`).
*   **Thuật Toán Tính Calo Tiêu Thụ Tự Động**:
    -   Khi hoàn thành buổi tập (`completeSession`), hệ thống tự động tính toán năng lượng tiêu hao dựa trên công thức chuyển hóa sinh học (METs):
        $$\text{Calories Burned} = \text{MET} \times 3.5 \times \frac{\text{Weight (kg)}}{200} \times \text{Duration (minutes)}$$
        *(với mức MET mặc định cho tập kháng lực là 6.0).*
    -   Calo tiêu thụ được tính toán và cộng dồn ngay lập tức vào hồ sơ cá nhân của người dùng (`UserProfile.totalCaloriesBurned`) đồng thời tăng tổng số ngày tập (`totalWorkoutDays`) lên 1 đơn vị.

---

## 📊 12. Dịch Vụ Tích Hợp Số Liệu Dashboard (Dashboard Summary Aggregator)
Hàm dịch vụ `getDashboardSummary` tại backend đóng vai trò tổng hợp nhanh tất cả các khía cạnh luyện tập và dinh dưỡng để hiển thị tức thời khi người dùng truy cập trang chủ:
*   **Tích hợp đa nguồn**:
    -   Đọc dữ liệu hồ sơ hội viên để lấy cấp độ thể chất, mục tiêu và avatar.
    -   Liên kết gọi trực tiếp dịch vụ `NutritionService` để lấy tổng lượng Calo, Carb, Fat, Protein thực tế người dùng đã nạp trong ngày hôm nay so với mục tiêu ngày đã cài đặt.
    -   Tổng hợp số lượng buổi tập đã hoàn thành trong tuần, chuỗi ngày tập liên tục (streak) và trả về danh sách hành động nhanh được cá nhân hóa.



