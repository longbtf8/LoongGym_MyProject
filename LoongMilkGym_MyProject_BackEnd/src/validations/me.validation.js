const { z } = require("zod");

const startTrainingPlanSchema = z.object({
  body: z.object({
    programId: z.string().trim().transform((val) => (val === "" ? null : val)).optional().nullable(),
    title: z.string().trim().transform((val) => (val === "" ? null : val)).optional().nullable(),
    startDate: z.string().trim().transform((val) => (val === "" ? null : val)).optional().nullable(),
    dayMapping: z.array(z.number().int().min(0).max(6)).length(7).optional().nullable(),
  }),
});

const getTrainingPlanDaysSchema = z.object({
  query: z.object({
    from: z.string({ required_error: "Vui lòng truyền ngày bắt đầu (from)" }).trim().min(1, "from không được trống"),
    to: z.string({ required_error: "Vui lòng truyền ngày kết thúc (to)" }).trim().min(1, "to không được trống"),
  }),
});

const updateTrainingPlanDayStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "ID không được để trống"),
  }),
  body: z.object({
    status: z.enum(["pending", "completed", "skipped", "rest"], {
      errorMap: () => ({ message: "Trạng thái status không hợp lệ (phải là pending, completed, skipped, hoặc rest)" }),
    }),
    skipReason: z.string().trim().optional().nullable(),
  }),
});

module.exports = {
  startTrainingPlanSchema,
  getTrainingPlanDaysSchema,
  updateTrainingPlanDayStatusSchema,
};
