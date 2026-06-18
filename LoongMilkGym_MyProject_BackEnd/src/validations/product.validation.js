const { z } = require("zod");

const getProductsSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    type: z.string().trim().optional(),
    categorySlug: z.string().trim().optional(),
    page: z
      .union([z.number(), z.string()])
      .transform((val) => {
        const num = Number(val);
        return isNaN(num) || num < 1 ? 1 : num;
      })
      .default(1),
    limit: z
      .union([z.number(), z.string()])
      .transform((val) => {
        const num = Number(val);
        return isNaN(num) || num < 1 ? 10 : num;
      })
      .default(10),
  }),
});

const getProductBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug không được để trống"),
  }),
});

module.exports = {
  getProductsSchema,
  getProductBySlugSchema,
};
