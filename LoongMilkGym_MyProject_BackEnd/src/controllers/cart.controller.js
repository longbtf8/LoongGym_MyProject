const cartService = require("@/services/cart.service");
const { httpCodes } = require("@/config/constants");

/**
 * Lấy giỏ hàng hiện tại của người dùng
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await cartService.getCart(userId);
    return res.success(result, httpCodes.success, "Lấy thông tin giỏ hàng thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 */
const addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.validated.body;
    
    const result = await cartService.addItemToCart(userId, productId, quantity);
    return res.success(result, httpCodes.created, "Đã thêm sản phẩm vào giỏ hàng.");
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.validated.params.id;
    const { quantity } = req.validated.body;

    const result = await cartService.updateCartItem(userId, cartItemId, quantity);
    return res.success(result, httpCodes.success, "Cập nhật số lượng thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
const removeItemFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.validated.params.id;

    const result = await cartService.removeItemFromCart(userId, cartItemId);
    return res.success(result, httpCodes.success, "Đã xóa sản phẩm khỏi giỏ hàng.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
};
