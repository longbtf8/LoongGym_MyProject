const { z } = require("zod");

const parseJsonArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val || val === "") return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getAdminExercisesSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    difficulty: z.string().trim().optional(),
    published: z.string().trim().optional(),
    muscleGroupId: z.string().trim().optional(),
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

const muscleFields = {
  primaryMuscleGroupId: z.string().trim().uuid("Nhóm cơ chính không hợp lệ"),
  secondaryMuscleGroupIds: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .nullable()
    .transform((val) => parseJsonArray(val)),
};

const createExerciseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Tên bài tập không được để trống").max(150, "Tên bài tập tối đa 150 ký tự"),
    slug: z.string().trim().max(150, "Slug tối đa 150 ký tự").optional().nullable(),
    description: z.string().trim().optional().nullable(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"], {
      errorMap: () => ({ message: "Độ khó phải là beginner, intermediate hoặc advanced" }),
    }).default("beginner"),
    videoUrl: z.string().trim().optional().nullable(),
    isPublished: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === "boolean") return val;
        return val === "true";
      })
      .default(true),
    ...muscleFields,
  }),
});

const updateExerciseSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Tên bài tập không được để trống").max(150, "Tên bài tập tối đa 150 ký tự").optional(),
    slug: z.string().trim().max(150, "Slug tối đa 150 ký tự").optional().nullable(),
    description: z.string().trim().optional().nullable(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    videoUrl: z.string().trim().optional().nullable(),
    isPublished: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === "boolean") return val;
        return val === "true";
      })
      .optional(),
    primaryMuscleGroupId: z.string().trim().uuid("Nhóm cơ chính không hợp lệ").optional(),
    secondaryMuscleGroupIds: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .nullable()
      .transform((val) => (val === undefined ? undefined : parseJsonArray(val))),
  }),
});

module.exports = {
  getAdminExercisesSchema,
  createExerciseSchema,
  updateExerciseSchema,
};
