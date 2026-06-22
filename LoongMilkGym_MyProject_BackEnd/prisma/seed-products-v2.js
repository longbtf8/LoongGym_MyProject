require("dotenv/config");
const { PrismaClient } = require("../generated/prisma");
const cloudinary = require("cloudinary").v2;

const prisma = new PrismaClient();

// Configure Cloudinary from Env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  console.log("🌱 Starting database cleaning and premium products seeding (70 items across 7 categories)...");

  // 1. Clear existing dependent records and products
  console.log("🧹 Clearing old product database records...");
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productAsset.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("✅ Cleared old product records.");

  // 2. Seed/Get 7 Categories
  const catDinhDuong = await prisma.productCategory.upsert({
    where: { slug: "dinh-duong" },
    update: { name: "Dinh dưỡng" },
    create: { name: "Dinh dưỡng", slug: "dinh-duong" },
  });

  const catThietBi = await prisma.productCategory.upsert({
    where: { slug: "thiet-bi" },
    update: { name: "Thiết bị" },
    create: { name: "Thiết bị", slug: "thiet-bi" },
  });

  const catPhuKien = await prisma.productCategory.upsert({
    where: { slug: "phu-kien" },
    update: { name: "Phụ kiện" },
    create: { name: "Phụ kiện", slug: "phu-kien" },
  });

  const catTrangPhuc = await prisma.productCategory.upsert({
    where: { slug: "trang-phuc" },
    update: { name: "Trang phục" },
    create: { name: "Trang phục", slug: "trang-phuc" },
  });

  const catChuongTrinh = await prisma.productCategory.upsert({
    where: { slug: "chuong-trinh-tap-luyen" },
    update: { name: "Chương trình tập luyện" },
    create: { name: "Chương trình tập luyện", slug: "chuong-trinh-tap-luyen" },
  });

  const catThucDon = await prisma.productCategory.upsert({
    where: { slug: "thuc-don-dinh-duong" },
    update: { name: "Thực đơn & Dinh dưỡng" },
    create: { name: "Thực đơn & Dinh dưỡng", slug: "thuc-don-dinh-duong" },
  });

  const catTaiLieu = await prisma.productCategory.upsert({
    where: { slug: "tai-lieu-sach" },
    update: { name: "Tài liệu & Sách" },
    create: { name: "Tài liệu & Sách", slug: "tai-lieu-sach" },
  });

  console.log("✅ All 7 categories prepared.");

  // 3. Define 70 products (10 per category)
  const productsToSeed = [
    // === 1. DINH DƯỠNG (10 sản phẩm) ===
    {
      title: "Optimum Nutrition Gold Standard 100% Whey",
      slug: "optimum-nutrition-gold-standard-100-whey",
      description: "Bột đạm whey protein tinh khiết hấp thụ nhanh hàng đầu thế giới, hỗ trợ phát triển và duy trì cơ bắp nạc tối ưu sau các buổi tập luyện cường độ cao.",
      productType: "supplement",
      price: 950000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Optimum Nutrition",
        rating: 4.8,
        reviewsCount: 1540,
        inStock: true,
        originalPrice: 1100000,
        flavors: ["Chocolate", "Vanilla"],
        sizes: ["2 lbs", "5 lbs"],
        keyStats: [
          { label: "Protein", value: "24g" },
          { label: "BCAAs", value: "5.5g" },
          { label: "Gluten-Free", value: "Có" }
        ]
      }
    },
    {
      title: "Rule 1 Proteins R1 Protein",
      slug: "rule-1-proteins-r1-protein",
      description: "Hỗn hợp Whey Protein Isolate & Hydrolyzed siêu tinh khiết, không đường, không lactose, không gluten giúp hấp thụ siêu nhanh.",
      productType: "supplement",
      price: 1650000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Rule 1",
        rating: 4.7,
        reviewsCount: 820,
        inStock: true,
        originalPrice: 1850000,
        flavors: ["Chocolate Fudge", "Cookies & Cream"],
        sizes: ["5 lbs"],
        keyStats: [
          { label: "Protein", value: "25g" },
          { label: "Sugar", value: "0g" },
          { label: "Fat", value: "0g" }
        ]
      }
    },
    {
      title: "Myprotein Impact Whey Protein",
      slug: "myprotein-impact-whey-protein",
      description: "Dòng whey cô đặc (concentrate) kinh tế bán chạy số 1 Châu Âu, thích hợp cho người mới bắt đầu tập luyện cần bổ sung nguồn đạm sạch hàng ngày.",
      productType: "supplement",
      price: 720000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Myprotein",
        rating: 4.5,
        reviewsCount: 960,
        inStock: true,
        flavors: ["Matcha Latte", "Chocolate Smooth"],
        sizes: ["2.2 lbs"],
        keyStats: [
          { label: "Protein", value: "21g" },
          { label: "Calories", value: "103 kcal" }
        ]
      }
    },
    {
      title: "MuscleTech Nitro-Tech Whey Gold",
      slug: "muscletech-nitro-tech-whey-gold",
      description: "Sự kết hợp giữa whey peptides và whey isolate giúp tăng hiệu suất phục hồi và phát triển các mô cơ nạc vượt trội.",
      productType: "supplement",
      price: 1450000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "MuscleTech",
        rating: 4.6,
        reviewsCount: 420,
        inStock: true,
        flavors: ["Milk Chocolate", "French Vanilla"],
        sizes: ["4 lbs"],
        keyStats: [
          { label: "Protein", value: "30g" },
          { label: "Creatine", value: "3g" }
        ]
      }
    },
    {
      title: "BSN Syntha-6 Ultra-Premium Protein Matrix",
      slug: "bsn-syntha-6-ultra-premium-protein-matrix",
      description: "Nguồn protein hỗn hợp hấp thụ đa tầng kéo dài suốt 8 tiếng, hương vị thơm ngon tuyệt hảo như sinh tố trái cây.",
      productType: "supplement",
      price: 1550000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "BSN",
        rating: 4.8,
        reviewsCount: 750,
        inStock: true,
        flavors: ["Chocolate Milkshake", "Strawberry Cream"],
        sizes: ["5 lbs"],
        keyStats: [
          { label: "Protein", value: "22g" },
          { label: "Carb", value: "15g" }
        ]
      }
    },
    {
      title: "Dymatize ISO 100 Hydrolyzed Whey",
      slug: "dymatize-iso-100-hydrolyzed-whey",
      description: "Whey Protein cô lập được thủy phân (Hydrolyzed) giúp hấp thụ cực nhanh và triệt để, hỗ trợ tốt nhất cho chế độ giảm mỡ tăng cơ.",
      productType: "supplement",
      price: 2150000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Dymatize",
        rating: 4.9,
        reviewsCount: 1120,
        inStock: true,
        originalPrice: 2300000,
        flavors: ["Gourmet Chocolate", "Fudge Brownie"],
        sizes: ["5 lbs"],
        keyStats: [
          { label: "Protein", value: "25g" },
          { label: "Fat", value: "0.5g" },
          { label: "Lactose-Free", value: "Có" }
        ]
      }
    },
    {
      title: "Cellucor C4 Original Pre-Workout",
      slug: "cellucor-c4-original-pre-workout",
      description: "Thực phẩm tăng năng lượng trước tập bán chạy số 1 tại Mỹ, thúc đẩy sự tỉnh táo tập trung và bơm cơ cực đại.",
      productType: "supplement",
      price: 680000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Cellucor",
        rating: 4.6,
        reviewsCount: 380,
        inStock: true,
        flavors: ["Fruit Punch", "Blue Raspberry"],
        sizes: ["30 Servings"],
        keyStats: [
          { label: "Caffeine", value: "150mg" },
          { label: "Beta-Alanine", value: "1.6g" }
        ]
      }
    },
    {
      title: "Optimum Nutrition Micronized Creatine",
      slug: "optimum-nutrition-micronized-creatine",
      description: "Bổ sung Creatine Monohydrate siêu mịn giúp tái tạo năng lượng ATP tức thì, cải thiện sức mạnh cơ bắp rõ rệt.",
      productType: "supplement",
      price: 520000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Optimum Nutrition",
        rating: 4.8,
        reviewsCount: 650,
        inStock: true,
        flavors: ["Không mùi"],
        sizes: ["300g"],
        keyStats: [
          { label: "Creatine", value: "5g" },
          { label: "Servings", value: "60" }
        ]
      }
    },
    {
      title: "Scivation XTEND Original BCAA",
      slug: "scivation-xtend-original-bcaa",
      description: "Thức uống phục hồi cơ chống dị hóa cơ bắp trong tập, bổ sung chất điện giải bù nước và giảm đau nhức cơ.",
      productType: "supplement",
      price: 690000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Scivation",
        rating: 4.7,
        reviewsCount: 510,
        inStock: true,
        flavors: ["Mango Nectar", "Watermelon"],
        sizes: ["30 Servings"],
        keyStats: [
          { label: "BCAAs", value: "7g" },
          { label: "Electrolytes", value: "1140mg" }
        ]
      }
    },
    {
      title: "MuscleTech Mass Tech Extreme 2000",
      slug: "muscletech-mass-tech-extreme-2000",
      description: "Sữa tăng cân tăng cơ siêu khủng dành cho người gầy lâu năm, cung cấp nguồn calo khổng lồ từ protein và tinh bột hấp thu chậm.",
      productType: "supplement",
      price: 1690000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "MuscleTech",
        rating: 4.6,
        reviewsCount: 310,
        inStock: true,
        flavors: ["Triple Chocolate", "Vanilla Sand"],
        sizes: ["12 lbs"],
        keyStats: [
          { label: "Calories", value: "2060 kcal" },
          { label: "Protein", value: "60g" }
        ]
      }
    },

    // === 2. THIẾT BỊ (10 sản phẩm) ===
    {
      title: "Bộ tạ tay thông minh Bowflex SelectTech 552",
      slug: "bo-ta-tay-thong-minh-bowflex-selecttech-552",
      description: "Bộ tạ tay điều chỉnh cân nặng từ 2kg đến 24kg chỉ bằng một vòng quay số xoay nhẹ. Giải pháp tối ưu hóa không gian tập gym tại nhà.",
      productType: "equipment",
      price: 4850000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "Bowflex",
        rating: 4.9,
        reviewsCount: 220,
        inStock: true,
        originalPrice: 5500000,
        sizes: ["Cặp tạ 24kg"],
        keyStats: [
          { label: "Trọng lượng", value: "2kg - 24kg" },
          { label: "Chất liệu", value: "Thép bọc cao su" },
          { label: "Cơ chế", value: "Núm xoay số" }
        ]
      }
    },
    {
      title: "Đòn tạ Olympic Barbell GymLife 2.2m",
      slug: "don-ta-olympic-barbell-gymlife-22m",
      description: "Đòn tạ tiêu chuẩn Olympic dài 2.2m chịu lực cực khủng lên tới 680kg, đầu xoay dùng bạc đạn đúc êm ái tránh chấn thương cổ tay.",
      productType: "equipment",
      price: 2150000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.8,
        reviewsCount: 95,
        inStock: true,
        sizes: ["Dài 2.2m"],
        keyStats: [
          { label: "Trọng lượng", value: "20kg" },
          { label: "Tải trọng", value: "1500 lbs" },
          { label: "Đường kính", value: "50mm" }
        ]
      }
    },
    {
      title: "Ghế tập tạ đa năng điều chỉnh độ dốc",
      slug: "ghe-tap-ta-da-nang-dieu-chinh-do-doc",
      description: "Ghế dốc tập tạ điều chỉnh 7 góc tựa lưng linh hoạt từ dốc xuống, phẳng cho tới dốc đứng, khung thép chịu tải cao bọc da PU êm ái.",
      productType: "equipment",
      price: 1890000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 110,
        inStock: true,
        sizes: ["Tiêu chuẩn"],
        keyStats: [
          { label: "Tải trọng", value: "350kg" },
          { label: "Chất liệu", value: "Thép sơn tĩnh điện" },
          { label: "Góc nghiêng", value: "7 cấp độ" }
        ]
      }
    },
    {
      title: "Khung tập Squat Half Cage GymLife Pro",
      slug: "khung-tap-squat-half-cage-gymlife-pro",
      description: "Hệ thống khung gánh tạ Squat kiên cố tích hợp xà đơn đa năng, thanh bắt giữ an toàn tự động điều chỉnh độ cao linh hoạt.",
      productType: "equipment",
      price: 6200000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.9,
        reviewsCount: 45,
        inStock: true,
        originalPrice: 7000000,
        sizes: ["Lắp ráp"],
        keyStats: [
          { label: "Tải trọng", value: "500kg" },
          { label: "Khung thép", value: "50x50mm" }
        ]
      }
    },
    {
      title: "Bánh tạ Gang Olympic Iron Plate 10kg",
      slug: "banh-ta-gang-olympic-iron-plate-10kg",
      description: "Bánh tạ gang đúc nguyên khối lỗ phi 50 chuyên dùng cho đòn tạ Olympic, bề mặt mài nhẵn sơn phủ tĩnh điện chống va đập han rỉ.",
      productType: "equipment",
      price: 450000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 180,
        inStock: true,
        sizes: ["10 kg"],
        keyStats: [
          { label: "Chất liệu", value: "Gang đúc" },
          { label: "Độ rộng lỗ", value: "50mm" }
        ]
      }
    },
    {
      title: "Bánh tạ cao su giảm chấn Bumper Plate 15kg",
      slug: "banh-ta-cao-su-giam-chan-bumper-plate-15kg",
      description: "Đĩa tạ cao su giảm chấn có độ đàn hồi tự nhiên cao giúp giảm thiểu tiếng ồn và tránh nứt vỡ mặt sàn khi thực hiện các bài thả tạ.",
      productType: "equipment",
      price: 1150000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.8,
        reviewsCount: 65,
        inStock: true,
        sizes: ["15 kg"],
        keyStats: [
          { label: "Chất liệu", value: "Cao su tự nhiên" },
          { label: "Độ dày", value: "70mm" }
        ]
      }
    },
    {
      title: "Ghế dốc tập cơ bụng bụng gấp gọn",
      slug: "ghe-doc-tap-co-bun-bung-gap-gon",
      description: "Ghế tập cơ bụng chuyên nghiệp có thiết kế gấp gọn tiện lợi, thanh gác chân bọc mút xốp đệm dày chống tổn thương cổ chân.",
      productType: "equipment",
      price: 1250000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.6,
        reviewsCount: 140,
        inStock: true,
        sizes: ["Gấp gọn"],
        keyStats: [
          { label: "Tải trọng", value: "150kg" },
          { label: "Chất liệu", value: "Thép tĩnh điện" }
        ]
      }
    },
    {
      title: "Con lăn tập cơ bụng AB Roller 4 bánh xe",
      slug: "con-lan-tap-co-bun-ab-roller-4-banh-xe",
      description: "Con lăn cơ bụng cải tiến với cấu trúc 4 bánh thăng bằng vững chắc và tích hợp hệ thống lò xo tự động trợ lực phản hồi thông minh.",
      productType: "equipment",
      price: 290000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 320,
        inStock: true,
        sizes: ["4 bánh"],
        keyStats: [
          { label: "Lò xo trợ lực", value: "Có" },
          { label: "Số bánh xe", value: "4 bánh" }
        ]
      }
    },
    {
      title: "Tạ tay lục giác Hex Dumbbell cao su 10kg",
      slug: "ta-tay-luc-giac-hex-dumbbell-cao-su-10kg",
      description: "Tạ đơn lục giác bọc cao su chống lăn, chống ồn hiệu quả. Tay cầm mạ chrome tạo vân nhám bám chắc tay khi thực hiện đẩy tạ nặng.",
      productType: "equipment",
      price: 480000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.8,
        reviewsCount: 290,
        inStock: true,
        sizes: ["Quả 10kg"],
        keyStats: [
          { label: "Chất liệu", value: "Cao su & Thép" },
          { label: "Kiểu dáng", value: "Lục giác chống lăn" }
        ]
      }
    },
    {
      title: "Tạ ấm Kettlebell cao cấp bọc cao su 8kg",
      slug: "ta-am-kettlebell-cao-cap-boc-cao-su-8kg",
      description: "Tạ bình vôi đúc gang bọc cao su, tay cầm thiết kế rộng thoải mái giúp thực hiện trơn tru các bài vung tạ swing hoặc squat.",
      productType: "equipment",
      price: 380000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catThietBi.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 165,
        inStock: true,
        sizes: ["8 kg"],
        keyStats: [
          { label: "Chất liệu", value: "Gang bọc cao su" },
          { label: "Thiết kế tay", value: "Đúc liền tay cầm" }
        ]
      }
    },

    // === 3. PHỤ KIỆN (10 sản phẩm) ===
    {
      title: "Thảm tập Yoga Lululemon 5mm định tuyến",
      slug: "tham-tap-yoga-lululemon-5mm-dinh-tuyen",
      description: "Thảm tập định tuyến chất liệu cao su tự nhiên cao cấp với độ bám dính cực đỉnh chống trơn trượt tối đa ngay cả khi đổ mồ hôi.",
      productType: "accessory",
      price: 1850000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Lululemon",
        rating: 4.9,
        reviewsCount: 340,
        inStock: true,
        originalPrice: 2100000,
        flavors: ["Đen", "Hồng phấn"],
        sizes: ["5mm"],
        keyStats: [
          { label: "Chất liệu", value: "Cao su tự nhiên" },
          { label: "Kích thước", value: "180 x 66 cm" },
          { label: "Độ dày thảm", value: "5mm" }
        ]
      }
    },
    {
      title: "Găng tay tập gym chuyên nghiệp Harbinger Pro",
      slug: "gang-tay-tap-gym-chuyen-nghiep-harbinger-pro",
      description: "Găng tay thể thao hở ngón hỗ trợ băng quấn bảo vệ cổ tay và lòng bàn tay khỏi chai sần, đệm mút lót êm ái chống phồng rộp tay.",
      productType: "accessory",
      price: 420000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Harbinger",
        rating: 4.8,
        reviewsCount: 185,
        inStock: true,
        flavors: ["Đen", "Xanh Dương"],
        sizes: ["M", "L"],
        keyStats: [
          { label: "Chất liệu", value: "Da & Mesh thoáng khí" },
          { label: "Thiết kế quấn", value: "Có băng bảo vệ cổ tay" }
        ]
      }
    },
    {
      title: "Bộ 5 dây kháng lực cao su Resistance Loops",
      slug: "bo-5-day-khang-luc-cao-su-resistance-loops",
      description: "Dây chun tập mông đùi mini band đa năng, 5 cấp độ lực từ nhẹ đến siêu nặng hỗ trợ hiệu quả cho các bài tập kích hoạt cơ.",
      productType: "accessory",
      price: 190000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 450,
        inStock: true,
        flavors: ["Bộ 5 dây"],
        keyStats: [
          { label: "Chất liệu", value: "Cao su Latex" },
          { label: "Lực kháng", value: "10 - 40 lbs" }
        ]
      }
    },
    {
      title: "Bình lắc giữ nhiệt Shaker Inox 700ml",
      slug: "binh-lac-giu-nhiet-shaker-inox-700ml",
      description: "Bình pha sữa whey đạm giữ nhiệt inox 304 hai lớp giữ lạnh lên đến 12 tiếng, thiết kế nắp khóa gài chặt chẽ chống rò rỉ nước.",
      productType: "accessory",
      price: 350000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.8,
        reviewsCount: 220,
        inStock: true,
        flavors: ["Bạc Inox", "Đen Nhám"],
        sizes: ["700 ml"],
        keyStats: [
          { label: "Chất liệu", value: "Inox 304 cao cấp" },
          { label: "Giữ nhiệt", value: "12 giờ" }
        ]
      }
    },
    {
      title: "Dây đai kéo lưng Lifting Straps da bò thật",
      slug: "day-dai-keo-lung-lifting-straps-da-bo-that",
      description: "Dây quấn kéo lưng hỗ trợ lực bám tay cầm cực tốt cho các bài tập kéo như Deadlift, Lat Pulldown giúp hạn chế mỏi cẳng tay.",
      productType: "accessory",
      price: 260000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 90,
        inStock: true,
        sizes: ["Freesize"],
        keyStats: [
          { label: "Chất liệu", value: "Da bò thật 100%" },
          { label: "Chiều dài", value: "60cm" }
        ]
      }
    },
    {
      title: "Đai lưng tập gym da bò Valeo chuyên nghiệp",
      slug: "dai-lung-tap-gym-da-bo-valeo-chuyen-nghiep",
      description: "Đai đỡ lưng cứng bảo vệ cột sống an toàn tuyệt đối khi tập luyện các bài squat hoặc deadlift khối lượng tạ cực nặng.",
      productType: "accessory",
      price: 680000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Valeo",
        rating: 4.8,
        reviewsCount: 160,
        inStock: true,
        originalPrice: 750000,
        sizes: ["S", "M", "L"],
        keyStats: [
          { label: "Chất liệu", value: "Da bò 4 lớp" },
          { label: "Độ dày đai", value: "10mm" }
        ]
      }
    },
    {
      title: "Dây nhảy thể lực cán nhôm tốc độ cao",
      slug: "day-nhay-the-luc-can-nhom-toc-do-cao",
      description: "Dây nhảy thể thao cán nhôm CNC có tích hợp ổ bi xoay 360 độ siêu mượt và dây cáp thép bọc nhựa có thể căn chỉnh độ dài tùy ý.",
      productType: "accessory",
      price: 180000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.6,
        reviewsCount: 195,
        inStock: true,
        flavors: ["Đen", "Đỏ"],
        keyStats: [
          { label: "Cáp lõi thép", value: "Có" },
          { label: "Ổ bi xoay", value: "360 độ" }
        ]
      }
    },
    {
      title: "Ống con lăn giãn cơ foam roller gai massage",
      slug: "ong-con-lan-gian-co-foam-roller-gai-massage",
      description: "Ống foam roller mát-xa giãn cơ bắp sau khi tập luyện giúp thúc đẩy tuần hoàn máu và rút ngắn thời gian phục hồi cơ nhức mỏi.",
      productType: "accessory",
      price: 220000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 110,
        inStock: true,
        flavors: ["Xanh dương", "Đen"],
        keyStats: [
          { label: "Chất liệu", value: "Nhựa EVA cao cấp" },
          { label: "Kích thước", value: "33 x 14 cm" }
        ]
      }
    },
    {
      title: "Băng bảo vệ đầu gối Knee Sleeves 7mm",
      slug: "bang-bao-ve-dau-goi-knee-sleeves-7mm",
      description: "Cặp bó gối chất liệu cao su Neoprene dày 7mm hỗ trợ nâng đỡ cố định khớp gối vững chắc khi gánh tạ nặng.",
      productType: "accessory",
      price: 490000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.8,
        reviewsCount: 75,
        inStock: true,
        sizes: ["Cặp size M", "Cặp size L"],
        keyStats: [
          { label: "Độ dày bó gối", value: "7mm" },
          { label: "Chất liệu", value: "Neoprene cao cấp" }
        ]
      }
    },
    {
      title: "Túi trống thể thao chống nước ngăn giày riêng",
      slug: "tui-trong-the-thao-chong-nuoc-ngan-giay-rieng",
      description: "Túi tập gym thể thao du lịch có trang bị ngăn chứa giày bẩn riêng biệt bên hông và khoang chống thấm đựng quần áo ướt.",
      productType: "accessory",
      price: 380000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 215,
        inStock: true,
        flavors: ["Đen", "Xám"],
        keyStats: [
          { label: "Thể tích túi", value: "35L" },
          { label: "Vải Oxford", value: "Chống nước nhẹ" }
        ]
      }
    },

    // === 4. TRANG PHỤC (10 sản phẩm) ===
    {
      title: "Áo sát nách nam tập gym Under Armour Active",
      slug: "ao-sat-nach-nam-tap-gym-under-armour-active",
      description: "Thiết kế áo Tank Top nam ôm dáng thể thao năng động, chất liệu polyester thun lạnh co giãn 4 chiều cực mát và khô nhanh.",
      productType: "apparel",
      price: 290000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Under Armour",
        rating: 4.8,
        reviewsCount: 160,
        inStock: true,
        originalPrice: 350000,
        flavors: ["Đen", "Xám"],
        sizes: ["M", "L", "XL"],
        keyStats: [
          { label: "Chất liệu", value: "90% Poly, 10% Spandex" },
          { label: "Công nghệ", value: "HeatGear thoáng mát" }
        ]
      }
    },
    {
      title: "Quần đùi nam tập gym 2 lớp Nike Flex Shorts",
      slug: "quan-dui-nam-tap-gym-2-lop-nike-flex-shorts",
      description: "Quần short nam co giãn, bên trong tích hợp lớp sịp đùi thun mỏng co giãn chống cọ xát đùi và hỗ trợ thoát mồ hôi tối đa khi chạy bộ.",
      productType: "apparel",
      price: 350000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 4.7,
        reviewsCount: 225,
        inStock: true,
        flavors: ["Đen", "Xanh Rêu"],
        sizes: ["M", "L", "XL"],
        keyStats: [
          { label: "Kiểu dáng", value: "2 lớp tích hợp" },
          { label: "Công nghệ vải", value: "Dri-FIT" }
        ]
      }
    },
    {
      title: "Áo ngực thể thao nâng ngực chuyên dụng Nike Indy Bra",
      slug: "ao-nguc-the-thao-nang-nguc-chuyen-dung-nike-indy-bra",
      description: "Áo bra thể thao nữ nâng đỡ ngực nhẹ nhàng thoải mái khi vận động tập yoga, tập gym. Thiết kế dây vai mảnh chéo lưng trẻ trung.",
      productType: "apparel",
      price: 450000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 4.8,
        reviewsCount: 95,
        inStock: true,
        flavors: ["Hồng phấn", "Đen"],
        sizes: ["S", "M", "L"],
        keyStats: [
          { label: "Mức nâng đỡ", value: "Nhẹ (Light Support)" },
          { label: "Chất liệu", value: "Dri-FIT" }
        ]
      }
    },
    {
      title: "Quần Legging thể thao nữ cạp cao Adidas Techfit",
      slug: "quan-legging-the-thao-nu-cap-cao-adidas-techfit",
      description: "Quần thun ôm nữ cạp cao giúp định hình thon gọn vòng eo, chất vải thun co giãn hỗ trợ cơ và tôn dáng nâng mông săn chắc.",
      productType: "apparel",
      price: 580000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Adidas",
        rating: 4.8,
        reviewsCount: 140,
        inStock: true,
        flavors: ["Đen", "Xanh đen"],
        sizes: ["S", "M", "L"],
        keyStats: [
          { label: "Cạp quần", value: "Cạp cao thon eo" },
          { label: "Công nghệ", value: "AEROREADY" }
        ]
      }
    },
    {
      title: "Áo khoác gió thể thao nhẹ Nike Windrunner",
      slug: "ao-khoac-gio-the-thao-nhe-nike-windrunner",
      description: "Áo khoác dù gió mỏng cản gió và chống nước mưa phùn nhẹ, thiết kế khóa kéo toàn thân tiện lợi khi chạy bộ ngoài trời sáng sớm.",
      productType: "apparel",
      price: 850000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 4.9,
        reviewsCount: 65,
        inStock: true,
        originalPrice: 980000,
        flavors: ["Đen-Trắng", "Xanh Navy"],
        sizes: ["M", "L", "XL"],
        keyStats: [
          { label: "Chất liệu", value: "Dù gió siêu nhẹ" },
          { label: "Kháng nước", value: "Mưa phùn nhẹ" }
        ]
      }
    },
    {
      title: "Áo thun ngắn tay co giãn 4 chiều Gymshark Dry-Fit",
      slug: "ao-thun-ngan-tay-co-gian-4-chieu-gymshark-dry-fit",
      description: "Áo phông thể thao nam ôm ngực vai khoe cơ bắp, công nghệ dệt seamless không đường may hạn chế cọ xát kích ứng da khi vận động mạnh.",
      productType: "apparel",
      price: 320000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Gymshark",
        rating: 4.8,
        reviewsCount: 180,
        inStock: true,
        flavors: ["Xám nhạt", "Đen"],
        sizes: ["M", "L", "XL"],
        keyStats: [
          { label: "Công nghệ dệt", value: "Seamless không đường may" },
          { label: "Co giãn", value: "4 chiều" }
        ]
      }
    },
    {
      title: "Set 3 đôi vớ cổ cao thể thao Nike Cushion Crew",
      slug: "set-3-doi-vo-co-cao-the-thao-nike-cushion-crew",
      description: "Đôi tất dệt kim dày dặn lót đệm êm ái dưới lòng bàn chân hỗ trợ giảm chấn, vải thấm hút mồ hôi ôm khít cổ chân.",
      productType: "apparel",
      price: 150000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 4.7,
        reviewsCount: 310,
        inStock: true,
        flavors: ["Trắng", "Đen"],
        sizes: ["Freesize co giãn"],
        keyStats: [
          { label: "Đóng gói", value: "Set 3 đôi tất" },
          { label: "Độ cao vớ", value: "Cổ cao bắp chân" }
        ]
      }
    },
    {
      title: "Quần jogger nỉ thể thao co giãn thoải mái",
      slug: "quan-jogger-ni-the-thao-co-gian-thoai-mai",
      description: "Quần jogger nam chất nỉ co giãn mềm mại, bo chun cổ chân gọn gàng tôn dáng khỏe khoắn, thích hợp cả đi tập lẫn đi chơi.",
      productType: "apparel",
      price: 380000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "GymLife",
        rating: 4.7,
        reviewsCount: 150,
        inStock: true,
        flavors: ["Xám đậm", "Đen"],
        sizes: ["M", "L", "XL"],
        keyStats: [
          { label: "Chất liệu", value: "Nỉ cotton mềm mịn" },
          { label: "Khóa túi", value: "Túi khóa kéo an toàn" }
        ]
      }
    },
    {
      title: "Áo Crop Top thun gân thể thao nữ năng động",
      slug: "ao-crop-top-thun-gan-the-thao-nu-nang-dong",
      description: "Áo thun lửng croptop thun gân ôm sát co giãn cực tốt giúp khoe vòng eo thon gọn và tôn nét khỏe khoắn khi tập gym.",
      productType: "apparel",
      price: 240000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "GymLife",
        rating: 4.8,
        reviewsCount: 120,
        inStock: true,
        flavors: ["Trắng sữa", "Đen"],
        sizes: ["S", "M"],
        keyStats: [
          { label: "Kiểu dáng", value: "Croptop ôm eo" },
          { label: "Vải dệt", value: "Thun gân tăm cao cấp" }
        ]
      }
    },
    {
      title: "Băng đô chặn mồ hôi trán Adidas Headband",
      slug: "bang-do-chan-mo-hoi-tran-adidas-headband",
      description: "Băng trán vải bông thun siêu thấm hút mồ hôi cản trở nước chảy vào mắt khi tập luyện, giữ tóc gọn gàng tập trung.",
      productType: "apparel",
      price: 120000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?q=80&w=600",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Adidas",
        rating: 4.7,
        reviewsCount: 220,
        inStock: true,
        flavors: ["Đen thêu logo", "Trắng thêu logo"],
        sizes: ["Freesize co giãn"],
        keyStats: [
          { label: "Chất liệu", value: "Vải bông thun dệt" },
          { label: "Thấm hút", value: "Siêu hút nước" }
        ]
      }
    },

    // === 5. CHƯƠNG TRÌNH TẬP LUYỆN (10 sản phẩm) ===
    {
      title: "Lộ trình tập luyện tăng cơ 12 tuần cho người mới",
      slug: "lo-trinh-tap-luyen-tang-co-12-tuan-cho-nguoi-moi",
      description: "Giáo án tập luyện chi tiết từng ngày, hướng dẫn trực quan bằng hình ảnh và video cho người mới bắt đầu tập gym.",
      productType: "program",
      price: 199000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.8,
        reviewsCount: 420,
        inStock: true,
        sizes: ["12 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Tăng cơ nạc" },
          { label: "Độ khó", value: "Người mới bắt đầu (Beginner)" },
          { label: "Số buổi/tuần", value: "4 buổi" }
        ]
      }
    },
    {
      title: "Giáo án giảm mỡ siết cơ cường độ cao 8 tuần",
      slug: "giao-an-giam-mo-siet-co-cuong-do-cao-8-tuan",
      description: "Lịch tập HIIT kết hợp tập kháng lực chuyên sâu giúp đốt cháy mỡ thừa tối đa mà vẫn giữ vững lượng cơ bắp nạc.",
      productType: "program",
      price: 249000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.9,
        reviewsCount: 290,
        inStock: true,
        sizes: ["8 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Giảm mỡ siết cơ" },
          { label: "Độ khó", value: "Trung cấp (Intermediate)" },
          { label: "Số buổi/tuần", value: "5 buổi" }
        ]
      }
    },
    {
      title: "Lịch tập Powerlifting tăng sức mạnh tối đa 6 tuần",
      slug: "lich-tap-powerlifting-tang-suc-manh-toi-da-6-tuan",
      description: "Lộ trình cải thiện 3 bài nâng chính Squat, Bench Press, Deadlift một cách khoa học và bài bản nhất.",
      productType: "program",
      price: 299000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.9,
        reviewsCount: 150,
        inStock: true,
        sizes: ["6 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Tăng sức mạnh (Strength)" },
          { label: "Độ khó", value: "Nâng cao (Advanced)" },
          { label: "Bài tập chính", value: "SBD Focus" }
        ]
      }
    },
    {
      title: "Giáo trình Calisthenics làm chủ trọng lượng cơ thể",
      slug: "giao-trinh-calisthenics-lam-chu-trong-luong-co-the",
      description: "Tập luyện thể hình đường phố từ các bước cơ bản nhất đến các tư thế nâng cao như Handstand, Muscle-up.",
      productType: "program",
      price: 189000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.7,
        reviewsCount: 185,
        inStock: true,
        sizes: ["10 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Linh hoạt & Kiểm soát thân" },
          { label: "Dụng cụ", value: "Xà đơn, xà kép, đất trống" }
        ]
      }
    },
    {
      title: "Chương trình tập luyện tại nhà không cần dụng cụ",
      slug: "chuong-trinh-tap-luyen-tai-nha-khong-can-dung-cu",
      description: "Giáo án 30 ngày tập luyện tại nhà giúp bạn duy trì vóc dáng, nâng cao sức bền tim mạch chỉ bằng trọng lượng cơ thể.",
      productType: "program",
      price: 99000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.6,
        reviewsCount: 650,
        inStock: true,
        sizes: ["30 ngày"],
        keyStats: [
          { label: "Mục tiêu", value: "Thể lực & Săn chắc" },
          { label: "Dụng cụ", value: "Không yêu cầu (Bodyweight)" }
        ]
      }
    },
    {
      title: "Lịch tập HIIT đốt mỡ thần tốc 4 tuần",
      slug: "lich-tap-hiit-dot-mo-than-toc-4-tuan",
      description: "Các chuỗi bài tập cường độ cao ngắt quãng giúp đẩy nhịp tim lên tối đa, tối ưu hóa trao đổi chất suốt 24h sau tập.",
      productType: "program",
      price: 129000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.8,
        reviewsCount: 380,
        inStock: true,
        sizes: ["4 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Đốt mỡ siêu tốc" },
          { label: "Thời gian", value: "20 - 30 phút/buổi" }
        ]
      }
    },
    {
      title: "Giáo trình tập Yoga phục hồi và dẻo dai cơ khớp",
      slug: "giao-trinh-tap-yoga-phuc-hoi-va-deo-dai-co-khop",
      description: "Các chuỗi bài tập căng cơ sâu giúp mở khớp hông, giãn cột sống lưng dưới và phục hồi hệ thần kinh.",
      productType: "program",
      price: 149000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.7,
        reviewsCount: 190,
        inStock: true,
        sizes: ["6 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Trị liệu & Dẻo dai" },
          { label: "Độ khó", value: "Tất cả cấp độ" }
        ]
      }
    },
    {
      title: "Lộ trình độ mông đùi quả đào chuyên sâu 6 tuần",
      slug: "lo-trinh-do-mong-dui-qua-dao-chuyen-sau-6-tuan",
      description: "Giáo trình thiết kế đặc biệt tập trung tối ưu hóa các chuyển động kích hoạt cơ mông đùi căng tròn quyến rũ.",
      productType: "program",
      price: 179000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.9,
        reviewsCount: 320,
        inStock: true,
        sizes: ["6 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Phát triển mông đùi" },
          { label: "Đối tượng", value: "Nữ giới (Female)" }
        ]
      }
    },
    {
      title: "Chương trình tập Cardio cải thiện sức bền tim mạch",
      slug: "chuong-trinh-tap-cardio-cai-thien-suc-ben-tim-mach",
      description: "Giáo trình chạy bộ nâng cao ngưỡng chịu đựng của hệ tuần hoàn, tăng dung tích phổi hiệu quả.",
      productType: "program",
      price: 159000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.7,
        reviewsCount: 145,
        inStock: true,
        sizes: ["8 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Sức bền hệ tim mạch" },
          { label: "Hình thức", value: "Chạy bộ / Đạp xe" }
        ]
      }
    },
    {
      title: "Lịch tập phục hồi cơ bắp và chống chấn thương",
      slug: "lich-tap-phuc-hoi-co-bap-va-chong-chan-thuong",
      description: "Tập hợp các bài tập bổ trợ nhóm cơ yếu và tăng độ ổn định của ổ khớp vai, cổ chân, lưng dưới.",
      productType: "program",
      price: 119000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=600",
      status: "active",
      categoryId: catChuongTrinh.id,
      metadata: {
        brand: "GymLife Coach",
        rating: 4.8,
        reviewsCount: 112,
        inStock: true,
        sizes: ["4 tuần"],
        keyStats: [
          { label: "Mục tiêu", value: "Phòng ngừa chấn thương" },
          { label: "Dụng cụ", value: "Miniband, bóng tập" }
        ]
      }
    },

    // === 6. THỰC ĐƠN & DINH DƯỠNG (10 sản phẩm) ===
    {
      title: "Thực đơn tăng cơ 30 ngày giàu đạm",
      slug: "thuc-don-tang-co-30-ngay-giau-dam",
      description: "Thực đơn tính toán calories chuẩn chỉnh hỗ trợ tăng cơ nách tối đa mà hạn chế tích lũy mỡ thừa cơ thể.",
      productType: "meal_plan",
      price: 149000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.8,
        reviewsCount: 520,
        inStock: true,
        sizes: ["30 ngày"],
        keyStats: [
          { label: "Mục tiêu", value: "Tăng cơ nách (Lean Bulk)" },
          { label: "Calories trung bình", value: "2500 - 2800 kcal" },
          { label: "Tỉ lệ protein", value: "30% tổng năng lượng" }
        ]
      }
    },
    {
      title: "Kế hoạch ăn uống thâm hụt calo giảm mỡ 30 ngày",
      slug: "ke-hoach-an-uong-tham-hut-calo-giam-mo-30-ngay",
      description: "Thực đơn cắt giảm calo an toàn, đủ chất xơ và đạm để duy trì năng lượng tập luyện năng động suốt cả ngày.",
      productType: "meal_plan",
      price: 149000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.7,
        reviewsCount: 610,
        inStock: true,
        sizes: ["30 ngày"],
        keyStats: [
          { label: "Mục tiêu", value: "Giảm cân giảm mỡ" },
          { label: "Calories trung bình", value: "1500 - 1800 kcal" }
        ]
      }
    },
    {
      title: "Chế độ ăn kiêng Keto giảm mỡ nhanh 21 ngày",
      slug: "che-do-an-kieng-keto-giam-mo-nhanh-21-ngay",
      description: "Thực đơn giàu chất béo tốt và hạn chế tối đa carb giúp cơ thể chuyển đổi năng lượng đốt mỡ nhanh chóng.",
      productType: "meal_plan",
      price: 189000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.6,
        reviewsCount: 220,
        inStock: true,
        sizes: ["21 ngày"],
        keyStats: [
          { label: "Phương pháp", value: "Ketogenic Diet" },
          { label: "Hạn chế tinh bột", value: "Dưới 50g Carb/ngày" }
        ]
      }
    },
    {
      title: "Thực đơn ăn chay bổ sung dinh dưỡng thể thao",
      slug: "thuc-don-an-chay-bo-sung-dinh-duong-the-thao",
      description: "Sự kết hợp các nguồn protein thực vật chất lượng cao giúp gymer ăn chay duy trì và phát triển cơ bắp khỏe mạnh.",
      productType: "meal_plan",
      price: 159000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.8,
        reviewsCount: 140,
        inStock: true,
        sizes: ["30 ngày"],
        keyStats: [
          { label: "Chế độ", value: "Ăn chay thuần (Vegan/Vegetarian)" },
          { label: "Nguồn protein", value: "Đậu, hạt, ngũ cốc" }
        ]
      }
    },
    {
      title: "Cẩm nang pha chế sinh tố tăng cơ giàu năng lượng",
      slug: "cam-nang-pha-che-sinh-to-tang-co-giau-nang-luong",
      description: "Tập hợp các công thức pha chế Smoothie thơm ngon cùng Whey protein, bữa phụ hoàn hảo cho gymer bận rộn.",
      productType: "meal_plan",
      price: 79000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.7,
        reviewsCount: 380,
        inStock: true,
        sizes: ["Ebook công thức"],
        keyStats: [
          { label: "Thể loại", value: "Sinh tố dinh dưỡng" },
          { label: "Số công thức", value: "50+ công thức" }
        ]
      }
    },
    {
      title: "Thực đơn Eat Clean lành mạnh cải thiện vóc dáng",
      slug: "thuc-don-eat-clean-lanh-manh-cai-thien-voc-dang",
      description: "Thực đơn chế biến tối giản giữ trọn vẹn chất dinh dưỡng giúp cơ thể nhẹ nhàng, thanh lọc độc tố hiệu quả.",
      productType: "meal_plan",
      price: 129000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.8,
        reviewsCount: 295,
        inStock: true,
        sizes: ["30 ngày"],
        keyStats: [
          { label: "Nguyên tắc", value: "Hạn chế đồ chế biến sẵn" },
          { label: "Calo mỗi bữa", value: "400 - 500 kcal" }
        ]
      }
    },
    {
      title: "Kế hoạch chuẩn bị bữa ăn tuần tiết kiệm thời gian",
      slug: "ke-hoach-chuan-bi-bua-an-tuan-tiet-kiem-thoi-gian",
      description: "Học cách nấu ăn hàng loạt (Meal prep) và trữ đông thực phẩm khoa học, tiết kiệm chi phí và thời gian vào bếp.",
      productType: "meal_plan",
      price: 99000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.7,
        reviewsCount: 420,
        inStock: true,
        sizes: ["Cẩm nang hướng dẫn"],
        keyStats: [
          { label: "Mô hình", value: "Chuẩn bị bữa ăn tuần (Meal Prep)" },
          { label: "Công thức", value: "Nấu nhanh dưới 30 phút" }
        ]
      }
    },
    {
      title: "Chế độ ăn Intermittent Fasting nhịn ăn gián đoạn",
      slug: "che-do-an-intermittent-fasting-nhin-an-gian-doan",
      description: "Hướng dẫn thực hiện chế độ nhịn ăn gián đoạn 16/8 khoa học giúp cơ thể tái tạo tế bào và tăng tốc đốt mỡ.",
      productType: "meal_plan",
      price: 119000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.6,
        reviewsCount: 190,
        inStock: true,
        sizes: ["Lịch ăn 16/8"],
        keyStats: [
          { label: "Khung giờ ăn", value: "12:00 PM - 8:00 PM" },
          { label: "Lợi ích", value: "Độ nhạy insulin" }
        ]
      }
    },
    {
      title: "Thực đơn tăng cân tự nhiên cho người gầy",
      slug: "thuc-don-tang-can-tu-nhien-cho-nguoi-gay",
      description: "Thực đơn giàu dinh dưỡng dễ tiêu hóa, kích thích ăn ngon miệng hỗ trợ tăng cân tự nhiên, an toàn khỏe mạnh.",
      productType: "meal_plan",
      price: 139000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.8,
        reviewsCount: 260,
        inStock: true,
        sizes: ["30 ngày"],
        keyStats: [
          { label: "Calories trung bình", value: "3000+ kcal" },
          { label: "Mục tiêu", value: "Tăng cân lành mạnh" }
        ]
      }
    },
    {
      title: "Cẩm nang dinh dưỡng phục hồi sau chấn thương",
      slug: "cam-nang-dinh-duong-phuc-hoi-sau-chan-thuong",
      description: "Bổ sung các nhóm thực phẩm kháng viêm tự nhiên đẩy nhanh tốc độ liền cơ và tái tạo tế bào dây chằng.",
      productType: "meal_plan",
      price: 169000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600",
      status: "active",
      categoryId: catThucDon.id,
      metadata: {
        brand: "GymLife Nutrition",
        rating: 4.7,
        reviewsCount: 88,
        inStock: true,
        sizes: ["Ebook cẩm nang"],
        keyStats: [
          { label: "Chất kháng viêm", value: "Omega-3, Vitamin C" },
          { label: "Lợi ích", value: "Giảm sưng khớp" }
        ]
      }
    },

    // === 7. TÀI LIỆU & SÁCH (10 sản phẩm) ===
    {
      title: "Ebook giải phẫu kỹ thuật tập luyện kháng lực",
      slug: "ebook-giai-phau-ky-thuat-tap-luyen-khang-luc",
      description: "Sách phân tích chuyển động xương khớp chi tiết, giúp bạn hiểu rõ cơ chế kích hoạt của từng bài tập Gym cụ thể.",
      productType: "ebook",
      price: 299000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.9,
        reviewsCount: 380,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Giải phẫu cơ bắp" },
          { label: "Định dạng", value: "PDF & Epub" },
          { label: "Số trang", value: "280 trang" }
        ]
      }
    },
    {
      title: "Cẩm nang tự thiết kế giáo án tập luyện cá nhân",
      slug: "cam-nang-tu-thiet-ke-giao-an-tap-luyen-ca-nhan",
      description: "Hướng dẫn chi tiết cách tính Volume tập luyện, cách thiết lập tuần suất tập phù hợp với lịch sinh hoạt cá nhân.",
      productType: "ebook",
      price: 219000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.8,
        reviewsCount: 220,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Thiết kế giáo án" },
          { label: "Nội dung chính", value: "Volume & Frequency" }
        ]
      }
    },
    {
      title: "Khoa học về dinh dưỡng đa lượng Macronutrients",
      slug: "khoa-hoc-ve-dinh-duong-da-luong-macronutrients",
      description: "Hiểu sâu về Protein, Carb, Fat để tự do điều chỉnh chế độ ăn uống linh hoạt mà không bị gò bó bởi thực đơn cố định.",
      productType: "ebook",
      price: 179000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.8,
        reviewsCount: 195,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Khoa học dinh dưỡng" },
          { label: "Chủ đề", value: "Macro & Micronutrients" }
        ]
      }
    },
    {
      title: "Sách hướng dẫn kỹ thuật thở và gồng bụng core",
      slug: "sach-huong-dan-ky-thuat-tho-va-gong-bung-core",
      description: "Làm chủ kỹ thuật thở Valsalva Maneuver và cách gồng cơ bụng core để bảo vệ cột sống thắt lưng khi đẩy tạ nặng.",
      productType: "ebook",
      price: 129000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.7,
        reviewsCount: 165,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Kỹ thuật hơi thở" },
          { label: "Ứng dụng", value: "Squat, Deadlift, Overhead Press" }
        ]
      }
    },
    {
      title: "Cẩm nang trị liệu vai gáy cột sống cho dân văn phòng",
      slug: "cam-nang-tri-lieu-vai-gay-cot-song-cho-dan-van-phong",
      description: "Các bài tập giãn cơ chữa gù lưng, võng lưng và cải thiện tư thế đứng ngồi cho những người ngồi máy tính nhiều.",
      productType: "ebook",
      price: 159000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.8,
        reviewsCount: 310,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Trị liệu tư thế" },
          { label: "Chủ đề", value: "Upper/Lower Cross Syndrome" }
        ]
      }
    },
    {
      title: "Tâm lý học trong tập luyện và duy trì kỷ luật",
      slug: "tam-ly-hoc-trong-tap-luyen-va-duy-tri-ky-luat",
      description: "Làm thế nào để chiến thắng trì hoãn, xây dựng mục tiêu tập luyện rõ ràng và duy trì lối sống lành mạnh bền vững.",
      productType: "ebook",
      price: 149000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.8,
        reviewsCount: 140,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Phát triển bản thân" },
          { label: "Mục tiêu", value: "Kỷ luật & Thói quen" }
        ]
      }
    },
    {
      title: "Sách hướng dẫn sử dụng thực phẩm bổ sung khoa học",
      slug: "sach-huong-dan-su-dung-thuc-pham-bo-sung-khoa-hoc",
      description: "Phân tích trung lập các loại thực phẩm bổ sung hiện nay, giúp bạn hiểu rõ cơ chế tác dụng để tránh lãng phí tiền bạc.",
      productType: "ebook",
      price: 189000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.7,
        reviewsCount: 220,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Supplement Science" },
          { label: "Ứng dụng", value: "ON/OFF cycle hướng dẫn" }
        ]
      }
    },
    {
      title: "Cẩm nang tăng cơ giảm mỡ đồng thời Body Recomp",
      slug: "cam-nang-tang-co-giam-mo-dong-thoi-body-recomp",
      description: "Phương pháp dinh dưỡng thâm hụt nhẹ và tập luyện kháng lực để đồng thời tăng cơ nạc và siết mỡ cơ thể hiệu quả.",
      productType: "ebook",
      price: 229000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.9,
        reviewsCount: 155,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Tái cấu trúc cơ thể (Body Recomposition)" },
          { label: "Đối tượng", value: "Gymer sơ & trung cấp" }
        ]
      }
    },
    {
      title: "Sách hướng dẫn kỹ thuật Cardio tối ưu hóa đốt mỡ",
      slug: "sach-huong-dan-ky-thuat-cardio-toi-uu-hoa-dot-mo",
      description: "Cách phối hợp các buổi tập Cardio (LISS/HIIT) vào lịch tập tạ mà không ảnh hưởng xấu tới kích thước cơ bắp nạc.",
      productType: "ebook",
      price: 139000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.8,
        reviewsCount: 110,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Cardio tối ưu" },
          { label: "Nội dung", value: "HIIT vs LISS" }
        ]
      }
    },
    {
      title: "Tài liệu kiểm soát giấc ngủ và phục hồi cơ bắp",
      slug: "tai-lieu-kiem-soat-giac-ngu-va-phuc-hoi-co-bap",
      description: "Tầm quan trọng của giấc ngủ sâu (NREM/REM) đối với hoạt động tiết hormone tăng trưởng tự nhiên và phục hồi cơ bắp.",
      productType: "ebook",
      price: 169000,
      currency: "VND",
      tempImageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600",
      status: "active",
      categoryId: catTaiLieu.id,
      metadata: {
        brand: "GymLife Library",
        rating: 4.7,
        reviewsCount: 160,
        inStock: true,
        sizes: ["Tài liệu PDF"],
        keyStats: [
          { label: "Thể loại", value: "Phục hồi giấc ngủ" },
          { label: "Chủ đề", value: "Sleep hygiene & circadian rhythm" }
        ]
      }
    }
  ];

  console.log(`🚀 Starting Cloudinary upload and DB insertion for ${productsToSeed.length} items...`);

  let count = 0;
  for (const item of productsToSeed) {
    count++;
    console.log(`[${count}/${productsToSeed.length}] Uploading image for: "${item.title}"...`);
    
    let finalImageUrl = item.tempImageUrl;
    try {
      // Upload remote image URL directly to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(item.tempImageUrl, {
        folder: "LoongMilkGym_APP/products",
      });
      finalImageUrl = uploadResult.secure_url;
      console.log(`   Uploaded image. Cloudinary URL: ${finalImageUrl}`);
    } catch (uploadErr) {
      console.error(`   ❌ Failed to upload image to Cloudinary (using fallback):`, uploadErr.message);
    }

    // Insert into database
    await prisma.product.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        productType: item.productType,
        price: item.price,
        currency: item.currency,
        thumbnailUrl: finalImageUrl,
        status: item.status,
        categoryId: item.categoryId,
        metadata: item.metadata
      }
    });

    console.log(`   ✅ Successfully seeded product: "${item.title}"`);
  }

  console.log("🎉 Seeding products finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
