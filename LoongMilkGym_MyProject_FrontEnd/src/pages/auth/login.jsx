import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginMutation, useResendVerificationMutation } from "@/services/auth/authApi";
import { STORAGE_KEYS } from "@/services/api";
import PasswordInput from "@/components/PasswordInput";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// Khai báo schema validate với Zod bằng tiếng Việt
const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email không được để trống")
    .pipe(z.string().email("Email không đúng định dạng")),
  password: z
    .string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [loginUser] = useLoginMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setShowVerifyButton(false);

      // Gọi API đăng nhập kết nối database thông qua RTK Query mutation
      const response = await loginUser(data).unwrap();

      if (response?.success) {
        setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");
        
        // Lưu Access Token và Refresh Token vào localStorage với key riêng của GymLife
        const { access_token, refresh_token } = response.data;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);

        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setErrorMessage(response?.message || "Đăng nhập thất bại.");
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      
      // Kiểm tra lỗi từ backend
      if (err?.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        const errorMsg = err.data.errors[firstErrorKey][0];
        setErrorMessage(errorMsg || "Dữ liệu đăng nhập không hợp lệ.");
      } else {
        const msg = err?.data?.message || "";
        
        // Phát hiện nếu lỗi là yêu cầu xác thực tài khoản/email
        if (msg.includes("xác thực email") || msg.toLowerCase().includes("verify")) {
          setErrorMessage("Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email để đăng nhập.");
          setShowVerifyButton(true);
          setTypedEmail(data.email);
        } else {
          setErrorMessage(msg || "Email hoặc mật khẩu không chính xác.");
        }
      }
    }
  };

  // Hàm xử lý gửi lại mã xác thực
  const handleResendVerify = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      
      const response = await resendVerification({ email: typedEmail }).unwrap();
      
      if (response?.success) {
        setSuccessMessage("Đã gửi lại liên kết kích hoạt thành công! Vui lòng kiểm tra email của bạn.");
        setShowVerifyButton(false);
      } else {
        setErrorMessage(response?.message || "Gửi lại email xác thực thất bại.");
      }
    } catch (err) {
      setErrorMessage(err?.data?.message || "Có lỗi xảy ra khi gửi lại email xác thực.");
    }
  };

  return (
    <div>
      {/* Tên thương hiệu LoongMilKGym với Chameleon Gradient cực đẹp */}
      <div className={`text-4xl font-black mb-10 tracking-tighter bg-gradient-to-r bg-clip-text text-transparent select-none filter transition-all duration-300 drop-shadow-[0_2px_8px_rgba(204,255,0,0.15)] ${
        theme === "light" 
          ? "from-[#8db400] to-[#0092ad]" 
          : "from-[#ccff00] to-[#00f5d4]"
      }`}>
        LoongMilKGym
      </div>

      {/* Nút quay lại */}
      <button 
        onClick={() => navigate(-1)} 
        className="bg-none border-none text-[var(--text-muted)] cursor-pointer flex items-center gap-2 text-sm font-semibold p-0 mb-6 hover:text-[var(--text-color)] transition-colors duration-200"
      >
        <span>←</span> Quay lại
      </button>

      {/* Tiêu đề Đăng nhập */}
      <h1 className="text-4xl font-extrabold mb-8 m-0">
        Đăng nhập
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[22px] mt-[30px]">
        {/* Thông báo lỗi từ API */}
        {errorMessage && (
          <div className="bg-[#ff4d4f]/10 text-[#ff4d4f] px-4 py-3 rounded-2xl text-sm font-medium border border-[#ff4d4f]/20 flex flex-col gap-2 animate-slide-down animate-shake">
            <div>⚠️ {errorMessage}</div>
            
            {/* Nút hành động gửi lại email xác thực nếu chưa verify */}
            {showVerifyButton && (
              <button
                type="button"
                onClick={handleResendVerify}
                disabled={isResending}
                className="mt-1 self-start bg-primary text-black text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary-hover active:bg-primary-active transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                {isResending ? "Đang gửi..." : "Gửi lại email xác thực"}
              </button>
            )}
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

        {/* Trường Mật khẩu với icon con mắt */}
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

        {/* Quên mật khẩu link */}
        <div className="text-right">
          <Link 
            to="/forgot-password" 
            className="text-[var(--text-color)] text-sm font-semibold no-underline hover:opacity-80 transition-opacity duration-200"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút Đăng nhập Neon */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-[30px] border-none bg-primary text-black text-base font-extrabold cursor-pointer transition-all duration-200 mt-2 shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 active:bg-primary-active disabled:opacity-50"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        {/* Liên kết chuyển sang Đăng ký */}
        <div className="text-center mt-4 text-sm">
          <span className="text-[var(--text-muted)]">Chưa có tài khoản? </span>
          <Link 
            to="/register" 
            className="text-[var(--text-color)] font-bold no-underline border-b-2 border-[var(--text-color)]"
          >
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
