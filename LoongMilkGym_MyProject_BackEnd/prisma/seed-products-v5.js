require("dotenv/config");
const { PrismaClient } = require("../generated/prisma");
const cloudinary = require("cloudinary").v2;

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  console.log("🌱 Starting seed (V5) - Reverting titles and slugs to Vietnamese, preserving specs and assets...");

  // 1. Clear existing dependent records and products
  console.log("🧹 Clearing old product database records...");
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productAsset.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("✅ Cleared old product records.");

  // 2. Fetch Category IDs
  const catDinhDuong = await prisma.productCategory.findUnique({ where: { slug: "dinh-duong" } });
  const catPhuKien = await prisma.productCategory.findUnique({ where: { slug: "phu-kien" } });
  const catTrangPhuc = await prisma.productCategory.findUnique({ where: { slug: "trang-phuc" } });

  if (!catDinhDuong || !catPhuKien || !catTrangPhuc) {
    throw new Error("Categories must exist before running this script.");
  }

  // 3. Define 30 products with Vietnamese titles/slugs, metadata and additional images
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
        flavors: ["Cinnamon Roll"],
        sizes: ["1.5 lb / 682 g"],
        keyStats: [
          { label: "Protein", value: "24g" },
          { label: "BCAAs", value: "5.5g" },
          { label: "Khẩu phần", value: "22 servings" }
        ]
      },
      additionalImages: [
        "https://www.optimumnutrition.com/cdn/shop/files/Ingredients_GSW_Product_Image_AU.png?v=1763339262&width=801",
        "https://www.optimumnutrition.com/cdn/shop/files/Nick_Cheadle_Product_Image_AU.jpg?v=1763339262&width=2400"
      ]
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
        flavors: ["Chocolate Fudge"],
        sizes: ["1.48 lb / 672 g"],
        keyStats: [
          { label: "Protein", value: "25g" },
          { label: "Sugar", value: "0g" },
          { label: "Khẩu phần", value: "21 servings" }
        ]
      },
      additionalImages: []
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
        flavors: ["Reduced Sweetness Coffee / Cà phê ít ngọt"],
        sizes: ["1 kg"],
        keyStats: [
          { label: "Protein", value: "21g" },
          { label: "Khẩu phần", value: "33 servings; 30 g mỗi serving" }
        ]
      },
      additionalImages: [
        "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQmlpBAUawOj5RC0XI350hwMzxZ6cSPUAFO_MocavRx3g3DE7-AUbTEDCbTrSkLOhMEXfCFQ9YoVeBuavxUCcIa3tMlXiNDfq1VWiY1z5s"
      ]
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
        flavors: ["Double Rich Chocolate"],
        sizes: ["2 lb / 907 g"],
        keyStats: [
          { label: "Protein", value: "30g" },
          { label: "Khẩu phần", value: "Khoảng 27 servings; 33 g mỗi serving" }
        ]
      },
      additionalImages: [
        "https://international.muscletech.com/wp-content/uploads/2022/06/mt-int-nitro-tech-100-whey-gold-ultra-premium.jpg",
        "https://international.muscletech.com/wp-content/uploads/2022/06/muscletech-int-nitro-tech-100-whey-gold-how-to-use.jpg"
      ]
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
        flavors: ["Chocolate Milkshake"],
        sizes: ["2.91 lb / 1.32 kg"],
        keyStats: [
          { label: "Protein", value: "22g" },
          { label: "Khẩu phần", value: "28 servings" }
        ]
      },
      additionalImages: [
        "https://www.gobsn.com/cdn/shop/files/Group_633170_1.png?v=1761842558&width=2568",
        "https://www.gobsn.com/cdn/shop/files/image_46.png?v=1761779981&width=1440"
      ]
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
        flavors: ["Gourmet Chocolate"],
        sizes: ["Hộp 20 servings"],
        keyStats: [
          { label: "Protein", value: "25g" },
          { label: "Khẩu phần", value: "20 servings; 1 muỗng khoảng 32 g" }
        ]
      },
      additionalImages: [
        "https://dymatize.imgix.net/production/products/Hero_Product_Line_Page_Dymatize_Website_Desktop_ISO100_3840x2156_2024-01-16-170605_irvq.jpg?ar=3840%3A1170&auto=format%2Ccompress&fit=crop&ixlib=php-3.1.0&l=1078&w=1920",
        "https://dymatize.imgix.net/production/headers/DYMA_CMC_ISO100_PDP_Center_Image_3840x2104.jpg?ar=3840%3A1170&auto=format%2Ccompress&fit=crop&ixlib=php-3.1.0&l=1052&w=1920"
      ]
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
        flavors: ["Icy Blue Razz"],
        sizes: ["Hộp 30 servings"],
        keyStats: [
          { label: "Caffeine", value: "150mg" },
          { label: "Khẩu phần", value: "30 servings" }
        ]
      },
      additionalImages: [
        "https://cellucor.com/cdn/shop/files/C4AN_1002_Brand_C4YellowLabel_Transition_C4Original_CoreFlavors_StylizedPDPs-OG-IBR-Benefits.png?v=1775660947&width=1946",
        "https://cellucor.com/cdn/shop/files/C4AN_1002_Brand_C4YellowLabel_Transition_C4Original_CoreFlavors_BasicPDPs-OG-IBR-OldVsNew.png?v=1776700205&width=1946"
      ]
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
        flavors: [],
        sizes: ["0.79 lb / khoảng 358 g"],
        keyStats: [
          { label: "Creatine", value: "5g" },
          { label: "Khẩu phần", value: "60 servings; 5 g creatine mỗi serving" }
        ]
      },
      additionalImages: [
        "https://www.optimumnutrition.com/cdn/shop/files/ON_Creatine_Product_Playground_02_1x1_85eeb6a1-538a-4416-9c3d-a278d04106a7.jpg?v=1766415938&width=1080"
      ]
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
        flavors: ["Blue Raspberry Ice"],
        sizes: ["Hộp 30 servings"],
        keyStats: [
          { label: "BCAAs", value: "7g" },
          { label: "Khẩu phần", value: "30 servings; 7 g BCAA mỗi serving" }
        ]
      },
      additionalImages: [
        "https://cellucor.com/cdn/shop/files/XTEND_1144_Digital_Relabel_FlowThrough_PDPs_DTC_XtendOriginalXtendOriginal30-Benefits-BRI_v2.png?v=1776889426&width=1946",
        "https://cellucor.com/cdn/shop/files/XTEND_1144_Digital_Relabel_FlowThrough_PDPs_DTC_XtendOriginal30_BenefitsLifestyle-Flavor-BRI.png?v=1776889352&width=1946"
      ]
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
        flavors: ["Triple Chocolate Brownie"],
        sizes: ["6 lb / khoảng 2.72 kg"],
        keyStats: [
          { label: "Protein", value: "60g" },
          { label: "Khẩu phần", value: "Khoảng 5 servings đầy đủ; khoảng 569 g mỗi serving" }
        ]
      },
      additionalImages: [
        "https://www.muscletech.com/cdn/shop/files/masstech-extreme-pack-on-extreme-size.jpg?v=1761574352"
      ]
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
        flavors: ["Black / Đen"],
        sizes: ["One Size; khoảng 66 × 180 cm; dày 5 mm"],
        keyStats: [
          { label: "Chất liệu", value: "Cao su tự nhiên" },
          { label: "Độ dày thảm", value: "5mm" }
        ]
      },
      additionalImages: [
        "https://images.lululemon.com/is/image/lululemon/LU9CJ7S_0001_4?size=1200%2C1200",
        "https://images.lululemon.com/is/image/lululemon/LU9CJ7S_0001_1?size=1200%2C1200"
      ]
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
        flavors: ["Black / Đen"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        keyStats: [
          { label: "Chất liệu", value: "Da & Mesh thoáng khí" },
          { label: "Thiết kế quấn", value: "Có băng bảo vệ cổ tay" }
        ]
      },
      additionalImages: [
        "https://harbingerfitness.com/cdn/shop/files/HARB_16281_F_Pro_Gloves_3.0_Mens_Black_LS02_240523_No_Tattoos-2000x1304-c06912e.jpg?v=1745256236&width=1200",
        "https://harbingerfitness.com/cdn/shop/files/HARB_16281_F_Pro_Gloves_3.0_Mens_Black_LS07_240523_No_Tattoos-2000x1383-a809554.jpg?v=1745256236&width=1200"
      ]
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
        flavors: ["Orange", "Red", "Blue", "Green", "Black", "Purple"],
        sizes: ["Chiều dài 9 inch hoặc 12 inch; rộng khoảng 2 inch"],
        keyStats: [
          { label: "Chất liệu", value: "Cao su Latex" }
        ]
      },
      additionalImages: [
        "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_fill%2Cw_1200%2Ch_1200%2Cg_east%2Cb_rgb%3Af8f8f8/catalog/Strength%20Equipment/Training%20Accessories%20/Bands/LOOPBANDS/LOOPBANDS-H_ouze47.png"
      ]
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
        flavors: ["Black / Đen"],
        sizes: ["26 oz / khoảng 769 ml; 3.66 × 9.92 inch"],
        keyStats: [
          { label: "Chất liệu", value: "Inox 304 cao cấp" },
          { label: "Giữ nhiệt", value: "12 giờ" }
        ]
      },
      additionalImages: [
        "https://www.blenderbottle.com/cdn/shop/products/radian-insulated-stainless-steel-radian-black-237358.png?v=1720636207&width=1200",
        "https://www.blenderbottle.com/cdn/shop/files/accordion_main_desktop_4.jpg?v=1628543779&width=1920"
      ]
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
        flavors: ["Brown leather / Black padding"],
        sizes: ["One Size; dài 21 inch; rộng 1.5 inch"],
        keyStats: [
          { label: "Chất liệu", value: "Da bò thật 100%" }
        ]
      },
      additionalImages: []
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
        flavors: ["Tan/Brown leather và Black padding"],
        sizes: ["XS–XXL; bản đai rộng 4 inch"],
        keyStats: [
          { label: "Chất liệu", value: "Da bò 4 lớp" },
          { label: "Độ dày đai", value: "10mm" }
        ]
      },
      additionalImages: [
        "https://www.valeobelts.com/wp-content/uploads/2025/12/81WVgB2OphL._AC_SX679_.jpg"
      ]
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
        flavors: ["Black handles / Red cable"],
        sizes: ["Dây dài 120 inch, có thể điều chỉnh; tay cầm dài 6.75 inch"],
        keyStats: [
          { label: "Cáp lõi thép", value: "Có" },
          { label: "Ổ bi xoay", value: "360 độ" }
        ]
      },
      additionalImages: [
        "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_limit%2Cw_1200%2Cb_rgb%3Af8f8f8/catalog/Conditioning/Jump%20Ropes%20/SR%20Series/%20SR-2/AD0097/AD0097-3-Black-H_lcrzbi.png",
        "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_limit%2Cw_1200%2Cb_rgb%3Af8f8f8/catalog/Conditioning/Jump%20Ropes%20/SR%20Series/%20SR-2/AD0097/AD0097-3-H_qdjwmt.png"
      ]
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
        flavors: ["Black / Đen"],
        sizes: ["13 × 5.5 × 5.5 inch / khoảng 33 × 14 × 14 cm"],
        keyStats: [
          { label: "Chất liệu", value: "Nhựa EVA cao cấp" }
        ]
      },
      additionalImages: [
        "https://tptherapy.com/cdn/shop/files/uylfulrqzptxjyjh9vrr.jpg?v=1750694296&width=1200",
        "https://tptherapy.com/cdn/shop/files/v8s6rdo27rd2wt6f6psq.jpg?v=1750694296&width=1200"
      ]
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
        flavors: ["Black / Đen"],
        sizes: ["XS", "S", "M", "L", "XL"],
        keyStats: [
          { label: "Độ dày bó gối", value: "7mm" },
          { label: "Chất liệu", value: "Neoprene cao cấp" }
        ]
      },
      additionalImages: [
        "https://assets.roguefitness.com/f_auto%2Cq_auto%2Cc_fill%2Cw_1200%2Ch_1200%2Cg_east%2Cb_rgb%3Af8f8f8/catalog/Straps%20Wraps%20and%20Support%20/Protection%20and%20Supports/Knee/TEC0023-BLK/TEC0023-BLK-H_b09zhl.png"
      ]
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
        flavors: ["Midnight Navy / Metallic Silver"],
        sizes: ["Small; 40 lít; khoảng 21.7 × 10.6 × 10.1 inch"],
        keyStats: [
          { label: "Thể tích túi", value: "40L" }
        ]
      },
      additionalImages: [
        "https://underarmour.scene7.com/is/image/Underarmour/1369222-001_SLB_SL?bgc=f0f0f0&hei=1000&op_usm=1.75%2C0.3%2C2%2C0&qlt=85&rp=standard-0pad%7Cpdp&wid=800",
        "https://underarmour.scene7.com/is/image/Underarmour/1369222-001_SLINT_SL?bgc=f0f0f0&hei=1000&op_usm=1.75%2C0.3%2C2%2C0&qlt=85&rp=standard-0pad%7Cpdp&wid=800"
      ]
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
        flavors: ["Midnight Navy; mã màu 410"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        keyStats: [
          { label: "Chất liệu", value: "90% Poly, 10% Spandex" },
          { label: "Công nghệ", value: "HeatGear thoáng mát" }
        ]
      },
      additionalImages: [
        "https://underarmour.scene7.com/is/image/Underarmour/V5-1382802-001_BC?bgc=F0F0F0&cache=on%2Con&fmt=jpg&hei=708&qlt=85&resMode=sharp2&rp=standard-0pad%7CpdpMainDesktop&scl=1&size=566%2C708&wid=566",
        "https://underarmour.scene7.com/is/image/Underarmour/PS1382802-001_HF?bgc=F0F0F0&cache=on%2Con&fmt=jpg&hei=708&qlt=85&resMode=sharp2&rp=standard-0pad%7CpdpMainDesktop&scl=1&size=566%2C708&wid=566"
      ]
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
        flavors: ["Light Crimson; mã IF2034-696"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL; ống trong 5 inch"],
        keyStats: [
          { label: "Kiểu dáng", value: "2 lớp tích hợp" },
          { label: "Công nghệ vải", value: "Dri-FIT" }
        ]
      },
      additionalImages: [
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/5023d27b-af68-4965-ac71-401e32a3367d/M%2BNK%2BDF%2BSTRIDE%2B2IN1%2B5IN%2BSHORT.png",
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/4aa6e108-fe44-49e0-bcc5-c0d47d4bcaae/M%2BNK%2BDF%2BSTRIDE%2B2IN1%2B5IN%2BSHORT.png"
      ]
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
        flavors: ["Black / Black / White; mã FD1063-011"],
        sizes: ["XS", "S", "M", "L", "XL"],
        keyStats: [
          { label: "Mức nâng đỡ", value: "Nhẹ (Light Support)" },
          { label: "Chất liệu", value: "Dri-FIT" }
        ]
      },
      additionalImages: []
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
        flavors: ["Black / Đen"],
        sizes: ["Mẫu ảnh người mẫu mặc size S; size bán thực tế tùy thị trường"],
        keyStats: [
          { label: "Cạp quần", value: "Cạp cao thon eo" },
          { label: "Công nghệ", value: "AEROREADY" }
        ]
      },
      additionalImages: [
        "https://assets.adidas.com/images/w_1000%2Cf_auto%2Cq_auto/8a7dc9cb631645ae8916f43478fa4f85_9366/Interval_Reversible_Headband_Black_GC3552_23_hover_model.jpg",
        "https://assets.adidas.com/images/w_1000%2Cf_auto%2Cq_auto/bd212ff7b0204fba9b11e1e2626d8068_9366/TECHFIT_Long_Tights_Black_JL6888_25_model.jpg"
      ]
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
        flavors: ["Light Iron Ore / Sail / Sail; mã HV8370-012"],
        sizes: ["XS", "S", "M", "L", "XL", "2XL"],
        keyStats: [
          { label: "Chất liệu", value: "Dù gió siêu nhẹ" },
          { label: "Kháng nước", value: "Mưa phùn nhẹ" }
        ]
      },
      additionalImages: [
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/3b94feed-5146-4899-895f-fd6c8f34da96/AS%2BM%2BNK%2BWR%2BLND%2BJKT%2B26.png",
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/6c26b84b-0601-4d4a-aa92-633bb901c7bf/AS%2BM%2BNK%2BWR%2BLND%2BJKT%2B26.png"
      ]
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
        flavors: ["Black / Đen"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        keyStats: [
          { label: "Công nghệ dệt", value: "Seamless không đường may" },
          { label: "Co giãn", value: "4 chiều" }
        ]
      },
      additionalImages: [
        "https://cdn.shopify.com/s/files/1/1367/5207/files/images-FindYourSpeedT_ShirtGSBlackA3B5X_BB2J_0044_V2_3840x.jpg?v=1763562360",
        "https://cdn.shopify.com/s/files/1/1367/5207/files/images-FindYourSpeedT_ShirtGSBlackA3B5X_BB2J_0050_V2_3840x.jpg?v=1763562360"
      ]
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
        flavors: ["White / Black; mã SX7664-100"],
        sizes: ["EU 34–38; 38–42; 42–46; 46–50"],
        keyStats: [
          { label: "Đóng gói", value: "Set 3 đôi tất" },
          { label: "Độ cao vớ", value: "Cổ cao bắp chân" }
        ]
      },
      additionalImages: [
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/1726a26d-9cc2-4cc6-95bc-a3a9db37df07/U%2BNK%2BEVERYDAY%2BCSH%2BCRW%2B3PR%2B132.png",
        "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/dfa68bbe-e102-4e33-9b6e-6763e2a75f19/U%2BNK%2BEVERYDAY%2BCSH%2BCRW%2B3PR%2B132.png"
      ]
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
        flavors: ["Sequoia / Sequoia / Light Khaki; mã HV1393-355"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        keyStats: [
          { label: "Chất liệu", value: "Nỉ cotton mềm mịn" },
          { label: "Khóa túi", value: "Túi khóa kéo an toàn" }
        ]
      },
      additionalImages: [
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/88d84ef0-0b7a-446f-aa04-99c9529a1522/M%2BNK%2BCLUB%2BBB%2BJGGR%2BREISSUE.png",
        "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto%2Cq_auto%3Aeco/b6d9f9fa-0475-4b6b-ab13-d46fe90c9210/M%2BNK%2BCLUB%2BBB%2BJGGR%2BREISSUE.png"
      ]
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
        flavors: ["Mocha Mauve / Black; mã B3C2W-NC1Z"],
        sizes: ["XXS", "XS", "S", "M", "L", "XL", "XXL"],
        keyStats: [
          { label: "Kiểu dáng", value: "Croptop ôm eo" },
          { label: "Vải dệt", value: "Thun gân tăm cao cấp" }
        ]
      },
      additionalImages: [
        "https://cdn.shopify.com/s/files/1/1367/5207/files/RibbedCottonCropTopGSMochaMauve-GSBlackB3C2W-NC1Z-1018-1196_3840x.jpg?v=1743026151",
        "https://cdn.shopify.com/s/files/1/1367/5207/files/RibbedCottonCropTopGSMochaMauve-GSBlackB3C2W-NC1Z-1009-1195_3840x.jpg?v=1743026151"
      ]
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
        flavors: ["Black / White, dùng được hai mặt"],
        sizes: ["One Size; khoảng 9.5 × 3 inch"],
        keyStats: [
          { label: "Chất liệu", value: "Vải bông thun dệt" },
          { label: "Thấm hút", value: "Siêu hút nước" }
        ]
      },
      additionalImages: [
        "https://assets.adidas.com/images/w_1000%2Cf_auto%2Cq_auto/f82389a5045c4e7ebcffafa20130ab85_9366/Interval_Reversible_Headband_Black_GC3552_02_standard_hover.jpg",
        "https://assets.adidas.com/images/w_1000%2Cf_auto%2Cq_auto/0354f97ab7c64c22aa931f6f359c846a_9366/Interval_Reversible_Headband_Black_GC3552_25_outfit.jpg"
      ]
    }
  ];

  console.log(`🚀 Starting Cloudinary upload and DB insertion for ${productsToSeed.length} items...`);

  let count = 0;
  for (const item of productsToSeed) {
    count++;
    console.log(`[${count}/${productsToSeed.length}] Uploading main image for: "${item.title}"...`);
    
    let finalImageUrl = item.imageUrl;
    try {
      // Upload remote main image URL directly to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(item.imageUrl, {
        folder: "LoongMilkGym_APP/products",
      });
      finalImageUrl = uploadResult.secure_url;
      console.log(`   Uploaded main image. Cloudinary URL: ${finalImageUrl}`);
    } catch (uploadErr) {
      console.error(`   ❌ Failed to upload main image (using fallback):`, uploadErr.message);
    }

    // Insert Product into database
    const createdProduct = await prisma.product.create({
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

    console.log(`   ✅ Created product: "${item.title}"`);

    // Handle additional images (ProductAsset)
    if (item.additionalImages && item.additionalImages.length > 0) {
      let assetIndex = 0;
      for (const additionalUrl of item.additionalImages) {
        assetIndex++;
        console.log(`   └─ Uploading asset image ${assetIndex} for: "${item.title}"...`);
        try {
          const uploadAssetResult = await cloudinary.uploader.upload(additionalUrl, {
            folder: "LoongMilkGym_APP/product_assets",
          });
          const assetUrl = uploadAssetResult.secure_url;
          
          await prisma.productAsset.create({
            data: {
              productId: createdProduct.id,
              assetType: "image",
              title: `${item.title} - Asset ${assetIndex}`,
              fileUrl: assetUrl
            }
          });
          console.log(`      Uploaded & linked asset: ${assetUrl}`);
        } catch (assetErr) {
          console.error(`      ❌ Failed to upload asset ${assetIndex}:`, assetErr.message);
        }
      }
    }
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
