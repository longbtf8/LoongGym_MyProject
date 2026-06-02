const { z } = require("zod");
const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .trim()
      .max(100, "Họ và tên quá dài")
      .optional()
      .nullable(),

    membershipTier: z
      .string()
      .trim()
      .max(50, "Hạng thành viên quá dài")
      .optional()
      .nullable(),

    phone: z
      .string()
      .trim()
      .max(20, "Số điện thoại quá dài")
      .optional()
      .nullable(),

    address: z
      .string()
      .trim()
      .max(255, "Địa chỉ quá dài")
      .optional()
      .nullable(),

    
    gender: z
      .string()
      .optional()
      .nullable(),
    
    birthDate: z
      .string()
      .refine((val) => {
        if (!val) return true;
        const parsed = Date.parse(val);
        if (isNaN(parsed)) return false;
        return new Date(parsed) <= new Date();
      }, {
        message: "Ngày sinh không được ở tương lai",
      })
      .optional()
      .nullable(),
    
    height: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .optional()
      .nullable(),

    weight: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .optional()
      .nullable(),

    heightUnit: z
      .string()
      .trim()
      .optional()
      .nullable(),

    weightUnit: z
      .string()
      .trim()
      .optional()
      .nullable(),

    heightCm: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .optional()
      .nullable(),

    weightKg: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .optional()
      .nullable(),
    calorieGoal: z
      .union([z.number(), z.string()])
      .transform((val) => (val === "" || val === null ? null : Number(val)))
      .optional()
      .nullable(),

    fitnessLevel: z
      .enum([
        "SEDENTARY (Ít vận động / Người mới)",
        "LIGHT (Vận động nhẹ / 1-2 buổi/tuần)",
        "MODERATE (Vận động vừa phải / 3-5 buổi/tuần)",
        "ACTIVE (Vận động nhiều / 6-7 buổi/tuần)",
        "ATHLETE (Vận động viên / Cường độ cao)"
      ], {
        errorMap: () => ({ message: "Trình độ thể chất không hợp lệ" })
      })
      .optional()
      .nullable(),
    
    goal: z
      .enum([
        "Giảm mỡ / Giảm cân",
        "Tăng cơ bắp",
        "Nâng cao sức bền",
        "Cải thiện sức khỏe tổng thể",
        "Phục hồi chức năng"
      ], {
        errorMap: () => ({ message: "Mục tiêu tập luyện không hợp lệ" })
      })
      .optional()
      .nullable(),
    
    bio: z
      .string()
      .max(500, "Tiểu sử không vượt quá 500 ký tự")
      .optional()
      .nullable(),
  }).superRefine((data, ctx) => {
    // Validate phone number
    if (data.phone) {
      const phoneRegex = /^(0|84)(3|5|7|8|9)[0-9]{8}$/;
      if (!phoneRegex.test(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Số điện thoại không hợp lệ (phải gồm 10 chữ số và có đầu số nhà mạng Việt Nam)",
          path: ["phone"]
        });
      }
    }

    // Validate Calorie Goal
    if (data.calorieGoal !== undefined && data.calorieGoal !== null) {
      if (data.calorieGoal < 500 || data.calorieGoal > 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mục tiêu Calo phải từ 500 kcal đến 10,000 kcal",
          path: ["calorieGoal"]
        });
      }
    }

    // Validate Height based on heightUnit
    if (data.height !== undefined && data.height !== null) {
      const unit = data.heightUnit || "cm";
      let isValid = true;
      let errMsg = "";
      if (["cm"].includes(unit.toLowerCase())) {
        isValid = data.height >= 50 && data.height <= 250;
        errMsg = "Chiều cao phải từ 50 cm đến 250 cm";
      } else if (["inch", "in", "inches"].includes(unit.toLowerCase())) {
        isValid = data.height >= 20 && data.height <= 100;
        errMsg = "Chiều cao phải từ 20 in đến 100 in";
      } else if (["ft", "feet"].includes(unit.toLowerCase())) {
        isValid = data.height >= 1.5 && data.height <= 8.5;
        errMsg = "Chiều cao phải từ 1.5 ft đến 8.5 ft";
      }
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errMsg,
          path: ["height"]
        });
      }
    }

    // Validate Weight based on weightUnit
    if (data.weight !== undefined && data.weight !== null) {
      const unit = data.weightUnit || "kg";
      let isValid = true;
      let errMsg = "";
      if (["kg"].includes(unit.toLowerCase())) {
        isValid = data.weight >= 20 && data.weight <= 400;
        errMsg = "Cân nặng phải từ 20 kg đến 400 kg";
      } else if (["lb", "pound", "pounds"].includes(unit.toLowerCase())) {
        isValid = data.weight >= 40 && data.weight <= 900;
        errMsg = "Cân nặng phải từ 40 lb đến 900 lb";
      } else if (["st", "stone", "stones"].includes(unit.toLowerCase())) {
        isValid = data.weight >= 3 && data.weight <= 60;
        errMsg = "Cân nặng phải từ 3 st đến 60 st";
      }
      if (!isValid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errMsg,
          path: ["weight"]
        });
      }
    }
  }),
});

module.exports = {
  updateProfileSchema,
};
