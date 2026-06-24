import React from "react";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import paths from "@/config/path";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear all keys
    navigate(paths.LOGIN, { replace: true });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[var(--text-color)]">Từ chối truy cập</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold leading-relaxed">
            Tài khoản của bạn không có quyền truy cập trang quản trị LoongMilkGym. Vui lòng liên hệ quản trị viên cấp cao hoặc đăng nhập bằng tài khoản khác.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button 
            onClick={() => navigate(paths.LOGIN, { replace: true })}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--border-color)]/30 text-xs font-extrabold transition-all cursor-pointer"
          >
            Đến Đăng nhập
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold transition-all cursor-pointer shadow-md"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
