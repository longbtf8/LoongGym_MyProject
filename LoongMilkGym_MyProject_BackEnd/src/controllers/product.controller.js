const productsService = require("@/services/products.service");
const { httpCodes } = require("@/config/constants");

/**
 * Lấy danh sách sản phẩm mở bán
 */
const getProducts = async (req, res, next) => {
  try {
    const queryParams = req.validated.query;
    const result = await productsService.getProducts(queryParams);
    return res.success(result, httpCodes.success, "Lấy danh sách sản phẩm thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết sản phẩm qua Slug
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.validated.params;
    const result = await productsService.getProductBySlug(slug);
    return res.success(result, httpCodes.success, "Lấy chi tiết sản phẩm thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
};
