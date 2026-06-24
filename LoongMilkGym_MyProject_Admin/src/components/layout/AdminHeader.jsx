import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import paths from "@/config/path";

export default function AdminHeader({ onMenuClick }) {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { userInfo, userName, userInitial, handleLogout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    switch (pathname) {
      case paths.DASHBOARD:
        return "Tổng quan";
      case paths.USERS:
        return "Người dùng";
      case paths.POSTS:
        return "Bài viết";
      case paths.REPORTS:
        return "Báo cáo";
      case paths.PRODUCTS:
        return "Sản phẩm";
      case paths.WORKOUT_PROGRAMS:
        return "Giáo án";
      case paths.EXERCISES:
        return "Bài tập";
      default:
        return "Quản lý hệ thống";
    }
  };

  return (
    <header className="h-16 border-b border-[var(--border-color)]/60 bg-[var(--bg-secondary)]/85 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Mobile Menu Trigger & Dynamic Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-black text-[var(--text-color)] tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Theme Switcher & Profile Dropdown */}
      <div className="flex items-center gap-4">
        {/* Toggle Theme Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
          title={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--border-color)]/30 transition-all cursor-pointer border border-transparent hover:border-[var(--border-color)]"
          >
            {userInfo?.profile?.avatarUrl ? (
              <img
                src={userInfo.profile.avatarUrl}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover border border-[var(--border-color)]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center font-bold text-sm shadow-md">
                {userInitial}
              </div>
            )}
          </button>

          {dropdownOpen && (
            <>
              {/* Overlay background for closing dropdown */}
              <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2.5 w-48 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl p-2 z-40 animate-reactions-in origin-top-right">
                <div className="px-3 py-2 border-b border-[var(--border-color)]/60 mb-1">
                  <p className="text-xs text-[var(--text-muted)] font-semibold">Tài khoản</p>
                  <p className="text-xs font-bold text-[var(--text-color)] truncate">{userInfo?.email || "admin@loongmilkgym.com"}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-extrabold text-rose-500 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
