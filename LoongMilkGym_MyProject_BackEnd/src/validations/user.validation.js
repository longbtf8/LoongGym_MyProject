const { z } = require("zod");

/**
 * Schema xác thực dữ liệu cập nhật thông tin cá nhân (UserProfile)
 */
const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .max(100, "Họ và tên quá dài")
      .optional()
      .nullable(),
    
    username: z
      .string()
      .trim()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(30, "Tên đăng nhập quá dài")
      .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới")
      .optional()
      .nullable(),
    
    gender: z
      .string()
      .optional()
      .nullable(),
    
    birthDate: z
      .string()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Ngày sinh không hợp lệ",
      })
      .optional()
      .nullable(),
    
    heightCm: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .refine((val) => val === null || (!isNaN(val) && val >= 50 && val <= 300), {
        message: "Chiều cao phải nằm trong khoảng từ 50cm đến 300cm",
      })
      .optional()
      .nullable(),
    
    weightKg: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .refine((val) => val === null || (!isNaN(val) && val >= 10 && val <= 500), {
        message: "Cân nặng phải nằm trong khoảng từ 10kg đến 500kg",
      })
      .optional()
      .nullable(),
    
    fitnessLevel: z
      .string()
      .max(100, "Mức độ thể chất không vượt quá 100 ký tự")
      .optional()
      .nullable(),
    
    goal: z
      .string()
      .max(255, "Mục tiêu không vượt quá 255 ký tự")
      .optional()
      .nullable(),
    
    bio: z
      .string()
      .max(500, "Tiểu sử không vượt quá 500 ký tự")
      .optional()
      .nullable(),
  }),
});

module.exports = {
  updateProfileSchema,
};
