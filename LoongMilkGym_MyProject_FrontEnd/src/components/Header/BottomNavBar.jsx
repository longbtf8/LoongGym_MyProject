import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Dumbbell, Sparkles, Menu } from "lucide-react";
import paths from "@/config/path";

/**
 * Thanh Bottom Navigation Bar (Mobile only)
 * Hiển thị 4 tab chính + 1 nút "Thêm" mở Bottom Sheet
 */
function BottomNavBar({ showMobileMenu, setShowMobileMenu }) {
  const location = useLocation();

  const BOTTOM_NAV_ITEMS = [
    { label: "Trang chủ", path: paths.home, icon: Home },
    { label: "Lịch tập", path: paths.myPlan, icon: CalendarDays },
    { label: "Thư viện", path: paths.exercises, icon: Dumbbell },
    { label: "AI Coach", path: paths.aiCoach, icon: Sparkles },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 py-1 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border-color)] z-50">
      <nav className="grid grid-cols-5 gap-0 w-full px-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 py-1.5 mx-0.5 rounded-xl no-underline transition-colors duration-200 ${
                isActive 
                  ? "bg-primary text-black font-extrabold shadow-md shadow-primary/10" 
                  : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]"
              }`}
            >
              <IconComponent className="w-4.5 h-4.5" />
              <span className="text-[9px] font-bold tracking-tight leading-none">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Nút Thêm (Mở Bottom Sheet) */}
        <button
          onClick={() => setShowMobileMenu(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1.5 mx-0.5 rounded-xl border-0 bg-transparent cursor-pointer transition-colors duration-200 ${
            showMobileMenu 
              ? "text-primary font-extrabold" 
              : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
          }`}
        >
          <Menu className="w-4.5 h-4.5" />
          <span className="text-[9px] font-bold tracking-tight leading-none">Thêm</span>
        </button>
      </nav>
    </div>
  );
}

export default BottomNavBar;
