import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  ShieldAlert, 
  ShoppingBag, 
  Dumbbell, 
  Activity,
  LogOut 
} from "lucide-react";
import paths from "@/config/path";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { theme } = useTheme();
  const { userInfo, userName, userInitial, handleLogout } = useAuth();

  const menuItems = [
    { label: "Tổng quan", path: paths.DASHBOARD, icon: LayoutDashboard },
    { label: "Người dùng", path: paths.USERS, icon: Users },
    { label: "Bài viết", path: paths.POSTS, icon: MessageSquare },
    { label: "Báo cáo", path: paths.REPORTS, icon: ShieldAlert },
    { label: "Sản phẩm", path: paths.PRODUCTS, icon: ShoppingBag },
    { label: "Giáo án", path: paths.WORKOUT_PROGRAMS, icon: Dumbbell },
    { label: "Bài tập", path: paths.EXERCISES, icon: Activity },
  ];

  return (
    <aside className="w-64 border-r border-[var(--border-color)]/60 bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[var(--border-color)]/60 flex items-center">
        <Link to={paths.DASHBOARD} className="flex flex-col items-start justify-center gap-0.5">
          <span className={`font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent select-none filter transition-all duration-300 drop-shadow-[0_2px_8px_rgba(204,255,0,0.15)] text-xl ${
            theme === "light"
              ? "from-[#99cc00] to-[#00a8cc]"
              : "from-[#ccff00] to-[#00f5d4]"
          }`}>
            LoongMilKGym
          </span>
          <span className="text-[9px] font-extrabold tracking-wider text-[var(--text-muted)] leading-none">HỆ THỐNG QUẢN TRỊ</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--text-primary)] border-l-4 border-[var(--color-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-[var(--border-color)]/60 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          {userInfo?.profile?.avatarUrl ? (
            <img
              src={userInfo.profile.avatarUrl}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border border-[var(--border-color)]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center font-bold text-sm shadow-md">
              {userInitial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-[var(--text-color)] truncate">{userName}</h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5">Quản trị viên</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/25 hover:bg-rose-500/10 text-rose-500 text-xs font-extrabold cursor-pointer transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
