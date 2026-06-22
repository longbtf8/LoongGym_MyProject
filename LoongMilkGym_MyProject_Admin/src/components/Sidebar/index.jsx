import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  ShoppingBag, 
  Receipt, 
  MessageSquare, 
  Settings, 
  X,
  Sparkles
} from "lucide-react";
import paths from "@/config/path";
import { useTheme } from "@/context/ThemeContext";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  const menuItems = [
    { label: "Tổng quan", path: paths.dashboard, icon: LayoutDashboard },
    { label: "Người dùng", path: paths.users, icon: Users },
    { label: "Bài tập", path: paths.exercises, icon: Dumbbell },
    { label: "Cửa hàng", path: paths.store, icon: ShoppingBag },
    { label: "Đơn hàng", path: paths.orders, icon: Receipt },
    { label: "Cộng đồng", path: paths.community, icon: MessageSquare },
    { label: "Cài đặt", path: paths.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r border-[var(--border-color)]/60 bg-[var(--bg-secondary)] flex flex-col z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[var(--border-color)]/60 flex items-center justify-between">
          <Link to="/" className="flex flex-col items-start justify-center gap-0.5">
            <span className={`font-black tracking-tighter bg-gradient-to-r bg-clip-text text-transparent select-none filter transition-all duration-300 drop-shadow-[0_2px_8px_rgba(204,255,0,0.15)] text-xl ${
              theme === "light"
                ? "from-[#99cc00] to-[#00a8cc]"
                : "from-[#ccff00] to-[#00f5d4]"
            }`}>
              LoongMilKGym
            </span>
            <span className="text-[9px] font-extrabold tracking-wider text-[var(--text-muted)] leading-none">HỆ THỐNG QUẢN TRỊ</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
                onClick={() => setIsOpen(false)}
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

        {/* Footer info */}
        <div className="p-4 border-t border-[var(--border-color)]/60 text-center">
          <p className="text-[10px] font-semibold text-[var(--text-muted)]">Phiên bản Admin 1.0.0</p>
        </div>
      </aside>
    </>
  );
}
