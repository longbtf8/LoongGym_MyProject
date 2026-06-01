import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LogOut, 
  User, 
  Home, 
  Compass, 
  Sparkles, 
  ShoppingBag 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import paths from "@/config/path";

// Danh sách các mục điều hướng chính trên Desktop
const NAV_ITEMS = [
  { label: "Trang chủ", path: paths.home },
  { label: "Lộ trình", path: "#" },
  { label: "Thư viện", path: "#" },
  { label: "AI Coach", path: "#" },
  { label: "Cửa hàng", path: "#" },
  { label: "Cộng đồng", path: "#" },
];

function Header() {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Sử dụng custom hook useAuth để quản lý logic xác thực
  const {
    isLoggedIn,
    userInfo,
    userName,
    userInitial,
    handleLogout,
  } = useAuth();

  // Sử dụng custom hook useClickOutside để đóng dropdown menu khi click ra ngoài
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  // Danh sách các tab dưới thanh Bottom Nav (Mobile)
  const BOTTOM_NAV_ITEMS = [
    { label: "Trang chủ", path: paths.home, icon: Home },
    { label: "Lộ trình", path: "/route-placeholder", icon: Compass },
    { label: "AI Coach", path: "/ai-coach-placeholder", icon: Sparkles },
    { label: "Cửa hàng", path: "/shop-placeholder", icon: ShoppingBag },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] transition-colors duration-300 bg-[var(--bg-color)]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">

            {/* ═══ LOGO (Trái) ═══ */}
            <Logo className="text-2xl" />

            {/* ═══ NAV LINKS (Giữa - Ẩn trên mobile) ═══ */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`relative px-4 py-2 text-sm font-semibold no-underline rounded-full transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* ═══ ACTIONS (Phải) ═══ */}
            <div className="flex items-center gap-3">
              {/* Nút chuyển đổi Theme Sáng/Tối */}
              <ThemeToggle />

              {/* ═══ TRẠNG THÁI CHƯA ĐĂNG NHẬP ═══ */}
              {!isLoggedIn && (
                <>
                  {/* Desktop view */}
                  <div className="hidden sm:flex items-center gap-2.5">
                    <Link
                      to={paths.register}
                      className="px-5 py-2 text-sm font-bold no-underline rounded-full text-[var(--text-color)] border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-secondary)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={paths.login}
                      className="px-5 py-2 text-sm font-extrabold no-underline rounded-full bg-primary text-black border border-primary shadow-[0_2px_10px_rgba(204,255,0,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Đăng nhập
                    </Link>
                  </div>

                  {/* Mobile view (Icon User dẫn thẳng tới trang Đăng nhập) */}
                  <Link
                    to={paths.login}
                    className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                    aria-label="Đăng nhập"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                </>
              )}

              {/* ═══ TRẠNG THÁI ĐÃ ĐĂNG NHẬP - AVATAR ═══ */}
              {isLoggedIn && (
                <>
                  {/* Desktop view (Bấm hiện dropdown) */}
                  <div className="relative hidden sm:block" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#00f5d4] text-black font-black text-base cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(204,255,0,0.15)]"
                      aria-label="Menu tài khoản"
                    >
                      {userInitial}

                      {/* Tooltip tên tài khoản khi hover */}
                      <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md border 
                        bg-neutral-900 text-white border-neutral-800
                        dark:bg-neutral-800 dark:text-neutral-100 dark:border-primary/20 dark:shadow-[0_0_12px_rgba(204,255,0,0.12)]"
                      >
                        {userName}
                      </span>
                    </button>

                    {/* Dropdown Menu khi click Avatar */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden animate-slide-down z-50">
                        {/* Thông tin user */}
                        <div className="px-4 py-3 border-b border-[var(--border-color)]">
                          <p className="text-sm font-bold text-[var(--text-color)] m-0 truncate">{userName}</p>
                          <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5 truncate">{userInfo?.email || ""}</p>
                        </div>

                        {/* Menu links */}
                        <Link
                          to={paths.profile}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-color)] no-underline hover:bg-[var(--border-color)]/30 transition-colors duration-200"
                        >
                          <User className="w-4 h-4 text-[var(--text-muted)]" />
                          Thông tin cá nhân
                        </Link>

                        {/* Nút Đăng xuất */}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#ff4d4f] bg-transparent border-t border-[var(--border-color)] border-l-0 border-r-0 border-b-0 cursor-pointer hover:bg-[#ff4d4f]/10 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mobile view (Click nhảy thẳng vào trang Profile) */}
                  <Link
                    to={paths.profile}
                    className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#00f5d4] text-black font-black text-base border-2 border-transparent shadow-[0_2px_10px_rgba(204,255,0,0.15)] hover:border-primary/50 transition-all duration-200"
                    aria-label="Xem trang cá nhân"
                  >
                    {userInitial}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ BOTTOM NAVIGATION BAR (Mobile only) ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-t border-[var(--border-color)] flex items-center justify-around px-2 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.22)] z-50">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-14 h-full no-underline transition-colors duration-200 ${
                isActive 
                  ? "text-primary" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Tab Tài khoản thứ 5 */}
        <Link
          to={isLoggedIn ? paths.profile : paths.login}
          className={`flex flex-col items-center justify-center gap-1 w-14 h-full no-underline transition-colors duration-200 ${
            location.pathname === paths.profile || location.pathname === paths.login
              ? "text-primary" 
              : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
          }`}
        >
          {isLoggedIn ? (
            <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black bg-gradient-to-br from-primary to-[#00f5d4] text-black shadow-sm ${
              location.pathname === paths.profile ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--bg-secondary)]" : ""
            }`}>
              {userInitial}
            </div>
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-[10px] font-bold tracking-tight">Tài khoản</span>
        </Link>
      </nav>
    </>
  );
}

export default Header;
