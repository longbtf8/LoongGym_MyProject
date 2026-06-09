const { z } = require("zod");

const startSessionSchema = z.object({
  body: z.object({
    planDayId: z.string().uuid("Plan Day ID phải là UUID").optional().nullable(),
    title: z.string().trim().max(150, "Tiêu đề không được vượt quá 150 ký tự").optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  }),
});

const getSessionSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID buổi tập phải là UUID"),
  }),
});

const addSetSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID buổi tập phải là UUID"),
    sessionExerciseId: z.string().uuid("ID bài tập trong buổi tập phải là UUID"),
  }),
  body: z.object({
    setNumber: z.number({ required_error: "Vui lòng nhập số thứ tự set" }).int().positive("Số thứ tự set phải lớn hơn 0"),
    setType: z.string().trim().default("working"),
    reps: z.number().int().nonnegative("Số reps không được âm").optional().nullable(),
    weightKg: z.number().nonnegative("Cân nặng không được âm").optional().nullable(),
    durationSeconds: z.number().int().nonnegative("Thời gian không được âm").optional().nullable(),
    distanceMeters: z.number().nonnegative("Quãng đường không được âm").optional().nullable(),
    rpe: z.number().min(1, "RPE tối thiểu là 1").max(10, "RPE tối đa là 10").optional().nullable(),
    isCompleted: z.boolean().default(false),
  }),
});

const updateSetSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID set phải là UUID"),
  }),
  body: z.object({
    setNumber: z.number().int().positive("Số thứ tự set phải lớn hơn 0").optional(),
    setType: z.string().trim().optional(),
    reps: z.number().int().nonnegative("Số reps không được âm").optional().nullable(),
    weightKg: z.number().nonnegative("Cân nặng không được âm").optional().nullable(),
    durationSeconds: z.number().int().nonnegative("Thời gian không được âm").optional().nullable(),
    distanceMeters: z.number().nonnegative("Quãng đường không được âm").optional().nullable(),
    rpe: z.number().min(1, "RPE tối thiểu là 1").max(10, "RPE tối đa là 10").optional().nullable(),
    isCompleted: z.boolean().optional(),
  }),
});

const completeSessionSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID buổi tập phải là UUID"),
  }),
  body: z.object({
    perceivedEffort: z.number().int().min(1, "RPE từ 1 đến 10").max(10, "RPE từ 1 đến 10").optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  }),
});

module.exports = {
  startSessionSchema,
  getSessionSchema,
  addSetSchema,
  updateSetSchema,
  completeSessionSchema,
};
