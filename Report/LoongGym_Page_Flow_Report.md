# BÁO CÁO LUỒNG HOẠT ĐỘNG & BẢN ĐỒ CÁC TRANG (LOONGGYM FLOWCHART)

Tài liệu này trình bày bản vẽ sơ đồ luồng hoạt động (User Flow) và cách các trang (Views/Screens) tương tác với nhau trong dự án **LoongGym**, được phân bổ trực quan theo từng phân hệ chức năng bằng tiếng Việt.

---

## 1. SƠ ĐỒ LUỒNG TRANG VÀ HOẠT ĐỘNG TRỰC QUAN

Sơ đồ dưới đây biểu diễn cấu trúc phân trang theo màu sắc của từng phân hệ (tương tự phong cách thiết kế phân khối từ dự án mẫu của bạn), kết hợp với các mũi tên động nét đứt thể hiện luồng chuyển dữ liệu và kích hoạt giữa các phân hệ:

![Luồng trang và Hoạt động LoongGym](file:///Users/builong/LoongMilKGymProject/Report/Database_Page_Flow_LoongGym.png)

---

## 2. CHI TIẾT CÁC LUỒNG HOẠT ĐỘNG DYNAMIC

### 2.1. Phân hệ Hồ sơ & Cấu hình (Xanh dương)
- Học viên truy cập qua **Trang Đăng Nhập / Đăng Ký** -> tiến tới **Trang Hồ Sơ Học Viên** để cập nhật thông số sinh trắc học cá nhân (Chiều cao, Cân nặng, Cân nặng mục tiêu).
- Từ đây, thiết lập tại **Trang Cấu Hình Cá Nhân** (đặc biệt là Calo mục tiêu/ngày) sẽ được tự động đồng bộ sang phân hệ **Dinh dưỡng** để làm mốc tính toán phần trăm hoàn thành chỉ tiêu calo nạp vào.

### 2.2. Luồng Tập luyện cá nhân (Tím)
- Người dùng có thể tự tra cứu hướng dẫn động tác tại **Trang Thư Viện Bài Tập**.
- Để bắt đầu kế hoạch, người dùng xem danh sách giáo án mẫu tại **Trang Giáo Án Mẫu** và bấm áp dụng để hệ thống tự động rải lịch tập vào **Trang Lịch Tập Cá Nhân** (Calendar).
- Đến ngày tập, người dùng bấm "Bắt đầu tập" để chuyển sang giao diện active **Trang Phòng Tập / Nhật Ký** ghi nhận số set, rep và tạ thực tế.
- **Hoạt động Dynamic**: Sau khi hoàn thành buổi tập và bấm "Lưu", hệ thống sẽ tự động chuyển tiếp dữ liệu và kích hoạt màn hình viết bài đăng chia sẻ lên **Trang Bảng Tin Cộng Đồng**.

### 2.3. Luồng Dinh dưỡng (Xanh lá)
- Học viên ghi lại các món ăn tại **Trang Nhật Ký Ăn Uống** (theo các bữa Sáng, Trưa, Tối, Phụ).
- Trong quá trình nhập, học viên có thể tra cứu nhanh lượng calo/carb/protein của các loại thực phẩm chuẩn từ **Trang Thư Viện Thực Phẩm**.

### 2.4. Luồng Mua sắm & Kích hoạt Giáo án VIP (Vàng)
- Tại **Trang Cửa Hàng Số**, học viên lựa chọn các Ebook dinh dưỡng hoặc các Giáo án tập luyện đặc biệt (được gắn thẻ VIP/Premium).
- Khi thêm sản phẩm vào **Trang Giỏ Hàng** và tiến hành thanh toán thành công tại **Trang Thanh Toán** (thông qua Momo, ZaloPay, Stripe), hệ thống sẽ **tự động kích hoạt** và hiển thị giáo án VIP đó trực tiếp vào **Trang Lịch Tập Cá Nhân** của học viên.

### 2.5. Luồng Trợ lý AI Coach thông minh (Xanh ngọc)
- **AI Coach** hoạt động như một bộ não liên kết tất cả các phân hệ:
  - Dữ liệu tập luyện thực tế thu thập từ **Trang Nhật Ký Tập** được gửi về cho AI để phân tích xu hướng tăng tạ (Progressive Overload).
  - Dữ liệu calo và vĩ chất nạp vào từ **Trang Nhật Ký Bữa Ăn** được gửi về cho AI để đánh giá tỷ lệ dinh dưỡng.
  - Từ phòng **Chat tư vấn AI Coach**, AI sẽ tổng hợp và đưa ra các đề xuất điều chỉnh tại **Bảng Đề Xuất AI**. 
  - **Hoạt động Dynamic**: Nếu học viên bấm "Đồng ý" với đề xuất của AI (ví dụ: giảm số set bài Squat do cơ đùi quá tải, hoặc thêm bữa phụ), AI sẽ **tự động cập nhật trực tiếp** các ngày tập/thực đơn vào **Trang Lịch Tập Cá Nhân** của học viên mà không cần người dùng thao tác thủ công.

---

## 3. MÃ NGUỒN MERMAID FLOWCHART

Bạn có thể chỉnh sửa sơ đồ này trực tiếp bằng cách sao chép mã nguồn Mermaid dưới đây:

```mermaid
flowchart TD
    %% ==========================================
    %% THIẾT LẬP PHONG CÁCH MÀU SẮC (CSS STYLE CLASSES)
    %% ==========================================
    classDef userStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1;
    classDef workoutStyle fill:#ede7f6,stroke:#5e35b1,stroke-width:2px,color:#4a148c;
    classDef nutritionStyle fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef storeStyle fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,color:#ff6f00;
    classDef communityStyle fill:#fbe9e7,stroke:#d84315,stroke-width:2px,color:#bf360c;
    classDef aiStyle fill:#e0f7fa,stroke:#00838f,stroke-width:2px,color:#006064;

    %% ==========================================
    %% PHÂN HỆ 1: NGƯỜI DÙNG & HỒ SƠ (XANH DƯƠNG)
    %% ==========================================
    subgraph MODULE_USER ["👤 PHÂN HỆ HỒ SƠ & CHỈ SỐ"]
        pg_login["Trang Đăng Nhập / Đăng Ký<br/>(Xác thực tài khoản)"]
        pg_profile["Trang Hồ Sơ Học Viên<br/>(Cập nhật Chiều cao, Cân nặng)"]
        pg_settings["Trang Cấu Hình Cá Nhân<br/>(Calo mục tiêu/ngày, Theme)"]
        
        pg_login --> pg_profile
        pg_profile --> pg_settings
    end
    class MODULE_USER,pg_login,pg_profile,pg_settings userStyle;

    %% ==========================================
    %% PHÂN HỆ 2: TẬP LUYỆN (TÍM)
    %% ==========================================
    subgraph MODULE_WORKOUT ["💪 PHÂN HỆ TẬP LUYỆN CÁ NHÂN"]
        pg_exercises["Trang Thư Viện Bài Tập<br/>(Tra cứu video hướng dẫn kỹ thuật)"]
        pg_programs["Trang Giáo Án Mẫu<br/>(Danh sách giáo án PPL, Cardio...)"]
        pg_calendar["Trang Lịch Tập Cá Nhân<br/>(Xem kế hoạch tập theo ngày)"]
        pg_active_workout["Trang Phòng Tập / Nhật Ký<br/>(Ghi lại Set, Rep, Tạ thực tế)"]
        
        pg_programs -->|"Áp dụng giáo án"| pg_calendar
        pg_calendar -->|"Bắt đầu buổi tập"| pg_active_workout
    end
    class MODULE_WORKOUT,pg_exercises,pg_programs,pg_calendar,pg_active_workout workoutStyle;

    %% ==========================================
    %% PHÂN HỆ 3: DINH DƯỠNG (XANH LÁ)
    %% ==========================================
    subgraph MODULE_NUTRITION ["🥗 PHÂN HỆ DINH DƯỠNG"]
        pg_nutrition["Trang Nhật Ký Ăn Uống<br/>(Báo cáo Calo nạp: Sáng, Trưa, Tối)"]
        pg_food_library["Trang Thư Viện Thực Phẩm<br/>(Chọn Trứng, Ức gà, Thịt bò...)"]
        
        pg_nutrition -->|"Tra cứu món ăn"| pg_food_library
    end
    class MODULE_NUTRITION,pg_nutrition,pg_food_library nutritionStyle;

    %% ==========================================
    %% PHÂN HỆ 4: CỬA HÀNG SỐ (VÀNG)
    %% ==========================================
    subgraph MODULE_STORE ["🛒 PHÂN HỆ CỬA HÀNG SẢN PHẨM SỐ"]
        pg_store["Trang Cửa Hàng Số<br/>(Mua Ebook, Giáo án đặc biệt)"]
        pg_cart["Trang Giỏ Hàng"]
        pg_checkout["Trang Thanh Toán<br/>(Cổng Momo, ZaloPay, Stripe)"]
        
        pg_store --> pg_cart
        pg_cart --> pg_checkout
    end
    class MODULE_STORE,pg_store,pg_cart,pg_checkout storeStyle;

    %% ==========================================
    %% PHÂN HỆ 5: CỘNG ĐỒNG (CAM)
    %% ==========================================
    subgraph MODULE_COMMUNITY ["🔥 PHÂN HỆ TƯƠNG TÁC CỘNG ĐỒNG"]
        pg_feed["Trang Bảng Tin Học Viên<br/>(Đăng bài viết chia sẻ, theo dõi)"]
        pg_comment["Khung Bình Luận / Thả Tim<br/>(Tương tác giữa các học viên)"]
        
        pg_feed --> pg_comment
    end
    class MODULE_COMMUNITY,pg_feed,pg_comment communityStyle;

    %% ==========================================
    %% PHÂN HỆ 6: TRỢ LÝ AI (XANH NGỌC)
    %% ==========================================
    subgraph MODULE_AI ["🤖 TRỢ LÝ THÔNG MINH AI COACH"]
        pg_ai_chat["Trang Trò Chuyện AI Coach<br/>(Chat tư vấn sức khỏe)"]
        pg_ai_recommend["Bảng Đề Xuất AI Coach<br/>(Tự động điều chỉnh kế hoạch)"]
        
        pg_ai_chat --> pg_ai_recommend
    end
    class MODULE_AI,pg_ai_chat,pg_ai_recommend aiStyle;

    %% ==========================================
    %% LUỒNG HOẠT ĐỘNG CHÍNH DYNAMIC GIỮA CÁC PHÂN HỆ
    %% ==========================================
    pg_settings -.->|"So sánh mục tiêu Calo"| pg_nutrition
    pg_active_workout -.->|"Chia sẻ kết quả tập luyện"| pg_feed
    pg_checkout -.->|"Kích hoạt giáo án VIP mua từ Store"| pg_calendar
    
    pg_active_workout -.->|"Yêu cầu AI phân tích tiến trình"| pg_ai_chat
    pg_nutrition -.->|"Yêu cầu AI đánh giá dinh dưỡng"| pg_ai_chat
    pg_ai_recommend -.->|"AI tự động chèn ngày tập đề xuất"| pg_calendar
```
