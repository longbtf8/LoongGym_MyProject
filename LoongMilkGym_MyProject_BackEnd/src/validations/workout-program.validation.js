const { z } = require("zod");

const getWorkoutProgramsSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    goal: z.string().trim().optional(),
    difficulty: z.string().trim().optional(),
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

const getWorkoutProgramByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID không đúng định dạng UUID"),
  }),
});

module.exports = {
  getWorkoutProgramsSchema,
  getWorkoutProgramByIdSchema,
};
