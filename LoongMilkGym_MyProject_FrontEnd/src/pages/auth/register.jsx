import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegisterMutation } from "@/services/auth/authApi";
import PasswordInput from "@/components/PasswordInput";
import { useState } from "react";
import { parseApiError } from "@/utils/errorParser";

// Khai báo schema validate bằng Zod tiếng Việt khớp hoàn toàn với Backend
const registerSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(2, "Họ tên phải có ít nhất 2 ký tự")
      .max(100, "Họ tên quá dài"),
    email: z
      .string()
      .trim()
      .min(1, "Email không được để trống")
      .pipe(z.string().email("Email không đúng định dạng")),
    password: z
      .string()
      .min(1, "Mật khẩu không được để trống")
      .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

function Register() {
  const navigate = useNavigate();
  const [registerUser] = useRegisterMutation();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      // Thực hiện gọi API đăng ký của Backend thông qua mutation hook
      const response = await registerUser(data).unwrap();
      
      if (response?.success) {
        setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email.");
      } else {
        setErrorMessage(response?.message || "Đăng ký thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      // Sử dụng helper dùng chung để parse lỗi đăng ký
      const parsedError = parseApiError(err, "Không thể kết nối đến máy chủ.");
      setErrorMessage(parsedError.message);
    }
  };

  // Màn hình thông báo đăng ký thành công và hướng dẫn kích hoạt tài khoản
  if (successMessage) {
    return (
      <div className="text-center flex flex-col items-center justify-center animate-slide-down">
        {/* Logo LoongMilKGym */}
        <div className="mb-10 block">
          <Logo className="text-3xl sm:text-4xl" isLink={false} />
        </div>

        {/* Checkmark icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 m-0 text-emerald-500">Đăng ký thành công!</h1>
        <p className="text-[var(--text-muted)] text-sm mb-8 leading-relaxed max-w-[360px] mx-auto">
          Tài khoản của bạn đã được khởi tạo thành công. Một liên kết xác thực đã được gửi đến địa chỉ email của bạn. Vui lòng kích hoạt tài khoản của bạn trước khi đăng nhập.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="tap-stable w-full min-h-12 py-4 rounded-[30px] border-none bg-primary text-black text-base font-extrabold cursor-pointer mt-2 shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover active:opacity-90 select-none"
        >
          Đi tới Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Thương hiệu LoongMilKGym ở góc trên giống mockup với Chameleon Gradient */}
      <div className="mb-10 block">
        <Logo className="text-3xl sm:text-4xl" isLink={false} />
      </div>

      {/* Nút quay lại */}
      <button 
        onClick={() => navigate(-1)} 
        className="bg-none border-none text-[var(--text-muted)] cursor-pointer flex items-center gap-2 text-sm font-semibold p-0 mb-6 hover:text-[var(--text-color)] transition-colors duration-200"
      >
        <span>←</span> Quay lại
      </button>

      {/* Tiêu đề Đăng ký */}
      <h1 className="text-2xl sm:text-4xl font-extrabold mb-8 m-0">
        Đăng ký
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 mt-6">
        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div className="bg-[#ff4d4f]/10 text-[#ff4d4f] px-4 py-3 rounded-2xl text-sm font-medium border border-[#ff4d4f]/20">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Thông báo thành công nếu có */}
        {successMessage && (
          <div className="bg-emerald-500/10 text-emerald-500 px-4 py-3 rounded-2xl text-sm font-medium border border-emerald-500/20">
            🎉 {successMessage}
          </div>
        )}

        {/* Trường Họ tên */}
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Họ và tên"
            {...register("fullname")}
            className={`w-full px-5 py-4 rounded-[30px] border-2 bg-[var(--input-bg)] text-[var(--text-color)] text-base outline-none transition-all duration-200 focus:border-primary focus:bg-[var(--bg-color)] focus:shadow-[0_0_0_4px_rgba(204,255,0,0.2)] ${
              errors.fullname ? "border-[#ff4d4f]" : "border-transparent"
            }`}
          />
          {errors.fullname && (
            <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
              {errors.fullname.message}
            </span>
          )}
        </div>

        {/* Trường Email */}
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            placeholder="Email"
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

        {/* Trường Mật khẩu */}
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            placeholder="Mật khẩu"
            hasError={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Trường Xác nhận Mật khẩu */}
        <div className="flex flex-col gap-1.5">
          <PasswordInput
            placeholder="Xác nhận mật khẩu"
            hasError={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-[#ff4d4f] text-xs pl-4 font-medium animate-error">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Nút Đăng ký Neon */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="tap-stable w-full min-h-12 py-4 rounded-[30px] border-none bg-primary text-black text-base font-extrabold cursor-pointer mt-2 shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover active:opacity-90 disabled:opacity-50 select-none"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng ký thành viên"}
        </button>

        {/* Chuyển tới Đăng nhập */}
        <div className="text-center mt-4 text-sm">
          <span className="text-[var(--text-muted)]">Đã có tài khoản? </span>
          <Link 
            to="/login" 
            className="tap-stable inline-flex items-center justify-center min-h-10 px-3 py-2 text-[var(--text-color)] font-bold no-underline border-b-2 border-[var(--text-color)] select-none active:opacity-80"
          >
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
