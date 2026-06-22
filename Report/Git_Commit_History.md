# LỊCH SỬ PHÁT TRIỂN & COMMIT LOG DỰ ÁN LOONGGYM

Tài liệu này ghi nhận đầy đủ lịch sử các commits tính năng, sửa lỗi và tối ưu hóa hệ thống LoongGym theo tiến trình phát triển thực tế của dự án.

---

## 🚀 1. Lịch Sử Phát Triển Chi Tiết (Commit Log)

### 1. `feat(confirm): implement custom ConfirmContext and ConfirmProvider`
*   **Hành động**:
    - **Frontend**: Tạo mới `ConfirmContext.jsx` cung cấp `ConfirmProvider` và custom hook `useConfirm`.
    - Loại bỏ hoàn toàn các hàm `confirm()` và `alert()` mặc định của trình duyệt.
    - Thiết kế modal xác nhận bằng hiệu ứng kính mờ Glassmorphism, hỗ trợ 4 trạng thái chuyên biệt: `danger` (màu đỏ - xóa dữ liệu), `warning` (màu vàng), `info` (màu xanh dương) và `success` (màu xanh lá) đi kèm icon Lucide tương ứng.
    - Sử dụng React Portals đẩy trực tiếp modal ra ngoài root body của DOM để tránh lỗi hiển thị do layout.
*   **Ý nghĩa**: Tăng độ premium, đồng bộ giao diện hộp thoại cảnh báo và nâng cao trải nghiệm người dùng toàn hệ thống.

### 2. `feat(community): implement community feed pages, comments, reactions, and follower system`
*   **Hành động**:
    - **Database**: Bổ sung các bảng tương tác xã hội: `CommunityPost`, `PostMedia`, `PostMediaComment`, `PostMediaCommentReaction`, `PostMediaReaction`, `PostComment`, `CommentReaction`, `PostReaction`, `PostUserHidden`, `CommentUserHidden`, `PostProfileArchive`, `PostReport`, `UserFollow`, `PostSave` vào `schema.prisma`.
    - **Backend**: Xây dựng tuyến routes, controllers, và services cho phân hệ Cộng đồng (`community.route.js`, `community.controller.js`, `community.service.js`). Hỗ trợ đăng bài kèm tối đa 10 ảnh tải lên Cloudinary, bình luận/trả lời nhiều cấp, bày tỏ cảm xúc trên bài viết/hình ảnh, ẩn bài đăng, báo cáo vi phạm, lưu bài đăng và theo dõi người dùng.
    - **Frontend**: Chia nhỏ giao diện thành các thành phần chuyên biệt (`PostCreator.jsx`, `PostFeed.jsx`, `PostCard.jsx`, `PostMediaGrid.jsx`, `CommentsSection.jsx`, `MatchingUsers.jsx`). Ẩn nút theo dõi đối với chính mình trên danh sách tìm kiếm và trên trang cá nhân của mình.
*   **Ý nghĩa**: Xây dựng hoàn chỉnh mạng xã hội thu nhỏ cho hội viên gym kết nối, chia sẻ buổi tập và tương tác với nhau.

