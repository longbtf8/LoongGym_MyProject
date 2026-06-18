const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");

/**
 * Lấy danh sách sản phẩm số (chỉ lấy những sản phẩm active)
 */
const getProducts = async (queryParams) => {
  const { search, type, categorySlug, page, limit } = queryParams;

  const where = {
    status: "active",
  };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (type) {
    where.productType = type;
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug,
    };
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const total = await prisma.product.count({ where });

  const data = await prisma.product.findMany({
    where,
    skip,
    take,
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Lấy chi tiết sản phẩm qua Slug
 */
const getProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      assets: true,
    },
  });

  if (!product || product.status !== "active") {
    throw new AppError("Không tìm thấy sản phẩm hoặc sản phẩm không ở trạng thái mở bán.", httpCodes.notFound);
  }

  return product;
};

module.exports = {
  getProducts,
  getProductBySlug,
};
