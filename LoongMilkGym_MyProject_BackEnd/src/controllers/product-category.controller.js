const productCategoriesService = require("@/services/product-categories.service");
const { httpCodes } = require("@/config/constants");

/**
 * Controller quản lý danh mục sản phẩm (Product Categories)
 */
const getCategories = async (req, res, next) => {
  try {
    const result = await productCategoriesService.getCategories();
    return res.success(result, httpCodes.success, "Lấy danh sách danh mục sản phẩm thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
};
