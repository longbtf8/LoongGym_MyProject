const { z } = require("zod");

const getAdminWorkoutProgramsSchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    goal: z.string().trim().optional(),
    difficulty: z.string().trim().optional(),
    published: z.string().trim().optional(),
    sort: z.string().trim().optional(),
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

const createWorkoutProgramSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Tiêu đề không được để trống").max(200, "Tiêu đề tối đa 200 ký tự"),
    slug: z.string().trim().max(200, "Slug tối đa 200 ký tự").optional().nullable(),
    description: z.string().trim().optional().nullable(),
    goal: z.string().trim().max(50, "Mục tiêu tối đa 50 ký tự").optional().nullable(),
    difficulty: z.string().trim().max(30, "Độ khó tối đa 30 ký tự").optional().nullable(),
    price: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === undefined || val === null || val === "") return 0.0;
        const num = Number(val);
        return isNaN(num) || num < 0 ? 0.0 : num;
      })
      .default(0.0),
    isPublished: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === "boolean") return val;
        return val === "true";
      })
      .default(false),
  }),
});

const updateWorkoutProgramSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Tiêu đề không được để trống").max(200, "Tiêu đề tối đa 200 ký tự").optional(),
    slug: z.string().trim().max(200, "Slug tối đa 200 ký tự").optional().nullable(),
    description: z.string().trim().optional().nullable(),
    goal: z.string().trim().max(50, "Mục tiêu tối đa 50 ký tự").optional().nullable(),
    difficulty: z.string().trim().max(30, "Độ khó tối đa 30 ký tự").optional().nullable(),
    price: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === undefined || val === null || val === "") return undefined;
        const num = Number(val);
        return isNaN(num) || num < 0 ? 0.0 : num;
      })
      .optional(),
    isPublished: z
      .union([z.boolean(), z.string()])
      .transform((val) => {
        if (typeof val === "boolean") return val;
        return val === "true";
      })
      .optional(),
  }),
});

const saveWorkoutProgramDaySchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Tiêu đề ngày tập không được để trống").max(150, "Tiêu đề ngày tập tối đa 150 ký tự"),
    description: z.string().trim().optional().nullable(),
    focusArea: z.string().trim().max(100, "Nhóm cơ tập trung tối đa 100 ký tự").optional().nullable(),
    cycleDay: z
      .union([z.number(), z.string()])
      .transform((val) => {
        const num = Number(val);
        return isNaN(num) ? 1 : num;
      }),
    muscleMapUrl: z.string().trim().optional().nullable(),
  }),
});

const saveWorkoutProgramExerciseSchema = z.object({
  body: z.object({
    exerciseId: z.string().uuid("ID bài tập không đúng định dạng").optional().nullable(),
    name: z.string().trim().max(150, "Tên bài tập tối đa 150 ký tự").optional().nullable(),
    videoUrl: z.string().trim().optional().nullable(),
    sets: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
      })
      .optional()
      .nullable(),
    repsMin: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
      })
      .optional()
      .nullable(),
    repsMax: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
      })
      .optional()
      .nullable(),
    weightKg: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
      })
      .optional()
      .nullable(),
    restSeconds: z
      .union([z.number(), z.string()])
      .transform((val) => {
        if (val === "" || val === null || val === undefined) return null;
        return Number(val);
      })
      .optional()
      .nullable(),
    tempo: z.string().trim().max(30, "Tempo tối đa 30 ký tự").optional().nullable(),
    note: z.string().trim().optional().nullable(),
  }),
});

module.exports = {
  getAdminWorkoutProgramsSchema,
  createWorkoutProgramSchema,
  updateWorkoutProgramSchema,
  saveWorkoutProgramDaySchema,
  saveWorkoutProgramExerciseSchema,
};
