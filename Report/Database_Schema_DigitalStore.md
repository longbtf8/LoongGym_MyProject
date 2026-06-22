# BÁO CÁO THIẾT KẾ SCHEMA CƠ SỞ DỮ LIỆU & PHÂN LOẠI CHỨC NĂNG DỰ ÁN LOONGGYM

Tài liệu này chi tiết cấu trúc các thực thể dữ liệu mới được bổ sung vào file `schema.prisma` phục vụ cho màn hình Cửa Hàng Sản Phẩm Số, phân hệ Cộng Đồng và hệ thống lưu trữ chấn thương/phục hồi sinh học.

---

## 1. PHÂN LOẠI SCHEMA THEO TỪNG KHỐI CHỨC NĂNG

Hệ thống cơ sở dữ liệu của ứng dụng hiện tại được chia thành **8 khối chức năng** chính:

### KHỐI 1: QUẢN LÝ NGƯỜI DÙNG & HỆ THỐNG (User & Account Management)
*Quản lý tài khoản, thông tin hồ sơ, cấu hình người dùng và quản lý phiên đăng nhập.*
- **Các bảng:** `User`, `UserProfile`, `UserSetting`, `PasswordResetToken`, `RevokedTokens`, `RefreshTokens`, `Queues`.

### KHỐI 2: THƯ VIỆN BÀI TẬP (Exercise Library)
*Lưu trữ cơ sở dữ liệu bài tập chuẩn, nhóm cơ tham gia, thiết bị sử dụng và hướng dẫn kỹ thuật.*
- **Các bảng:** `MuscleGroup`, `Equipment`, `Exercise`, `ExerciseMuscle`, `ExerciseStep`, `ExerciseCommonMistake`, `ExerciseTag`.

### KHỐI 3: GIÁO ÁN MẪU & LỊCH TRÌNH CÁ NHÂN (Workout Programs & Schedules)
*Xây dựng cấu trúc các chương trình tập luyện mẫu (PPL, Upper/Lower) và ánh xạ thành lịch tập cụ thể theo ngày của từng thành viên.*
- **Các bảng:** `WorkoutProgram`, `WorkoutProgramDay`, `WorkoutTemplate`, `WorkoutTemplateExercise`, `UserTrainingPlan`, `UserTrainingPlanDay`.

### KHỐI 4: KẾT QUẢ TẬP LUYỆN & PHỤC HỒI (Workout Log & Analytics)
*Theo dõi tiến trình thực hiện nâng tạ thực tế, ghi nhận chỉ số cơ thể, trạng thái mệt mỏi/phục hồi và ảnh chụp thay đổi.*
- **Các bảng:** `WorkoutSession`, `WorkoutSessionExercise`, `WorkoutSet`, `BodyMetric`, `RecoveryLog`, `InjuryLog`, `ProgressPhoto`.

### KHỐI 5: DINH DƯỠNG & BỮA ĂN (Nutrition Management)
*Đặt mục tiêu Calo/Macros hàng ngày và ghi nhật ký các thực phẩm đã tiêu thụ trong bữa ăn.*
- **Các bảng:** `NutritionTarget`, `FoodItem`, `MealLog`, `MealLogItem`.

### KHỐI 6: TRỢ LÝ HUẤN LUYỆN AI (AI Coach System)
*Lưu trữ lịch sử chat, các khuyến nghị điều chỉnh lịch tập thông minh do AI đề xuất.*
- **Các bảng:** `AiConversation`, `AiMessage`, `AiRecommendation`, `AiKnowledgeDocument`.

