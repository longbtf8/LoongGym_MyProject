const { z } = require("zod");

const registerSchema = z.object({
  body: z
    .object({
      email: z
        .string({ message: "Vui lòng nhập email" })
        .trim()
        .max(255, "Email quá dài")
        .pipe(z.email({ message: "Email không hợp lệ" })),

      password: z
        .string({ message: "Vui lòng nhập mật khẩu" })
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
        .max(100, "Mật khẩu quá dài"),

      confirmPassword: z
        .string({ message: "Vui lòng xác nhận mật khẩu" })
        .min(1, "Vui lòng xác nhận mật khẩu"),

      fullname: z
        .string()
        .trim()
        .min(2, "Họ tên phải có ít nhất 2 ký tự")
        .max(100, "Họ tên quá dài")
        .optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    }),
});

const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Vui lòng nhập email" })
      .trim()
      .pipe(z.email({ message: "Email không hợp lệ" })),

    password: z
      .string({ message: "Vui lòng nhập mật khẩu" })
      .min(1, "Vui lòng nhập mật khẩu"),
  }),
});

const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string({ message: "Vui lòng nhập mật khẩu cũ" })
        .min(1, "Vui lòng nhập mật khẩu cũ"),
      newPassword: z
        .string({ message: "Vui lòng nhập mật khẩu mới" })
        .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
        .max(100, "Mật khẩu mới quá dài"),
      confirmPassword: z
        .string({ message: "Vui lòng xác nhận mật khẩu mới" })
        .min(1, "Vui lòng xác nhận mật khẩu mới"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    }),
});

module.exports = { registerSchema, loginSchema, changePasswordSchema };
