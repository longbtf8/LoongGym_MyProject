const { z } = require("zod");

const targetDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const getTodayNutritionSchema = z.object({
  query: z.object({
    date: z
      .string()
      .trim()
      .regex(targetDateRegex, "Định dạng ngày phải là YYYY-MM-DD")
      .optional(),
  }),
});

const saveNutritionTargetSchema = z.object({
  body: z.object({
    targetDate: z
      .string({ required_error: "Ngày mục tiêu là bắt buộc" })
      .trim()
      .regex(targetDateRegex, "Định dạng ngày phải là YYYY-MM-DD"),
    caloriesTarget: z
      .number()
      .int("Lượng calo phải là số nguyên")
      .positive("Lượng calo phải lớn hơn 0")
      .max(10000, "Lượng calo tối đa là 10,000 kcal")
      .optional()
      .nullable(),
    proteinGTarget: z
      .number()
      .nonnegative("Lượng protein không được âm")
      .max(1000, "Lượng protein tối đa là 1,000g")
      .optional()
      .nullable(),
    carbsGTarget: z
      .number()
      .nonnegative("Lượng carb không được âm")
      .max(1000, "Lượng carb tối đa là 1,000g")
      .optional()
      .nullable(),
    fatGTarget: z
      .number()
      .nonnegative("Lượng chất béo không được âm")
      .max(1000, "Lượng chất béo tối đa là 1,000g")
      .optional()
      .nullable(),
    fiberGTarget: z
      .number()
      .nonnegative("Lượng chất xơ không được âm")
      .max(1000, "Lượng chất xơ tối đa là 1,000g")
      .optional()
      .nullable(),
    waterMlTarget: z
      .number()
      .int("Lượng nước phải là số nguyên")
      .positive("Lượng nước phải lớn hơn 0")
      .max(10000, "Lượng nước tối đa là 10,000 ml")
      .optional()
      .nullable(),
  }),
});

const createMealLogSchema = z.object({
  body: z.object({
    mealDate: z
      .string({ required_error: "Ngày ăn là bắt buộc" })
      .trim()
      .regex(targetDateRegex, "Định dạng ngày phải là YYYY-MM-DD"),
    mealType: z
      .string({ required_error: "Loại bữa ăn là bắt buộc" })
      .trim()
      .min(1, "Loại bữa ăn không được để trống"),
    note: z.string().trim().optional().nullable(),
  }),
});

const addMealLogItemSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "ID bữa ăn là bắt buộc"),
  }),
  body: z.object({
    foodItemId: z.string().trim().uuid("ID món ăn không hợp lệ").optional().nullable(),
    customFoodName: z.string().trim().optional().nullable(),
    quantityG: z
      .number({ required_error: "Vui lòng nhập khối lượng (g)" })
      .positive("Khối lượng phải lớn hơn 0")
      .max(5000, "Khối lượng tối đa là 5,000g"),
    calories: z.number().int("Lượng calo phải là số nguyên").nonnegative("Lượng calo không được âm").max(10000, "Lượng calo tối đa là 10,000 kcal").optional().nullable(),
    proteinG: z.number().nonnegative("Lượng protein không được âm").max(1000, "Lượng protein tối đa là 1,000g").optional().nullable(),
    carbsG: z.number().nonnegative("Lượng carb không được âm").max(1000, "Lượng carb tối đa là 1,000g").optional().nullable(),
    fatG: z.number().nonnegative("Lượng chất béo không được âm").max(1000, "Lượng chất béo tối đa là 1,000g").optional().nullable(),
  }).refine(data => data.foodItemId || data.customFoodName, {
    message: "Phải cung cấp ID món ăn hoặc nhập tên món ăn tự chọn",
    path: ["customFoodName"],
  }),
});

const deleteMealLogItemSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "ID món ăn nhật ký là bắt buộc"),
  }),
});

module.exports = {
  getTodayNutritionSchema,
  saveNutritionTargetSchema,
  createMealLogSchema,
  addMealLogItemSchema,
  deleteMealLogItemSchema,
};