### KHỐI 7: CỬA HÀNG SẢN PHẨM SỐ (Digital Product Store)
*Cấu trúc hỗ trợ hiển thị sản phẩm số, quản lý giỏ hàng, tạo đơn hàng và lưu vết giao dịch thanh toán.*
- **Các bảng:** `ProductCategory`, `Product`, `ProductAsset`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Payment`.

### KHỐI 8: TƯƠNG TÁC CỘNG ĐỒNG & MẠNG XÃ HỘI (Community & Social Network) - *Khối Mới Thêm*
*Lưu trữ bài đăng cộng đồng, bình luận bài viết, bình luận hình ảnh chi tiết, lượt bày tỏ cảm xúc và hệ thống theo dõi giữa các người dùng.*
- **Các bảng:** `CommunityPost`, `PostMedia`, `PostMediaComment`, `PostMediaCommentReaction`, `PostMediaReaction`, `PostComment`, `CommentReaction`, `PostReaction`, `PostUserHidden`, `CommentUserHidden`, `PostProfileArchive`, `PostReport`, `UserFollow`, `PostSave`.

---

## 2. SCHEMA CỦA CÁC KHỐI BỔ SUNG MỚI

### 2.1. Khối 7: Cửa hàng Sản phẩm số & Giỏ hàng
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

### 2.2. Khối 8: Tương Tác Cộng Đồng & Mạng Xã Hội
```prisma
model CommunityPost {
  id                     String    @id @default(uuid())
  userId                 String    @map("user_id")
  content                String?   @db.Text
  postType               String    @default("general") @map("post_type") @db.VarChar(50) // general, workout_share, check_in
  visibility             String    @default("public") @db.VarChar(30) // public, followers, private
  relatedWorkoutSessionId String?  @map("related_workout_session_id")
  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")

  user                 User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  media                PostMedia[]
  comments             PostComment[]
  reactions            PostReaction[]
  hiddenBy             PostUserHidden[]
  profileArchives      PostProfileArchive[]
  reports              PostReport[]
  saves                PostSave[]

  @@map("community_posts")
}

model PostMedia {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  mediaUrl  String   @map("media_url") @db.Text
  mediaType String?  @map("media_type") @db.VarChar(30)
  caption   String?  @db.Text
  sortOrder Int      @default(0) @map("sort_order")

  post      CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  comments  PostMediaComment[]
  reactions PostMediaReaction[]

  @@map("post_media")
}

model PostMediaComment {
  id        String   @id @default(uuid())
  mediaId   String   @map("media_id")
  userId    String   @map("user_id")
  content   String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")

  media     PostMedia                  @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  user      User                       @relation(fields: [userId], references: [id], onDelete: Cascade)
  reactions PostMediaCommentReaction[]

  @@map("post_media_comments")
}

model PostMediaCommentReaction {
  id           String   @id @default(uuid())
  commentId    String   @map("comment_id")
  userId       String   @map("user_id")
  reactionType String   @default("like") @map("reaction_type") @db.VarChar(30)
  createdAt    DateTime @default(now()) @map("created_at")

  comment PostMediaComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user    User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId, reactionType], map: "pmcr_comment_user_type_key")
  @@map("post_media_comment_reactions")
}

model PostMediaReaction {
  id           String   @id @default(uuid())
  mediaId      String   @map("media_id")
  userId       String   @map("user_id")
  reactionType String   @default("like") @map("reaction_type") @db.VarChar(30)
  createdAt    DateTime @default(now()) @map("created_at")

  media PostMedia @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  user  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([mediaId, userId, reactionType])
  @@map("post_media_reactions")
}

model PostComment {
  id              String              @id @default(uuid())
  postId          String              @map("post_id")
  userId          String              @map("user_id")
  parentCommentId String?             @map("parent_comment_id")
  content         String              @db.Text
  createdAt       DateTime            @default(now()) @map("created_at")

  post          CommunityPost         @relation(fields: [postId], references: [id], onDelete: Cascade)
  user          User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  parentComment PostComment?          @relation("CommentReplies", fields: [parentCommentId], references: [id], onDelete: Cascade)
  replies       PostComment[]         @relation("CommentReplies")
  reactions     CommentReaction[]
  hiddenBy      CommentUserHidden[]

  @@map("post_comments")
}

model CommentReaction {
  id           String      @id @default(uuid())
  commentId    String      @map("comment_id")
  userId       String      @map("user_id")
  reactionType String      @default("like") @map("reaction_type") @db.VarChar(30)
  createdAt    DateTime    @default(now()) @map("created_at")

  comment      PostComment @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([commentId, userId, reactionType])
  @@map("comment_reactions")
}

model PostReaction {
  id           String        @id @default(uuid())
  postId       String        @map("post_id")
  userId       String        @map("user_id")
  reactionType String        @default("like") @map("reaction_type") @db.VarChar(30)
  createdAt    DateTime      @default(now()) @map("created_at")

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId, reactionType])
  @@map("post_reactions")
}

model UserFollow {
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  follower  User @relation("FollowersList", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("FollowingList", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@map("user_follows")
}

model PostSave {
  id        String   @id @default(uuid())
  postId    String   @map("post_id")
  userId    String   @map("user_id")
  createdAt DateTime @default(now()) @map("created_at")

  post      CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@map("post_saves")
}
```
