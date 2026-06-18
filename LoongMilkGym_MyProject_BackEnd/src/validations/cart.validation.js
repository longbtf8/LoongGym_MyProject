const { z } = require("zod");

const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid("ID sản phẩm không hợp lệ (phải là UUID)"),
    quantity: z
      .number({ invalid_type_error: "Số lượng phải là một số" })
      .int()
      .min(1, "Số lượng tối thiểu phải là 1")
      .default(1),
  }),
});

const updateCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID sản phẩm trong giỏ không hợp lệ (phải là UUID)"),
  }),
  body: z.object({
    quantity: z
      .number({ invalid_type_error: "Số lượng phải là một số" })
      .int()
      .min(1, "Số lượng tối thiểu phải là 1"),
  }),
});

const deleteCartItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID sản phẩm trong giỏ không hợp lệ (phải là UUID)"),
  }),
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  deleteCartItemSchema,
};
