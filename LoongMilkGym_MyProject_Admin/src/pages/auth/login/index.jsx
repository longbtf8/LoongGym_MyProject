import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useLoginMutation } from "@/services/auth/authApi";
import { STORAGE_KEYS } from "@/services/api";
import paths from "@/config/path";
import { useTheme } from "@/context/ThemeContext";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Định dạng email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự"),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const { theme } = useTheme();

  const isForbiddenError = searchParams.get("error") === "forbidden";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setApiError("");
    try {
      // Call authApi login mutation
      const response = await login(data).unwrap();
      if (response?.data?.access_token) {
        if (response.data.user?.role !== "ADMIN") {
          throw new Error("forbidden_role");
        }
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refresh_token || "");
        
        const returnUrl = searchParams.get("returnUrl") || paths.DASHBOARD;
        navigate(decodeURIComponent(returnUrl), { replace: true });
        window.location.reload(); // Reload to refresh queries & state
      } else {
        throw new Error("Không nhận được mã truy cập");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.message === "forbidden_role") {
        setApiError("Tài khoản của bạn không có quyền truy cập hệ thống Quản trị. Vui lòng đăng nhập bằng tài khoản Admin.");
      } else {
        setApiError(
          err?.data?.message || err?.message || "Lỗi máy chủ. Vui lòng kiểm tra kết nối."
        );
      }
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
      {/* Brand logo */}
      <span className={`font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent select-none filter transition-all duration-300 drop-shadow-[0_2px_8px_rgba(204,255,0,0.15)] text-3xl mb-4 ${
        theme === "light"
          ? "from-[#99cc00] to-[#00a8cc]"
          : "from-[#ccff00] to-[#00f5d4]"
      }`}>
        LoongMilKGym
      </span>

      <h2 className="text-xl font-black text-[var(--text-color)] text-center">Đăng nhập Admin</h2>

      {isForbiddenError && !apiError && (
        <div className="w-full mt-5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2.5 text-rose-500 text-xs font-semibold animate-reactions-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            Tài khoản của bạn không có quyền truy cập hệ thống Quản trị. Vui lòng đăng nhập bằng tài khoản Admin.
          </div>
        </div>
      )}

      {apiError && (
        <div className="w-full mt-5 p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-start gap-2.5 text-rose-500 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p>{apiError}</p>
          </div>
        </div>
      )}


      <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-6 space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)]">Email công việc</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--text-muted)]">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              {...register("email")}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--input-bg)] border border-transparent focus:border-[var(--input-focus-border)] text-xs font-bold outline-none text-[var(--text-color)] transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 animate-error">
              <AlertCircle className="w-3 h-3" /> {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[var(--text-muted)]">Mật khẩu</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[var(--text-muted)]">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[var(--input-bg)] border border-transparent focus:border-[var(--input-focus-border)] text-xs font-bold outline-none text-[var(--text-color)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 animate-error">
              <AlertCircle className="w-3 h-3" /> {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] active:scale-95 text-xs font-extrabold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Đăng nhập hệ thống"
          )}
        </button>
      </form>

    </div>
  );
}
