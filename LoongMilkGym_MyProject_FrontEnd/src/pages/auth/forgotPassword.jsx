import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForgotPasswordMutation } from "@/services/auth/authApi";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// Khai báo schema validate email bằng Zod tiếng Việt
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email không được để trống")
    .pipe(z.string().email("Email không đúng định dạng")),
});

function ForgotPassword() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [forgotPassword] = useForgotPasswordMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Gọi API quên mật khẩu kết nối database thông qua RTK Query mutation
      const response = await forgotPassword(data).unwrap();

      if (response?.success) {
        setSuccessMessage("Yêu cầu thành công! Vui lòng kiểm tra email để đặt lại mật khẩu.");
      } else {
        setErrorMessage(response?.message || "Gửi yêu cầu thất bại.");
      }
    } catch (err) {
      console.error("Lỗi gửi email quên mật khẩu:", err);
      // Hiển thị lỗi từ backend
      if (err?.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        const errorMsg = err.data.errors[firstErrorKey][0];
        setErrorMessage(errorMsg || "Email không hợp lệ.");
      } else {
        setErrorMessage(err?.data?.message || "Email không tồn tại trong hệ thống.");
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

      {/* Tiêu đề Quên mật khẩu */}
      <h1 className="text-4xl font-extrabold mb-4 m-0">
        Quên mật khẩu?
      </h1>
      
      <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed">
        Nhập email của bạn bên dưới và chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu đến hộp thư của bạn.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[22px]">
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

        {/* Trường Email */}
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Nhập Email của bạn"
            {...register("email")}
            className={`w-full px-5 py-4 rounded-[30px] border-2 bg-[var(--input-bg)] text-[var(--text-color)] text-base outline-none transition-all duration-200 focus:border-primary focus:bg-[var(--bg-color)] focus:shadow-[0_0_0_4px_rgba(204,255,0,0.2)] ${
              errors.email ? "border-[#ff4d4f]" : "border-transparent"
            }`}
          />
          {errors.email && (
            <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
              {errors.email.message}
            </span>
          )}
        </div>

        {/* Nút Gửi Neon */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-[30px] border-none bg-primary text-black text-base font-extrabold cursor-pointer transition-all duration-200 mt-2 shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 active:bg-primary-active disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : "Gửi yêu cầu"}
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

export default ForgotPassword;
