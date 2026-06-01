import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useResetPasswordMutation, useChangePasswordMutation } from "@/services/auth/authApi";
import PasswordInput from "@/components/PasswordInput";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// Schema dành cho Reset Password (có token từ email)
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu quá dài"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// Schema dành cho Change Password (không có token, đã đăng nhập)
const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu cũ"),
    newPassword: z
      .string()
      .min(1, "Mật khẩu mới không được để trống")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
      .max(100, "Mật khẩu mới quá dài"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

function ResetPassword() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // Xác định chế độ: có token = reset, không token = change
  const isResetMode = Boolean(token);

  const [resetPassword] = useResetPasswordMutation();
  const [changePassword] = useChangePasswordMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isResetMode ? resetPasswordSchema : changePasswordSchema),
    defaultValues: isResetMode
      ? { password: "", confirmPassword: "" }
      : { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      let response;

      if (isResetMode) {
        // Gọi API đặt lại mật khẩu bằng token từ email
        response = await resetPassword({ token, password: data.password }).unwrap();
      } else {
        // Gọi API đổi mật khẩu bằng mật khẩu cũ (yêu cầu đã đăng nhập)
        response = await changePassword({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }).unwrap();
      }

      if (response?.success) {
        setSuccessMessage(
          isResetMode
            ? "Đặt lại mật khẩu thành công! Đang chuyển hướng sang Đăng nhập..."
            : "Đổi mật khẩu thành công!"
        );
        if (isResetMode) {
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        setErrorMessage(response?.message || "Thao tác thất bại.");
      }
    } catch (err) {
      console.error("Lỗi đặt lại/đổi mật khẩu:", err);
      if (err?.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        const errorMsg = err.data.errors[firstErrorKey][0];
        setErrorMessage(errorMsg || "Dữ liệu không hợp lệ.");
      } else {
        setErrorMessage(err?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div>
      {/* Tên thương hiệu LoongMilKGym sử dụng component Logo dùng chung */}
      <div className="mb-10 block">
        <Logo className="text-4xl" isLink={false} />
      </div>

      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="bg-none border-none text-[var(--text-muted)] cursor-pointer flex items-center gap-2 text-sm font-semibold p-0 mb-6 hover:text-[var(--text-color)] transition-colors duration-200"
      >
        <span>←</span> Quay lại
      </button>

      {/* Tiêu đề thay đổi theo chế độ */}
      <h1 className="text-4xl font-extrabold mb-4 m-0">
        {isResetMode ? "Đặt lại mật khẩu" : "Đổi mật khẩu"}
      </h1>

      <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
        {isResetMode
          ? "Nhập mật khẩu mới cho tài khoản của bạn."
          : "Nhập mật khẩu cũ và mật khẩu mới để cập nhật tài khoản."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Thông báo lỗi từ API */}
        {errorMessage && (
          <div className="bg-[#ff4d4f]/10 text-[#ff4d4f] px-4 py-3 rounded-2xl text-sm font-medium border border-[#ff4d4f]/20 animate-slide-down animate-shake">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="bg-emerald-500/10 text-emerald-500 px-4 py-3 rounded-2xl text-sm font-medium border border-emerald-500/20 animate-slide-down">
            🎉 {successMessage}
          </div>
        )}

        {/* Trường Mật khẩu cũ (chỉ hiện khi KHÔNG có token) */}
        {!isResetMode && (
          <div className="flex flex-col gap-1.5">
            <PasswordInput
              placeholder="Mật khẩu cũ"
              hasError={!!errors.oldPassword}
              {...register("oldPassword")}
            />
            {errors.oldPassword && (
              <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
                {errors.oldPassword.message}
              </span>
            )}
          </div>
        )}

        {/* Trường Mật khẩu mới */}
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            placeholder="Mật khẩu mới"
            hasError={!!(isResetMode ? errors.password : errors.newPassword)}
            {...register(isResetMode ? "password" : "newPassword")}
          />
          {(isResetMode ? errors.password : errors.newPassword) && (
            <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
              {(isResetMode ? errors.password : errors.newPassword)?.message}
            </span>
          )}
        </div>

        {/* Trường Xác nhận mật khẩu */}
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            placeholder="Xác nhận mật khẩu mới"
            hasError={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Nút submit Neon */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-[30px] border-none bg-primary text-black text-base font-extrabold cursor-pointer transition-all duration-200 mt-2 shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 active:bg-primary-active disabled:opacity-50"
        >
          {isSubmitting
            ? "Đang xử lý..."
            : isResetMode
              ? "Đặt lại mật khẩu"
              : "Đổi mật khẩu"}
        </button>

        {/* Quay lại Đăng nhập */}
        <div className="text-center mt-4 text-sm">
          <Link
            to="/login"
            className="text-[var(--text-color)] font-bold no-underline border-b-2 border-[var(--text-color)]"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;
