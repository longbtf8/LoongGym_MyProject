# NGUYÊN LÝ HOẠT ĐỘNG PHÂN HỆ FRONTEND LOONGGYM

Tài liệu này trình bày chi tiết nguyên lý hoạt động của tầng giao diện người dùng Frontend, các thành phần giao diện cao cấp và giải pháp mô-đun hóa tối ưu.

---

## 🎨 1. Giải Pháp Mô-đun Hóa Thành Phần Hồ Sơ Cá Nhân (`PersonalInfoSection/`)
Để loại bỏ sự cồng kềnh từ component đơn bản cũ, Frontend đã áp dụng phương pháp **"Chia Để Trị"** (Component Modularization), phân rã toàn bộ logic giao diện thành các file chuyên biệt nằm trong thư mục `PersonalInfoSection/`:

- **`index.jsx`**: Nhạc trưởng điều phối (Orchestrator), tiếp nhận dữ liệu từ Custom Hook `useProfileForm` và phân phát (props) xuống các component con.
- **`constants.js`**: Hằng số cấu hình dữ liệu và hàm Việt hóa các nhãn hiển thị.
- **`AvatarCard.jsx`**: Hiển thị ảnh đại diện (avatar), nhãn phân cấp VIP/Standard rực rỡ và cấp độ thể chất (ví dụ: đổi nhãn "Ít vận động" thành "Người mới" để khuyến khích tinh thần hội viên).
- **`StatsGrid.jsx`**: Hiển thị 3 chỉ số chính (Cân nặng, Chiều cao, và Mục tiêu Calo). Khi ở chế độ sửa (`isEditing = true`), hiển thị cặp đôi ô nhập số và select đơn vị đo đo liền kề rất thời thượng.
- **`ProfileDetailsList.jsx`**: Duyệt hiển thị thông tin chi tiết. Khi chỉnh sửa, tự động chuyển đổi thành input hoặc select, giới hạn ngày sinh tối đa `max` là ngày hôm nay để chặn nhập ngày tương lai.

---

## ⚡ 2. Quản Lý Form Tập Trung Bằng Custom Hook (`useProfileForm.js`)
Toàn bộ logic trạng thái form, quản lý biến tạm, hủy sửa đổi, đồng bộ hóa và gọi API đột biến (Mutation) được tách riêng hoàn toàn khỏi giao diện React và tập trung trong **`hooks/useProfileForm.js`**:
- **Đồng bộ tự động**: Sử dụng `useEffect` lắng nghe biến `userInfo` toàn cục của hệ thống xác thực để tự động điền thông tin khi tải trang.
- **Hủy bỏ sửa đổi**: Khi nhấn nút Hủy, reset toàn bộ trường nhập liệu về nguyên trạng ban đầu trong DB và tắt chế độ chỉnh sửa.
- **Bắt lỗi thông minh**: Gọi API lưu thông tin, nếu có lỗi validate từ Zod (Backend), sử dụng utility **`errorParser.js`** bóc tách thông báo lỗi tiếng Việt sạch sẽ và đưa vào state hiển thị lộng lẫy lên giao diện.

---

## 🚀 3. Tải Trang Dynamic Lazy-Loading & LoadingScreen Neon
- Hệ thống áp dụng cơ chế **Lazy-Loading** (Tải lười động) thông qua React Suspense để phân đoạn nhỏ dung lượng mã nguồn tải ban đầu.
- Khi ứng dụng đang tải các tệp tin chunk từ máy chủ, màn hình chờ cao cấp **LoadingScreen** sẽ xuất hiện ở lớp phủ trên cùng (`z-[9999]`) gồm vòng xoay Neon kép chuyển động ngược chiều nhau tạo hiệu ứng 3D và dòng chữ thương hiệu phát sáng lấp lánh.

---

## 📱 4. Thanh Điều Hướng Mobile & Ngăn Kéo Bottom Sheet Cao Cấp
- **Cấu trúc 4 Tab Chính Cố Định**: Thanh điều hướng phía dưới di động gồm 4 tab truy cập nhiều nhất: Trang chủ, Lộ trình, Thư viện và AI Coach, biểu diễn dưới dạng viên nhộng Neon khi được chọn.
- **Nút "Thêm" gọi Bottom Sheet**: Tab thứ 5 dùng để trượt lên menu Bottom Sheet Glassmorphism mờ ảo (`bg-[var(--bg-secondary)]/95 backdrop-blur-2xl`) bo tròn góc phía trên (`rounded-t-3xl`), kèm thanh kéo Drag Notch.
- **Tối Ưu CSS Nhỏ Gọn Di Động**: Menu ngăn kéo được tinh chỉnh nhỏ gọn (giảm padding, thu nhỏ icon từ `w-10 h-10` về `w-9 h-9`, nhãn label từ `text-[10px]` về `text-[9px]`) để hiển thị cân đối trên màn hình điện thoại.
- **Liên Kết Điều Hướng Chuẩn**:
  - Thẻ thông tin cá nhân trên cùng ngăn kéo dẫn tới `/account/profile` (trang chỉnh sửa thông tin).
  - Nút **"Hồ sơ"** được đổi tên thành **"Trang cá nhân"** và dẫn chính xác tới đường dẫn công khai `/profile/${userInfo?.id}`.
