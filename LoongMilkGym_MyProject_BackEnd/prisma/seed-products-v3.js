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
  console.log("🌱 Starting database cleaning and seeding (30 premium products across 3 categories)...");

  // 1. Clear existing dependent records and products
  console.log("🧹 Clearing old product database records...");
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productAsset.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("✅ Cleared old product records.");

  // 2. Clear unused categories
  console.log("🧹 Clearing unused categories...");
  await prisma.productCategory.deleteMany({
    where: {
      slug: {
        notIn: ["dinh-duong", "phu-kien", "trang-phuc"]
      }
    }
  });
  console.log("✅ Cleared unused categories.");

  // 3. Seed/Get 3 remaining categories
  const catDinhDuong = await prisma.productCategory.upsert({
    where: { slug: "dinh-duong" },
    update: { name: "Dinh dưỡng" },
    create: { name: "Dinh dưỡng", slug: "dinh-duong" },
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

  console.log("✅ All 3 categories prepared.");

  // 4. Define 30 products
  const productsToSeed = [
    // === 1. DINH DƯỠNG (10 sản phẩm) ===
    {
      title: "Optimum Nutrition Gold Standard 100% Whey",
      slug: "optimum-nutrition-gold-standard-100-whey",
      description: "Bột đạm whey protein tinh khiết hấp thụ nhanh hàng đầu thế giới, hỗ trợ phát triển và duy trì cơ bắp nạc tối ưu sau các buổi tập luyện cường độ cao.",
      productType: "supplement",
      price: 950000,
      currency: "VND",
      imageUrl: "https://www.optimumnutrition.com/cdn/shop/files/on-1153850_Image_01.jpg?v=1756452646&width=2000",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Optimum Nutrition",
        rating: 5.0,
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
      imageUrl: "https://www.ruleoneproteins.com/cdn/shop/files/r1pwi_1.5lb_chocolate-fudge-front.png?v=1777910719&width=1920",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Rule 1",
        rating: 5.0,
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
      imageUrl: "https://www.myprotein.com.sg/images?url=https://static.thcdn.com/productimg/original/17725536-1165323074763386.png&format=webp&auto=avif&width=450&height=450&fit=crop",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Myprotein",
        rating: 5.0,
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
      imageUrl: "https://www.muscletech.com/cdn/shop/files/MuscleTech-NitroTech-Whey-Gold-2000x2000-01a_new.jpg?v=1753903525&width=2000",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "MuscleTech",
        rating: 5.0,
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
      imageUrl: "https://www.gobsn.com/cdn/shop/files/bsn-1064587_Image_01.png?v=1761239439&width=800",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "BSN",
        rating: 5.0,
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
      imageUrl: "https://dymatize.co.in/assets/img/fpo/hydrolyzed/dyma-tub.png",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Dymatize",
        rating: 5.0,
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
      imageUrl: "https://cellucor.com/cdn/shop/files/C4AN_1002_Brand_C4YellowLabel_Transition_C4Original_CoreFlavors_BasicPDPs-OG-IBR-Hero-Grey.png?v=1773235672&width=1946",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Cellucor",
        rating: 5.0,
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
      imageUrl: "https://www.optimumnutrition.com/cdn/shop/files/creatine-green-tile.jpg?v=1767727731&width=1400",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Optimum Nutrition",
        rating: 5.0,
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
      imageUrl: "https://cellucor.com/cdn/shop/files/XTEND_1144_Digital_Relabel_FlowThrough_Assets_PDPs_OnGreyBackground-XTEND-OG30-BRI.png?v=1771552623&width=1946",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "Scivation",
        rating: 5.0,
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
      imageUrl: "https://www.muscletech.com/cdn/shop/files/masstech-extreme-chocolate-front.jpg?v=1755023871",
      status: "active",
      categoryId: catDinhDuong.id,
      metadata: {
        brand: "MuscleTech",
        rating: 5.0,
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

    // === 2. PHỤ KIỆN (10 sản phẩm) ===
    {
      title: "Thảm tập Yoga Lululemon 5mm định tuyến",
      slug: "tham-tap-yoga-lululemon-5mm-dinh-tuyen",
      description: "Thảm tập định tuyến chất liệu cao su tự nhiên cao cấp với độ bám dính cực đỉnh chống trơn trượt tối đa ngay cả khi đổ mồ hôi.",
      productType: "accessory",
      price: 1850000,
      currency: "VND",
      imageUrl: "https://images.lululemon.com/is/image/lululemon/LU9CJ7S_0001_1?size=1200%2C1200",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Lululemon",
        rating: 5.0,
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
      imageUrl: "https://harbingerfitness.com/cdn/shop/files/ecsnummte17w97k9pvul.jpg?v=1744912834&width=1200",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Harbinger",
        rating: 5.0,
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
      imageUrl: "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_limit%2Cw_1200%2Cb_rgb%3Af8f8f8/catalog/Strength%20Equipment/Training%20Accessories%20/Bands/LOOPBANDS/LOOPBANDS-H_ouze47.png",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Rogue",
        rating: 5.0,
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
      imageUrl: "https://www.blenderbottle.com/cdn/shop/products/radian-insulated-stainless-steel-radian-black-169344.png?v=1762439661&width=1200",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "BlenderBottle",
        rating: 5.0,
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
      imageUrl: "https://harbingerfitness.com/cdn/shop/files/a1fzcg23bs9x3gfxm4kv_1bf34c43-7107-46b2-89d9-82e465c45b9e.jpg?v=1745268066&width=1200",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Harbinger",
        rating: 5.0,
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
      imageUrl: "https://www.valeobelts.com/wp-content/uploads/2025/12/81WVgB2OphL._AC_SX679_.jpg",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Valeo",
        rating: 5.0,
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
      imageUrl: "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_limit%2Cw_1200%2Cb_rgb%3Af8f8f8/catalog/Conditioning/Jump%20Ropes%20/SR%20Series/%20SR-2/AD0097/AD0097-3-Black-H_lcrzbi.png",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Rogue",
        rating: 5.0,
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
      imageUrl: "https://tptherapy.com/cdn/shop/files/avk4obj6lgnfhzjw3vyj.jpg?v=1750694296&width=1200",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "TriggerPoint",
        rating: 5.0,
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
      imageUrl: "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_limit%2Cw_1200%2Cb_rgb%3Af8f8f8/catalog/Straps%20Wraps%20and%20Support%20/Protection%20and%20Supports/Knee/TEC0023-BLK/TEC0023-BLK-H_b09zhl.png",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Rogue",
        rating: 5.0,
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
      imageUrl: "https://underarmour.scene7.com/is/image/Underarmour/1369222-410_SLF_SL?bgc=F0F0F0&hei=1200&qlt=85&resmode=sharp2&wid=1200",
      status: "active",
      categoryId: catPhuKien.id,
      metadata: {
        brand: "Under Armour",
        rating: 5.0,
        reviewsCount: 215,
        inStock: true,
        flavors: ["Đen", "Xám"],
        keyStats: [
          { label: "Thể tích túi", value: "35L" },
          { label: "Vải Oxford", value: "Chống nước nhẹ" }
        ]
      }
    },

    // === 3. TRANG PHỤC (10 sản phẩm) ===
    {
      title: "Áo sát nách nam tập gym Under Armour Active",
      slug: "ao-sat-nach-nam-tap-gym-under-armour-active",
      description: "Thiết kế áo Tank Top nam ôm dáng thể thao năng động, chất liệu polyester thun lạnh co giãn 4 chiều cực mát và khô nhanh.",
      productType: "apparel",
      price: 290000,
      currency: "VND",
      imageUrl: "https://underarmour.scene7.com/is/image/Underarmour/V5-1382802-410_FC?bgc=f0f0f0&hei=1000&op_usm=1.75%2C0.3%2C2%2C0&qlt=85&rp=standard-0pad%7Cpdp&wid=800",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Under Armour",
        rating: 5.0,
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
      imageUrl: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/9d1b849b-2dc9-46f8-8e43-d7ef2bd88d75/M%2BNK%2BDF%2BSTRIDE%2B2IN1%2B5IN%2BSHORT.png",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 5.0,
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
      imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/8cd15c46-0c65-43ab-9b7a-3bb9b5ce1fcb/AS%2BW%2BNK%2BDF%2BINDY%2BLGT%2BSPT%2BBRA.png",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 5.0,
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
      imageUrl: "https://assets.adidas.com/images/w_1000%2Cf_auto%2Cq_auto/b33c987e006c4e28a6e7d28fd5c656f9_9366/TECHFIT_Long_Tights_Black_JL6888_21_model.jpg",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Adidas",
        rating: 5.0,
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
      imageUrl: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/59309824-19d9-4a1c-9879-7d71909243db/AS%2BM%2BNK%2BWR%2BLND%2BJKT%2B26.png",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 5.0,
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
      imageUrl: "https://cdn.shopify.com/s/files/1/1367/5207/files/images-SpeedReplacementT_ShirtGSBlackA3C2S_BB2J_0088_3840x.jpg?v=1756243778",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Gymshark",
        rating: 5.0,
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
      imageUrl: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/dfa68bbe-e102-4e33-9b6e-6763e2a75f19/U%2BNK%2BEVERYDAY%2BCSH%2BCRW%2B3PR%2B132.png",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 5.0,
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
      imageUrl: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/e4b872ee-53b1-4004-b1ee-98fb12ee7e5d/M%2BNK%2BCLUB%2BBB%2BJGGR%2BREISSUE.png",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Nike",
        rating: 5.0,
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
      imageUrl: "https://cdn.shopify.com/s/files/1/1367/5207/files/RibbedCottonCropTopGSMochaMauveGSBlackB3C2W-NC1Z-2752_A-1194_3840x.jpg?v=1743026151",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Gymshark",
        rating: 5.0,
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
      imageUrl: "https://assets.adidas.com/images/w_1000%2Cf_auto%2Cq_auto/0a10490c125845109fceafa2012ec5c1_9366/Interval_Reversible_Headband_Black_GC3552_01_standard.jpg",
      status: "active",
      categoryId: catTrangPhuc.id,
      metadata: {
        brand: "Adidas",
        rating: 5.0,
        reviewsCount: 220,
        inStock: true,
        flavors: ["Đen thêu logo", "Trắng thêu logo"],
        sizes: ["Freesize co giãn"],
        keyStats: [
          { label: "Chất liệu", value: "Vải bông thun dệt" },
          { label: "Thấm hút", value: "Siêu hút nước" }
        ]
      }
    }
  ];

  console.log(`🚀 Starting Cloudinary upload and DB insertion for ${productsToSeed.length} items...`);

  let count = 0;
  for (const item of productsToSeed) {
    count++;
    console.log(`[${count}/${productsToSeed.length}] Uploading image for: "${item.title}"...`);
    
    let finalImageUrl = item.imageUrl;
    try {
      // Upload remote image URL directly to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(item.imageUrl, {
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
