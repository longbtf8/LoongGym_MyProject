const express = require("express");
const router = express.Router();
const productController = require("@/controllers/product.controller");
const validate = require("@/middlewares/validate");
const { getProductsSchema, getProductBySlugSchema } = require("@/validations/product.validation");

router.get("/", validate(getProductsSchema), productController.getProducts);
router.get("/:slug", validate(getProductBySlugSchema), productController.getProductBySlug);

module.exports = router;
