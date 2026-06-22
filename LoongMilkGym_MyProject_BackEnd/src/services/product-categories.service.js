const { prisma } = require("@/lib/prisma");

/**
 * Service lấy danh sách tất cả các danh mục sản phẩm
 */
const getCategories = async () => {
  return await prisma.productCategory.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

module.exports = {
  getCategories,
};
