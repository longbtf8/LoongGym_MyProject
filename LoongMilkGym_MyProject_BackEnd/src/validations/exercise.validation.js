const { z } = require("zod");

const getExercisesSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    difficulty: z.string().trim().optional(),
    muscle: z.string().trim().optional(),
    equipment: z.string().trim().optional(),
    sort: z.enum(["popular", "newest", "name-asc"]).default("popular"),
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

const getExerciseBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "Slug không được để trống"),
  }),
});

module.exports = {
  getExercisesSchema,
  getExerciseBySlugSchema,
};
