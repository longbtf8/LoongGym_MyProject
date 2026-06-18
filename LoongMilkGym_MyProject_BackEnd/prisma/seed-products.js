require("dotenv/config");
const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seeding digital products...");

  // 1. Seed Product Categories
  const category1 = await prisma.productCategory.upsert({
    where: { slug: "thuc-don-dinh-duong" },
    update: {},
    create: {
      name: "Thực đơn & Dinh dưỡng",
      slug: "thuc-don-dinh-duong",
    },
  });

  const category2 = await prisma.productCategory.upsert({
    where: { slug: "tai-lieu-sach" },
    update: {},
    create: {
      name: "Tài liệu & Sách",
      slug: "tai-lieu-sach",
    },
  });

  const category3 = await prisma.productCategory.upsert({
    where: { slug: "chuong-trinh-tap-luyen" },
    update: {},
    create: {
      name: "Chương trình tập luyện",
      slug: "chuong-trinh-tap-luyen",
    },
  });

  console.log("✅ Seeded Categories:", {
    "Thực đơn & Dinh dưỡng": category1.id,
    "Tài liệu & Sách": category2.id,
    "Chương trình tập luyện": category3.id,
  });

  // 2. Seed Products
  const productsData = [
    {
      title: "Thực Đơn Tăng Cơ 30 Ngày",
      slug: "thuc-don-tang-co-30-ngay",
      description: "Thực đơn dinh dưỡng chi tiết 30 ngày giúp tăng cơ nách, tối ưu lượng đạm.",
      productType: "meal_plan",
      price: 199000,
      currency: "VND",
      thumbnailUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400",
      status: "active",
      categoryId: category1.id,
    },
    {
      title: "Giải Phẫu Kỹ Thuật Tập Luyện",
      slug: "giai-phau-ky-thuat-tap-luyen",
      description: "Ebook phân tích chi tiết chuyển động và giải phẫu các nhóm cơ trong tập luyện kháng lực.",
      productType: "ebook",
      price: 299000,
      currency: "VND",
      thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400",
      status: "active",
      categoryId: category2.id,
    },
    {
      title: "Chương Trình Đốt Mỡ 12 Tuần",
      slug: "chuong-trinh-dot-mo-12-tuan",
      description: "Giáo án tập luyện cường độ cao 12 tuần giúp tối ưu hoá lượng calo tiêu thụ và giảm mỡ thừa.",
      productType: "program",
      price: 399000,
      currency: "VND",
      thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400",
      status: "active",
      categoryId: category3.id,
    },
    {
      title: "Meal Plan Giảm Mỡ",
      slug: "meal-plan-giam-mo",
      description: "Kế hoạch ăn uống khoa học thâm hụt calo giúp giảm mỡ hiệu quả mà không mệt mỏi.",
      productType: "meal_plan",
      price: 149000,
      currency: "VND",
      thumbnailUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400",
      status: "active",
      categoryId: category1.id,
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        productType: item.productType,
        price: item.price,
        currency: item.currency,
        thumbnailUrl: item.thumbnailUrl,
        status: item.status,
        categoryId: item.categoryId,
      },
      create: item,
    });
    console.log(`✅ Seeded Product: ${product.title} (${product.id})`);
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
