const express = require("express");
const router = express.Router();
const cartController = require("@/controllers/cart.controller");
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const {
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
} = require("@/validations/cart.validation");

// Tất cả các route liên quan đến giỏ hàng đều yêu cầu đăng nhập
router.use(authRequire);

router.get("/", cartController.getCart);
router.post("/items", validate(addToCartSchema), cartController.addItemToCart);
router.patch("/items/:id", validate(updateCartItemSchema), cartController.updateCartItem);
router.delete("/items/:id", validate(deleteCartItemSchema), cartController.removeItemFromCart);

module.exports = router;
