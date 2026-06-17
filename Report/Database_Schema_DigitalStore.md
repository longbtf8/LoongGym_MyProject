# BÁO CÁO THIẾT KẾ SCHEMA CƠ SỞ DỮ LIỆU & KẾ HOẠCH TRIỂN KHAI CỬA HÀNG SẢN PHẨM SỐ

Tài liệu này chi tiết cấu trúc các thực thể dữ liệu mới được bổ sung vào file `schema.prisma` phục vụ cho màn hình Cửa Hàng Sản Phẩm Số (Meal Plan, E-book, Program, Giỏ hàng, Đặt hàng, Thanh toán), đồng thời hoạch định lộ trình triển khai chi tiết.

---

## 1. PHÂN LOẠI SCHEMA THEO TỪNG KHỐI CHỨC NĂNG

Hệ thống cơ sở dữ liệu của ứng dụng hiện tại được chia thành **7 khối chức năng** chính:

### KHỐI 1: QUẢN LÝ NGƯỜI DÙNG & HỆ THỐNG (User & Account Management)
*Quản lý tài khoản, thông tin hồ sơ, cấu hình người dùng và quản lý phiên đăng nhập.*
* **Các bảng:** `User`, `UserProfile`, `UserSetting`, `PasswordResetToken`, `RevokedTokens`, `RefreshTokens`, `Queues`.

### KHỐI 2: THƯ VIỆN BÀI TẬP (Exercise Library)
*Lưu trữ cơ sở dữ liệu bài tập chuẩn, nhóm cơ tham gia, thiết bị sử dụng và hướng dẫn kỹ thuật.*
* **Các bảng:** `MuscleGroup`, `Equipment`, `Exercise`, `ExerciseMuscle`, `ExerciseStep`, `ExerciseCommonMistake`, `ExerciseTag`.

### KHỐI 3: GIÁO ÁN MẪU & LỊCH TRÌNH CÁ NHÂN (Workout Programs & Schedules)
*Xây dựng cấu trúc các chương trình tập luyện mẫu (PPL, Upper/Lower) và ánh xạ thành lịch tập cụ thể theo ngày của từng thành viên.*
* **Các bảng:** `WorkoutProgram`, `WorkoutProgramDay`, `WorkoutTemplate`, `WorkoutTemplateExercise`, `UserTrainingPlan`, `UserTrainingPlanDay`.

### KHỐI 4: KẾT QUẢ TẬP LUYỆN & PHỤC HỒI (Workout Log & Analytics)
*Theo dõi tiến trình thực hiện nâng tạ thực tế, ghi nhận chỉ số cơ thể, trạng thái mệt mỏi/phục hồi và ảnh chụp thay đổi.*
* **Các bảng:** `WorkoutSession`, `WorkoutSessionExercise`, `WorkoutSet`, `BodyMetric`, `RecoveryLog`, `InjuryLog`, `ProgressPhoto`.

### KHỐI 5: DINH DƯỠNG & BỮA ĂN (Nutrition Management)
*Đặt mục tiêu Calo/Macros hàng ngày và ghi nhật ký các thực phẩm đã tiêu thụ trong bữa ăn.*
* **Các bảng:** `NutritionTarget`, `FoodItem`, `MealLog`, `MealLogItem`.

### KHỐI 6: TRỢ LÝ HUẤN LUYỆN AI (AI Coach System)
*Lưu trữ lịch sử chat, các khuyến nghị điều chỉnh lịch tập thông minh do AI đề xuất.*
* **Các bảng:** `AiConversation`, `AiMessage`, `AiRecommendation`, `AiKnowledgeDocument`.

### KHỐI 7: CỬA HÀNG SẢN PHẨM SỐ (Digital Product Store) - *Khối Mới Thêm*
*Cấu trúc hỗ trợ hiển thị sản phẩm số, quản lý giỏ hàng, tạo đơn hàng và lưu vết giao dịch thanh toán.*

