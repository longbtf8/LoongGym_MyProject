# NGUYÊN LÝ HOẠT ĐỘNG PHÂN HỆ FRONTEND LOONGGYM

Tài liệu này trình bày chi tiết nguyên lý hoạt động của tầng giao diện người dùng Frontend, các thành phần giao diện cao cấp và giải pháp mô-đun hóa tối ưu.

---

## 🎨 1. Giải Pháp Mô-đun Hóa Thành Phần Hồ Sơ Cá Nhân (`PersonalInfoSection/`)
Để loại bỏ sự cồng kềnh từ component đơn bản cũ, Frontend đã áp dụng phương pháp **"Chia Để Trị"** (Component Modularization), phân rã toàn bộ logic giao diện thành 5 file chuyên biệt nằm trong thư mục `PersonalInfoSection/`:

```
PersonalInfoSection/
├── index.jsx                # Nhạc trưởng điều phối (Orchestrator)
├── constants.js             # Hằng số cấu hình dữ liệu và hàm Việt hóa nhãn
├── AvatarCard.jsx           # Component con hiển thị Avatar, Badges và Bio
├── StatsGrid.jsx            # Component con hiển thị 3 chỉ số và Chọn đơn vị
└── ProfileDetailsList.jsx   # Component con hiển thị danh sách trường hồ sơ
```

### Chi Tiết Nguyên Lý Hoạt Động Từng Mô-đun:

#### A. Nhạc trưởng điều phối (`index.jsx`):
*   Đóng vai trò tiếp nhận dữ liệu từ Custom Hook `useProfileForm`.
*   Truyền phân phát dữ liệu (props) tương ứng xuống cho 3 component con.
*   Hiển thị thông báo cảnh báo lỗi Validate API ở vị trí cao nhất nếu người dùng cố ý vượt rào nhập dữ liệu ảo bị Zod chặn.

#### B. Component hiển thị Avatar & Badges (`AvatarCard.jsx`):
*   **Hiển thị Avatar**: Tự động nhận URL ảnh đại diện từ database, nếu bị lỗi hoặc chưa thiết lập sẽ tự động vẽ Avatar hình tròn có chữ cái đầu tiên của email/tên người dùng trên nền màu xanh Neon rất nổi bật.
*   **Nút Camera Neon**: Xuất hiện mượt mà đè lên ảnh đại diện khi `isEditing = true` kèm hiệu ứng nảy nhẹ (`animate-bounce`) để kích thích người dùng tải ảnh lên.
*   **Hạng thành viên (Membership Tier)**: Tự động đổi màu Gradient rực rỡ (Vàng kim / Hổ phách cho các tài khoản VIP, xanh neon nhã nhặn cho tài khoản thường Standard).
*   **Trình độ thể chất**: Áp dụng dải màu phát sáng (Cyan, Emerald, Teal, Indigo, Rose) dựa trên mức độ tập luyện thực tế của người dùng. Tránh sử dụng từ "Ít vận động" gây ngại cho khách hàng, thay vào đó hiển thị nhãn thân thiện khuyến khích: **"Người mới"**.

#### C. Component hiển thị 3 chỉ số đo lường (`StatsGrid.jsx`):
*   Hiển thị 3 chỉ số: **Cân nặng**, **Chiều cao**, và **Mục tiêu Calo**.
*   **Giao diện xem thường**: Chỉ hiển thị số và đơn vị đo tương ứng lấy từ cơ sở dữ liệu (`kg`, `lb`, `st` cho cân nặng và `cm`, `in`, `ft` cho chiều cao).
*   **Giao diện chỉnh sửa (`isEditing = true`)**:
    *   Tự động xuất hiện bộ đôi điều khiển: Ô nhập số (`input type="number"`) và Ô lựa chọn đơn vị đo (`select` dropdown) nằm liền kề nhau cực kỳ thời thượng.
    *   Giúp người dùng chọn hệ đo lường bất kỳ, tự động cập nhật giá trị số tương ứng để gửi về lưu chuẩn hóa ở Backend.

