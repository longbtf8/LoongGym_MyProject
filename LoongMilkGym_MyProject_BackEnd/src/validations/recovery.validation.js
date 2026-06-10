const { z } = require("zod");

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const logRecoverySchema = z.object({
  body: z.object({
    logDate: z
      .string({ required_error: "Ngày ghi nhận là bắt buộc" })
      .trim()
      .regex(dateRegex, "Định dạng ngày phải là YYYY-MM-DD"),
    sleepHours: z
      .number({ required_error: "Thời gian ngủ là bắt buộc" })
      .min(0, "Giờ ngủ không được nhỏ hơn 0")
      .max(24, "Giờ ngủ không được lớn hơn 24"),
    sorenessLevel: z
      .number({ required_error: "Mức độ đau cơ là bắt buộc" })
      .int("Mức độ đau cơ phải là số nguyên")
      .min(1, "Mức độ đau cơ từ 1 đến 10")
      .max(10, "Mức độ đau cơ từ 1 đến 10"),
    stressLevel: z
      .number({ required_error: "Mức độ căng thẳng là bắt buộc" })
      .int("Mức độ căng thẳng phải là số nguyên")
      .min(1, "Mức độ căng thẳng từ 1 đến 10")
      .max(10, "Mức độ căng thẳng từ 1 đến 10"),
    energyLevel: z
      .number({ required_error: "Mức độ năng lượng là bắt buộc" })
      .int("Mức độ năng lượng phải là số nguyên")
      .min(1, "Mức độ năng lượng từ 1 đến 10")
      .max(10, "Mức độ năng lượng từ 1 đến 10"),
    hrvMs: z
      .number()
      .positive("Chỉ số HRV phải lớn hơn 0")
      .optional()
      .nullable(),
    restingHeartRate: z
      .number()
      .int("Nhịp tim nghỉ ngơi phải là số nguyên")
      .positive("Nhịp tim nghỉ ngơi phải lớn hơn 0")
      .optional()
      .nullable(),
    notes: z.string().trim().optional().nullable(),
  }),
});

const logInjurySchema = z.object({
  body: z.object({
    bodyPart: z
      .string({ required_error: "Vị trí chấn thương là bắt buộc" })
      .trim()
      .min(1, "Vị trí chấn thương không được để trống"),
    severity: z
      .enum(["mild", "moderate", "severe"], {
        errorMap: () => ({ message: "Mức độ chấn thương phải là mild, moderate hoặc severe" }),
      })
      .default("mild"),
    painLevel: z
      .number({ required_error: "Mức độ đau đớn là bắt buộc" })
      .int("Mức độ đau phải là số nguyên")
      .min(1, "Mức độ đau từ 1 đến 10")
      .max(10, "Mức độ đau từ 1 đến 10"),
    description: z.string().trim().optional().nullable(),
    startedAt: z
      .string({ required_error: "Ngày bắt đầu chấn thương là bắt buộc" })
      .trim()
      .regex(dateRegex, "Định dạng ngày bắt đầu phải là YYYY-MM-DD"),
    resolvedAt: z
      .string()
      .trim()
      .regex(dateRegex, "Định dạng ngày phục hồi phải là YYYY-MM-DD")
      .optional()
      .nullable(),
    status: z.enum(["active", "resolved"]).default("active"),
  }),
});

const logBodyMetricSchema = z.object({
  body: z.object({
    weightKg: z.number().positive("Cân nặng phải lớn hơn 0").optional().nullable(),
    bodyFatPercent: z.number().nonnegative("Tỉ lệ mỡ không được âm").max(100, "Tỉ lệ mỡ tối đa 100%").optional().nullable(),
    muscleMassKg: z.number().positive("Khối lượng cơ phải lớn hơn 0").optional().nullable(),
    waistCm: z.number().positive("Số đo vòng eo phải lớn hơn 0").optional().nullable(),
    chestCm: z.number().positive("Số đo vòng ngực phải lớn hơn 0").optional().nullable(),
    armCm: z.number().positive("Số đo vòng bắp tay phải lớn hơn 0").optional().nullable(),
    thighCm: z.number().positive("Số đo vòng đùi phải lớn hơn 0").optional().nullable(),
    notes: z.string().trim().optional().nullable(),
  }),
});

const uploadProgressPhotoSchema = z.object({
  body: z.object({
    photoUrl: z.string({ required_error: "Đường dẫn ảnh là bắt buộc" }).trim().url("Đường dẫn ảnh không hợp lệ"),
    photoType: z.enum(["front", "side", "back"], {
      errorMap: () => ({ message: "Loại ảnh phải là front, side hoặc back" }),
    }),
    takenAt: z
      .string({ required_error: "Ngày chụp ảnh là bắt buộc" })
      .trim()
      .regex(dateRegex, "Định dạng ngày chụp phải là YYYY-MM-DD"),
    visibility: z.enum(["private", "public"]).default("private"),
  }),
});

module.exports = {
  logRecoverySchema,
  logInjurySchema,
  logBodyMetricSchema,
  uploadProgressPhotoSchema,
};