```prisma
model ProductCategory {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(120)
  slug      String   @unique @db.VarChar(120)
  createdAt DateTime @default(now()) @map("created_at")

  products  Product[]

  @@map("product_categories")
}

model Product {
  id           String   @id @default(uuid())
  categoryId   String?  @map("category_id")
  title        String   @db.VarChar(250)
  slug         String   @unique @db.VarChar(250)
  description  String?  @db.Text
  productType  String   @map("product_type") @db.VarChar(50) // meal_plan, ebook, program, course
  price        Decimal  @default(0) @db.Decimal(12, 2)
  currency     String?  @default("VND") @db.VarChar(10)
  thumbnailUrl String?  @map("thumbnail_url") @db.Text
  status       String?  @default("draft") @db.VarChar(30) // draft, active, archived
  metadata     Json?    @default("{}")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @default(now()) @updatedAt @map("updated_at")

  category     ProductCategory? @relation(fields: [categoryId], references: [id])
  assets       ProductAsset[]
  cartItems    CartItem[]
  orderItems   OrderItem[]

  @@map("products")
}

model ProductAsset {
  id         String   @id @default(uuid())
  productId  String   @map("product_id")
  assetType  String?  @map("asset_type") @db.VarChar(50) // pdf, video, file, link
  title      String?  @db.VarChar(200)
  fileUrl    String?  @map("file_url") @db.Text
  accessRule Json?    @default("{}") @map("access_rule")
  createdAt  DateTime @default(now()) @map("created_at")

  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_assets")
}

model Cart {
  id        String   @id @default(uuid())
  userId    String?  @map("user_id")
  status    String?  @default("active") @db.VarChar(30)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at")

  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@map("carts")
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String   @map("cart_id")
  productId String   @map("product_id")
  quantity  Int      @default(1)
  unitPrice Decimal  @map("unit_price") @db.Decimal(12, 2)

  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id])

  @@map("cart_items")
}

model Order {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  orderNumber   String    @unique @map("order_number") @db.VarChar(50)
  status        String?   @default("pending") @db.VarChar(30) // pending, paid, failed, refunded
  subtotal      Decimal   @db.Decimal(12, 2)
  discountTotal Decimal?  @default(0) @map("discount_total") @db.Decimal(12, 2)
  total         Decimal   @db.Decimal(12, 2)
  currency      String?   @default("VND") @db.VarChar(10)
  createdAt     DateTime  @default(now()) @map("created_at")
  paidAt        DateTime? @map("paid_at")

  user          User      @relation(fields: [userId], references: [id])
  items         OrderItem[]
  payments      Payment[]

  @@map("orders")
}

model OrderItem {
  id           String   @id @default(uuid())
  orderId      String   @map("order_id")
  productId    String   @map("product_id")
  productTitle String   @map("product_title") @db.VarChar(250)
  quantity     Int
  unitPrice    Decimal  @map("unit_price") @db.Decimal(12, 2)
  totalPrice   Decimal  @map("total_price") @db.Decimal(12, 2)

  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product  @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Payment {
  id                String   @id @default(uuid())
  orderId           String   @map("order_id")
  provider          String?  @db.VarChar(50) // stripe, momo, vnpay, zalopay
  providerPaymentId String?  @map("provider_payment_id") @db.VarChar(255)
  amount            Decimal  @db.Decimal(12, 2)
  currency          String?  @default("VND") @db.VarChar(10)
  status            String?  @default("pending") @db.VarChar(30)
  rawResponse       Json?    @default("{}") @map("raw_response")
  createdAt         DateTime @default(now()) @map("created_at")

  order             Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("payments")
}
```

---

## 2. KẾ HOẠCH TRIỂN KHAI PHÁT TRIỂN HỆ THỐNG CỬA HÀNG (Implementation Plan)

### Giai đoạn 1: Đồng bộ Database & Viết Seed Data (Backend)
1. **Chạy Migration**: Tạo bảng mới trên cơ sở dữ liệu:
   ```bash
   npx prisma migrate dev --name init_digital_store
   ```
2. **Viết Seed Script**: Seed sản phẩm mẫu (ví dụ: Ebook "Giáo trình giảm mỡ bụng PDF", Thực đơn "Tăng cân lành mạnh 3000 kcal", Giáo án "PPL 12 tuần chuyên sâu").

### Giai đoạn 2: Phát triển API Endpoints (Backend)
1. **Sản phẩm**: API xem danh sách và chi tiết các sản phẩm số.
2. **Giỏ hàng**: Quản lý thêm/sửa/xoá các items trong giỏ hàng của user hiện tại.
3. **Thanh toán & Webhook**: Tích hợp các cổng thanh toán (VNPay/Momo/Stripe). Nhận callback/webhook từ cổng thanh toán để tự động cập nhật trạng thái đơn hàng thành `paid`.
4. **Cấp quyền truy cập**: Sau khi thanh toán thành công, mở khóa file đính kèm (`ProductAsset`) cho người dùng.

### Giai đoạn 3: Phát triển Giao diện (Frontend)
1. **Trang Cửa Hàng (`/store`)**: Grid sản phẩm kèm chức năng bộ lọc và thêm vào giỏ.
2. **Trang Chi Tiết Sản Phẩm (`/store/product/:slug`)**: Xem thông tin mô tả chi tiết, số trang, số buổi tập mẫu, ảnh minh họa.
3. **Giỏ Hàng & Checkout**: Giao diện giỏ hàng tổng kết số tiền, trang lựa chọn phương thức thanh toán VNPay/Momo/Stripe.
4. **Trang Quản Lý Tải Về**: Trang danh sách các sản phẩm đã mua cùng nút "Tải PDF" hoặc "Xem Video" đính kèm.
