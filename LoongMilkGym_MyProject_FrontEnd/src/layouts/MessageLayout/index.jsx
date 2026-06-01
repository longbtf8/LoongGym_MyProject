import React from "react";
import { useTheme } from "@/context/ThemeContext";

/**
 * MessageLayout - Layout chuyên biệt hiển thị các thông báo (xác thực, thành công, đổi mật khẩu...)
 * Có thiết kế tối giản, cao cấp, căn giữa toàn bộ, đi kèm hiệu ứng viền neon và glassmorphism.
 */
function MessageLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-color)] text-[var(--text-color)] font-sans transition-colors duration-300 relative px-4 overflow-hidden">
      {/* Nút bật/tắt theme ở góc trên cùng bên phải */}
      <button 
        className="fixed top-5 right-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] px-4 py-2 rounded-full cursor-pointer z-50 text-sm font-semibold shadow-[0_2px_8px_var(--shadow-color)] hover:bg-[var(--border-color)] hover:-translate-y-0.5 transition-all duration-200"
        onClick={toggleTheme}
      >
        {theme === "light" ? "🌙 Tối" : "☀️ Sáng"}
      </button>

      {/* Hiệu ứng đốm sáng mờ nhẹ ở nền tạo chiều sâu mỹ thuật */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Container Thẻ thông báo Glassmorphism đẳng cấp */}
      <div className="w-full max-w-[480px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-8 sm:p-10 shadow-[0_20px_50px_var(--shadow-color)] relative z-10 before:absolute before:inset-0 before:rounded-[32px] before:p-[1px] before:bg-gradient-to-b before:from-primary/20 before:to-transparent before:-z-10 animate-slide-down">
        {children}
      </div>
    </div>
  );
}

export default MessageLayout;