- **Tránh Che Khuất Chân Trang**: Cấu hình phần đệm chân trang `pb-28` để thanh điều hướng không che khuất các phần tử ở Footer.

---

## 🚨 5. Hệ Thống Hộp Thoại Xác Nhận Tùy Biến (Confirm Context) - *Mới Thêm*
Để cải thiện độ premium và loại bỏ hoàn toàn các hộp thoại mặc định thô kệch của trình duyệt:
- **Confirm Provider & Hook (`useConfirm`)**:
  - Gói toàn bộ ứng dụng trong `ConfirmProvider` tại `src/main.jsx`.
  - Cung cấp hàm `confirm({ title, message, confirmText, cancelText, type })` trả về một Promise dạng `Promise<boolean>`.
  - Cho phép gọi xác nhận ở bất kỳ component nào thông qua Custom Hook `const confirm = useConfirm()`.
- **Giao Diện Modal Trực Quan**:
  - Sử dụng React Portals đẩy trực tiếp modal ra ngoài root body của DOM.
  - Hỗ trợ các kiểu thông báo màu sắc chuyên biệt: `danger` (màu đỏ - xóa dữ liệu), `warning` (màu vàng), `info` (màu xanh dương) và `success` (màu xanh lá) đi kèm icon Lucide tương ứng.
  - Hiệu ứng xuất hiện co giãn mượt mà (`reactionsIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)`).

---

## 👥 6. Phân Hệ Cộng Đồng Đã Được Mô-đun Hóa (Community Module) - *Mới Thêm*
Trang cộng đồng `/community` được viết theo triết lý chia nhỏ component để dễ quản lý và bảo trì:
- **`PostCreator.jsx`**: Khung soạn thảo bài viết mới hỗ trợ nhập nội dung và chọn tối đa 10 ảnh đính kèm (cho phép xem trước ảnh và xóa ảnh trước khi tải lên).
- **`PostFeed.jsx`**: Quản lý việc nạp danh sách bài viết từ API RTK Query, hỗ trợ cuộn trang tải thêm (Infinite Scroll) và hiển thị xương cá trống (`FeedLoadingSkeleton`) khi đang tải.
- **`PostCard.jsx`**: Thẻ bài viết hiển thị avatar tác giả, ngày đăng, nội dung, lưới hình ảnh, số lượt bày tỏ cảm xúc và số bình luận. Tích hợp nút ba chấm mở menu hành động ẩn bài viết, lưu bài viết, hoặc xóa bài viết (gọi qua modal Confirm tùy chỉnh).
- **`PostMediaGrid.jsx`**: Tự động tính toán bố cục hiển thị lưới ảnh tùy theo số lượng ảnh (1 ảnh full, 2 ảnh đôi, 3 ảnh chia ô, 4 ảnh trở lên xếp lưới kèm nhãn số lượng ảnh thừa).
- **`CommentsSection.jsx`**: Khung hiển thị bình luận của bài viết hỗ trợ viết bình luận mới, hiển thị câu trả lời lồng nhau và bày tỏ cảm xúc trên bình luận.
- **`MatchingUsers.jsx`**: Lưới gợi ý kết nối tìm kiếm người dùng mới, tự động ẩn nút Follow nếu tài khoản tìm thấy trùng với người dùng hiện tại.

---

## 🛒 7. Phân Hệ Cửa Hàng & Giỏ Hàng (Digital Store & Cart Pages) - *Mới Thêm*
- **Trang Cửa Hàng (`src/pages/store/`)**: Hiển thị lưới các sản phẩm số (Meal Plan, E-book, Training Program) với giao diện Glassmorphism hiện đại, bộ lọc theo danh mục sản phẩm, bộ lọc khoảng giá và nút thêm nhanh vào giỏ hàng kèm hiệu ứng micro-interaction.
  - *Bộ lọc thương hiệu*: Danh sách thương hiệu trong bộ lọc được tính toán động (`availableBrands`) từ thuộc tính `metadata.brand` của các sản phẩm thực tế tải về từ cơ sở dữ liệu thay vì sử dụng danh sách tĩnh, giúp tự động đồng bộ hóa thương hiệu mới.