### 3. `feat(store): implement digital store, shopping cart, and seed scripts`
*   **Hành động**:
    - **Database**: Bổ sung các bảng `ProductCategory`, `Product`, `ProductAsset`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment` vào `schema.prisma`.
    - **Backend**: Xây dựng API giỏ hàng (`cart.route.js`, `cart.controller.js`, `cart.service.js`) quản lý thêm/sửa/xóa sản phẩm số, tự động lưu đơn giá tại thời điểm thêm vào giỏ. Viết các kịch bản seed dữ liệu sản phẩm từ v2 đến v5.
    - **Frontend**: Xây dựng trang Cửa hàng (`src/pages/store/`) hiển thị lưới sản phẩm số, bộ lọc danh mục/giá, trang chi tiết sản phẩm và trang Giỏ hàng (`src/pages/cart/`) tính toán chi phí thời gian thực trước khi thanh toán.
*   **Ý nghĩa**: Mở rộng khả năng kinh doanh các sản phẩm số (thực đơn dinh dưỡng, giáo trình tập luyện, sách điện tử) cho ứng dụng.

### 4. `fix(myplan): resolve custom exercises delete bug and stabilize restore original day program`
*   **Hành động**:
    - **Backend**: Cải tiến `plan-setup.helper.js` để tự động lưu bản sao bài tập gốc (`originalExercises`) vào metadata khi khởi tạo lộ trình.
    - Tối ưu hóa `plan-adjustment.helper.js` giữ lại `originalExercises` khi cập nhật thông tin ngày tập.
    - Khắc phục lỗi khôi phục sai số lượng bài tập của buổi tập (ví dụ: khôi phục đúng 6 bài gốc thay vì bị chuyển sang 4 bài).
    - **Frontend**: Sửa lỗi hiển thị nút "Khôi phục lịch gốc" dựa trên cờ trạng thái `customized: true` và tự động tắt nút này sau khi khôi phục thành công.
*   **Ý nghĩa**: Khắc phục lỗi logic nghiêm trọng khi chỉnh sửa và khôi phục lịch tập của người dùng, đảm bảo trải nghiệm tập luyện ổn định.

### 5. `style(ui): unify toast styles across all pages and optimize mobile bottom drawer navigation`
*   **Hành động**:
    - **Frontend**: Đồng bộ hóa 11 vị trí thông báo Toast trên 10 file về cùng một style thống nhất: cách Header 8px (`top-[72px]`), border bo tròn góc `rounded-2xl`, chữ nhỏ đậm `text-xs font-bold`, hiệu ứng kính mờ `backdrop-blur-sm`, và kích thước phù hợp mọi thiết bị.
    - Cập nhật avatar trên Mobile ở `Header/index.jsx` từ Link chuyển thành button để kích hoạt menu Bottom Sheet thay vì chuyển trang.
    - Tối ưu hóa giao diện Bottom Sheet di động gọn gàng (thu nhỏ icon, font chữ, padding). Đổi tên mục "Hồ sơ" thành **"Trang cá nhân"** và trỏ đường dẫn về `/profile/${userInfo?.id}`. Giữ liên kết thẻ Profile Card trên cùng dẫn tới trang chỉnh sửa `/account/profile`.
*   **Ý nghĩa**: Hoàn thiện toàn bộ các yêu cầu UI/UX liên quan đến trải nghiệm sử dụng di động và hệ thống cảnh báo của ứng dụng.

### 6. `docs(reports): rewrite and align architectural, backend, frontend, database, and commit reports`
*   **Hành động**:
    - Cập nhật và viết lại toàn bộ nội dung tài liệu báo cáo kiến trúc hệ thống (`Overview_Architecture.md`), nguyên lý hoạt động Backend (`Backend_Operations.md`), nguyên lý hoạt động Frontend (`Frontend_Operations.md`), và thiết kế cơ sở dữ liệu (`Database_Schema_DigitalStore.md`).
    - Ghi nhận lịch sử commits đầy đủ và viết báo cáo nghiệm thu cuối cùng `Final_Verification_Report.md`.
*   **Ý nghĩa**: Đảm bảo tài liệu dự án hoàn toàn đồng bộ với mã nguồn thực tế, hỗ trợ đắc lực cho việc chuyển giao và bảo trì hệ thống.

### 7. `feat(store): dynamically load brands in store filter from database products`
*   **Hành động**:
    - **Frontend**: Tính toán động danh sách thương hiệu (`availableBrands`) qua `useMemo` từ dữ liệu sản phẩm trong DB (`allProducts`) thay vì khai báo cứng.
    - Cập nhật prop truyền xuống `FilterSidebar` và hiển thị động checkbox thương hiệu.
*   **Ý nghĩa**: Đồng bộ hóa thương hiệu và lọc sản phẩm chính xác, tránh lỗi dữ liệu giả.

---

## 🛠️ 2. Nguyên Tắc Cập Nhật Commit Chuẩn Mực
Dự án LoongGym áp dụng tiêu chuẩn đặt tên commit khoa học (**Conventional Commits**):
- `feat`: Khi bổ sung tính năng mới hoàn chỉnh.
- `fix`: Khi sửa lỗi nghiệp vụ hoặc lỗi cú pháp lập trình.
- `refactor`: Khi tái cấu trúc lại mã nguồn sạch hơn mà không đổi hành vi hệ thống.
- `chore`: Khi cài đặt thêm thư viện, cập nhật cấu hình dự án.
- `style`: Khi thay đổi giao diện CSS, căn lề, định dạng mã nguồn.
- `docs`: Khi thay đổi hoặc bổ sung tài liệu báo cáo dự án.
