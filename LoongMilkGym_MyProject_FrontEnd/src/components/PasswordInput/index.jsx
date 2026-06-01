import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Component input mật khẩu có nút bật/tắt hiện mật khẩu (con mắt).
 * Dùng chung cho tất cả các trang auth: Login, Register, ResetPassword.
 * Sử dụng forwardRef để tương thích với react-hook-form register().
 *
 * @param {string} placeholder - Placeholder text
 * @param {boolean} hasError - Có đang lỗi validate không (để hiện viền đỏ)
 * @param {object} rest - Spread các props khác từ react-hook-form register()
 */
const PasswordInput = forwardRef(function PasswordInput(
  { placeholder = "Mật khẩu", hasError = false, ...rest },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className={`w-full px-5 py-4 pr-12 rounded-[30px] border-2 bg-[var(--input-bg)] text-[var(--text-color)] text-base outline-none transition-all duration-200 focus:border-primary focus:bg-[var(--bg-color)] focus:shadow-[0_0_0_4px_rgba(204,255,0,0.2)] ${
          hasError ? "border-[#ff4d4f]" : "border-transparent"
        }`}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors duration-200 p-0 flex items-center"
        tabIndex={-1}
        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
});

export default PasswordInput;
