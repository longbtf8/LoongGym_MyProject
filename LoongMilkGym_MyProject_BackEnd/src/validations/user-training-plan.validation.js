const { z } = require("zod");

const getDayDetailsSchema = z.object({
  params: z.object({
    dayId: z.string().uuid("ID ngày tập không đúng định dạng UUID"),
  }),
});

const updateDayDetailsSchema = z.object({
  params: z.object({
    dayId: z.string().uuid("ID ngày tập không đúng định dạng UUID"),
  }),
  body: z.object({
    title: z.string().trim().min(1).max(150).optional(),
    status: z.enum(["pending", "completed", "skipped", "rest"]).optional(),
    notes: z.string().trim().nullable().optional(),
    skipReason: z.string().trim().nullable().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

const startProgramPlanSchema = z.object({
  body: z.object({
    programId: z.string().uuid("ID giáo án không đúng định dạng UUID"),
    startDate: z.string().date("Ngày bắt đầu không hợp lệ").optional(),
    dayMapping: z.array(
      z.union([
        z.string().uuid("ID ngày giáo án không đúng định dạng UUID"),
        z.number().int().min(0).max(30),
      ])
    ).min(1).max(31).optional(),
  }),
});

const startCustomPlanSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(200).optional(),
    startDate: z.string().date("Ngày bắt đầu không hợp lệ").optional(),
  }),
});

module.exports = {
  getDayDetailsSchema,
  updateDayDetailsSchema,
  startProgramPlanSchema,
  startCustomPlanSchema,
};