#### D. Component danh sách thông tin chi tiết (`ProfileDetailsList.jsx`):
*   Tự động duyệt qua danh sách các thuộc tính thông tin cá nhân.
*   Khi ở chế độ xem: Ẩn toàn bộ nút bấm chỉnh sửa nhỏ lẻ ở từng dòng (bỏ cơ chế chỉnh sửa vụn vặt gây rối giao diện) để tạo cảm giác **tinh giản, sạch sẽ và cao cấp tối đa**. Người dùng sẽ chỉ thực hiện chỉnh sửa thông qua nút bấm duy nhất trên Header của trang Hồ Sơ.
*   Khi ở chế độ sửa: Tự động chuyển đổi các dòng thành dạng Input văn bản hoặc Select tùy chọn tương ứng.
*   **Chống ngày sinh tương lai**: Đối với trường `birthDate` dạng lịch chọn ngày (`type="date"`), component tự động gán thuộc tính `max={new Date().toISOString().split("T")[0]}` để vô hiệu hóa và làm mờ hoàn toàn các ngày ở tương lai, ngăn chặn triệt để dữ liệu sai ngay tại trình duyệt.

---

## ⚡ 2. Quản Lý Form Tập Trung Bằng Custom Hook (`useProfileForm.js`)
Toàn bộ logic trạng thái form, quản lý biến tạm, hủy sửa đổi, đồng bộ hóa và gọi API đột biến (Mutation) được tách riêng hoàn toàn khỏi giao diện React và tập trung trong **`hooks/useProfileForm.js`**:
*   **Khởi tạo State**: Quản lý đầy đủ thông tin hồ sơ kèm đơn vị đo (`weightUnit`, `heightUnit`) và mục tiêu năng lượng Calo (`calorieGoal`).
*   **Đồng bộ tự động**: Sử dụng `useEffect` lắng nghe biến `userInfo` toàn cục của hệ thống xác thực. Khi người dùng tải lại trang hoặc đăng nhập thành công, form tự động đồng bộ hóa thông tin sạch sẽ.
*   **Xử lý Hủy bỏ (`handleCancel`)**: Khi người dùng nhấn nút Hủy, hệ thống tự động reset lại toàn bộ các trường nhập liệu về nguyên trạng ban đầu trong DB và tắt chế độ chỉnh sửa.
*   **Xử lý lưu trữ & Bắt lỗi API**: Khi lưu thông tin, hook gọi phương thức đột biến RTK Query để gửi payload về server. Nếu phát hiện lỗi (ví dụ: Zod Validation báo lỗi chiều cao/cân nặng quá lớn), hook sử dụng tiện ích **`errorParser.js`** để bóc tách thông báo lỗi tiếng Việt sạch sẽ và đưa vào state `errorMessage` hiển thị cảnh báo lộng lẫy lên giao diện.

---

## 🚀 3. Tải Trang Dynamic Lazy-Loading & LoadingScreen Neon
Để tối ưu hóa hiệu suất tải trang và tăng trải nghiệm premium cho ứng dụng:
*   Hệ thống áp dụng cơ chế **Lazy-Loading** (Tải lười động) thông qua React Suspense để phân đoạn nhỏ dung lượng mã nguồn tải ban đầu.
*   Khi ứng dụng đang tải các tệp tin chunk từ máy chủ, một màn hình chờ cao cấp **LoadingScreen** sẽ xuất hiện ở lớp phủ trên cùng (`z-[9999]`):
    *   **Vòng xoay Neon**: Tích hợp một vòng tròn chuyển động ngoài xoay theo chiều kim đồng hồ với dải màu Gradient (primary neon to cyan), kết hợp một vòng tròn nhỏ trong quay ngược chiều kim đồng hồ (`animate-spin-reverse`) tạo hiệu ứng động học chiều sâu 3D cực mạnh.
    *   **Thương hiệu LoongMilkGym lấp lánh**: Chữ thương hiệu viết liền nhau nhưng được tô màu 3 khối rực rỡ riêng biệt: `<span className="text-primary">Loong</span><span className="text-[var(--text-color)]">Milk</span><span className="text-[#00f5d4]">Gym</span>`.

---

## 📱 4. Thanh Điều Hướng Dưới Cùng Cho Mobile (Contiguous Mobile Bottom Nav)
Để tối ưu không gian hiển thị và tạo cảm giác liền mạch nguyên khối giống ứng dụng di động gốc (Native App):
*   **Cấu trúc Lưới Dính Liền (Contiguous Grid)**:
    - Áp dụng hệ thống lưới 5 cột dính liền (`grid grid-cols-5 gap-0 w-full px-1`), chia đều không gian cho 5 chức năng chính: Trang chủ, Thư viện, Quét QR, Bài đăng, và Tài khoản.
    - Loại bỏ hoàn toàn đường viền và màu nền mặc định khi không kích hoạt (`bg-transparent border-0`) để giữ giao diện tối giản, thoáng mắt.