- **Trang Chi Tiết Sản Phẩm (`detail/index.jsx`)**: Trình bày thông tin mô tả chi tiết, lợi ích sản phẩm, các tệp tin đính kèm và đánh giá từ hội viên.
- **Trang Giỏ Hàng (`src/pages/cart/`)**: Tóm tắt các sản phẩm đã chọn, hỗ trợ tăng giảm số lượng, xóa sản phẩm và tự động tính toán tổng chi phí thời gian thực trước khi gửi yêu cầu checkout thanh toán.

---

## 🔔 8. Thống Nhất Vị Trí Toast Notification
- Để Toast không bị lùi sâu quá mức che mất nội dung ở giữa màn hình hoặc chèn lên Header, toàn bộ Toast notification trong hệ thống được căn chỉnh về vị trí **`top-[72px]`** (cách Header 64px một khoảng 8px cân đối).
- Cấu hình style thống nhất: `fixed left-1/2 -translate-x-1/2 z-[999999] rounded-2xl border shadow-lg backdrop-blur-sm px-4 py-2.5 text-xs font-bold gap-2 flex items-center`.

---

## 🔐 9. Cơ Chế Giữ Phiên Đăng Nhập Sau Khi Access Token Hết Hạn
Frontend sử dụng `src/services/api.js` làm điểm trung tâm cho mọi HTTP request thông qua Axios. File này chịu trách nhiệm gắn `Authorization: Bearer <access_token>`, gắn `x-session-id`, tự động gọi refresh token khi API trả về `401`, rồi thử lại request ban đầu bằng access token mới.
- **Cách xử lý đã bổ sung**:
  - Thêm hàm `waitForTokenChange(staleRefreshToken)` để chờ trong thời gian ngắn xem token trong `localStorage` có vừa được tab/request khác cập nhật hay không.
  - Thêm hàm `retryWithLatestAccessToken(original)` để gắn access token mới nhất vào request ban đầu và gọi lại API.
  - Khi refresh thất bại, frontend không xóa token ngay. Hệ thống kiểm tra khả năng đã có token mới từ tab/request khác; nếu có thì tiếp tục phiên đăng nhập bình thường.
  - Chỉ khi không có token mới hợp lệ, frontend mới xóa token và buộc người dùng đăng nhập lại.
- **Kết quả mong đợi**: Giảm hiện tượng một số tài khoản bị văng sau đúng 1 tiếng khi tài khoản đó mở nhiều tab hoặc có nhiều API chạy đồng thời.

---

## 🔐 10. Cơ Chế Chặn Tương Tác Cho Khách Vãng Lai (Guest Guards) - *Mới Thêm*
Để hỗ trợ việc công khai các trang Cửa hàng, Giỏ hàng và Cộng đồng nhưng vẫn đảm bảo tính toàn vẹn dữ liệu và yêu cầu đăng nhập khi thực hiện hành động sửa đổi:
- **Custom Hook `useRequireAuth`**:
  - Quản lý trạng thái đăng nhập qua `isLoggedIn` của context xác thực.
  - Cung cấp hàm `requireAuth()` kiểm tra: nếu chưa đăng nhập, lập tức hiển thị hộp thoại cảnh báo tùy biến (`useConfirm`) với thông báo: *"Vui lòng đăng nhập để thực hiện hành động này. Đi đến trang đăng nhập?"*. Nếu người dùng đồng ý, chuyển hướng trực tiếp sang `/login` kèm tham số `returnUrl` để quay lại đúng trang hiện tại sau khi đăng nhập thành công.
- **Chặn các hành động cụ thể tại giao diện**:
  - **Trang Cửa Hàng (`/store`)**: Chặn các nút "Thêm vào giỏ" và "Mua ngay" trên cả `ProductCard` và `ProductInfo` chi tiết sản phẩm.
  - **Trang Giỏ Hàng (`/cart`)**: Bỏ qua việc tải dữ liệu API giỏ hàng từ máy chủ bằng cấu hình `{ skip: !isLoggedIn }` của RTK Query, đồng thời hiển thị màn hình thay thế (placeholder) đẹp mắt báo "Bạn chưa đăng nhập" cùng hai liên kết "Đăng nhập ngay" và "Khám phá cửa hàng".
  - **Trang Cộng Đồng (`/community`)**:
    - Chặn nút mở modal tạo bài viết mới.
    - Chặn các thao tác like, bày tỏ cảm xúc, follow tác giả bài viết, lưu bài đăng, ẩn bài đăng, và gửi báo cáo bài đăng.
    - Chặn hành động nhập liệu (onFocus) vào ô bình luận chính của bài viết và ô phản hồi (reply comment) để tránh người dùng mất công gõ nội dung trước khi bị bắt đăng nhập.
    - Chặn việc gửi bình luận hoặc phản hồi lên máy chủ.