*   **Hiển Thị Trạng Thái Active Dạng Viên Nhộng (Capsule-only Highlight)**:
    - Khi một trang được kích hoạt, nút tương ứng sẽ tự động hiển thị nền xanh chuối thương hiệu (`bg-primary`), chữ đen tương phản cao (`text-black font-extrabold`), và bo góc tròn trịa trọn vẹn (`rounded-xl shadow-md`).
    - Lồng ghép hiệu ứng chuyển màu mượt mà (`transition-colors duration-200`) giúp loại bỏ hiện tượng giật cục màu sắc hay nháy đường viền khi thay đổi giữa các trang.
*   **Chống Che Khuất Nội Dung Cuối Trang**:
    - Nhằm khắc phục việc thanh Bottom Nav dạng cố định (`fixed bottom-0`) che mất nội dung cuối của các trang, phần chân trang `Footer` đã được nâng khoảng đệm dưới lên `pb-28` khi ở chế độ mobile, giúp người dùng cuộn xem được trọn vẹn thông tin bản quyền và mạng xã hội.

---

## 🛡️ 5. Cơ Chế Chống Chớp Nháy (Flicker Prevention) Khi Hover
Khi người dùng di chuột nhanh qua các vùng nhạy cảm, giao diện rất dễ xảy ra lỗi giật lắc hoặc đóng mở liên tục (flickering). Hệ thống giải quyết triệt để lỗi này bằng hai giải pháp:
*   **Cầu Nối Hover Vô Hình (Hover-Bridge Pseudo-elements)**:
    - Đối với Tooltip của ảnh đại diện tài khoản (Avatar) và nút thay đổi chế độ sáng/tối (Theme Toggle) ở Header, hệ thống chèn một phần tử đệm vô hình bằng CSS: `before:absolute before:content-[''] before:w-full before:h-4 before:-bottom-4 before:left-0`.
    - Phần tử này đóng vai trò như một chiếc cầu nối liên kết, giữ trạng thái tương tác chuột luôn liên tục khi người dùng di con trỏ từ nút bấm xuống bảng menu bên dưới, triệt tiêu hoàn toàn lỗi chớp tắt.
*   **Lớp Hover Tĩnh Cho Card (`ExerciseCard.jsx`)**:
    - Trong thư viện bài tập, hiệu ứng tịnh tiến dịch chuyển lên trên (`-translate-y-1`) khi hover vào card có thể làm mất tiêu điểm chuột nếu áp dụng trực tiếp lên thẻ chuyển động.
    - Giải pháp là bọc toàn bộ thẻ bên trong một container cha có kích thước tĩnh (`group h-full pb-1`) và đặt trạng thái kích hoạt chuyển động dựa trên container cha (`group-hover:-translate-y-1 group-hover:shadow-lg`). Mẹo thiết kế này giúp con trỏ chuột không bao giờ bị trượt ra ngoài vùng bắt sự kiện của card.

---

## 📊 6. Khóa Chiều Cao Ổn Định Layout (Layout Shift Prevention)
Khi chuyển đổi trang trong thư viện bài tập hoặc thay đổi bộ lọc tìm kiếm, số lượng bài tập hiển thị có thể thay đổi từ tối đa 8 bài xuống 0 bài (hoặc 1-2 bài ở trang cuối), gây ra hiện tượng dịch chuyển đột ngột (Layout Shift) kéo giật Footer và phân trang lên trên.
*   **Quy định Chiều cao Tối thiểu linh hoạt theo Thiết bị**:
    - **Điện thoại di động (Mobile)**: Áp dụng `min-h-[850px]` (Đảm bảo khung chứa đủ 4 hàng bài tập, mỗi hàng 2 cột).
    - **Máy tính bảng (Tablet)**: Áp dụng `min-h-[1300px]` (Tương thích với kích thước hiển thị lớn hơn).
    - **Máy tính để bàn (Desktop - `lg:`)**: Áp dụng `min-h-[1100px]` (Đảm bảo khung chứa đủ 3 hàng bài tập, mỗi hàng 3 cột).
*   **Hiệu quả**: Khi đổi trang hoặc đổi bộ lọc, thanh phân trang (`Pagination`) và `Footer` luôn được cố định ở một vị trí thẳng hàng dưới chân màn hình, tạo nên trải nghiệm cực kỳ êm mắt và chuyên nghiệp.

