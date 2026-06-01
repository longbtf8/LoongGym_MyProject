import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import paths from "@/config/path";

// Danh sách các mục điều hướng chính
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
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
              <div className="hidden sm:flex items-center gap-2.5">
                {/* Nút Đăng ký - Ghost Style */}
                <Link
                  to={paths.register}
                  className="px-5 py-2 text-sm font-bold no-underline rounded-full text-[var(--text-color)] border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-secondary)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>

                {/* Nút Đăng nhập - Neon CTA */}
                <Link
                  to={paths.login}
                  className="px-5 py-2 text-sm font-extrabold no-underline rounded-full bg-primary text-black border border-primary shadow-[0_2px_10px_rgba(204,255,0,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

            {/* ═══ TRẠNG THÁI ĐÃ ĐĂNG NHẬP - AVATAR ═══ */}
            {isLoggedIn && (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#00f5d4] text-black font-black text-base cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(204,255,0,0.15)]"
                  aria-label="Menu tài khoản"
                >
                  {userInitial}

                  {/* Tooltip tên tài khoản khi hover */}
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-secondary)] text-[var(--text-color)] border border-[var(--border-color)] shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50">
                    {userName}
                  </span>
                </button>

                {/* Dropdown Menu khi click Avatar */}
                {showUserMenu && (
                  <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden animate-slide-down z-50">
                    {/* Thông tin user */}
                    <div className="px-4 py-3 border-b border-[var(--border-color)]">
                      <p className="text-sm font-bold text-[var(--text-color)] m-0 truncate">{userName}</p>
                      <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5 truncate">{userInfo?.email || ""}</p>
                    </div>

                    {/* Nút Đăng xuất */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#ff4d4f] bg-transparent border-none cursor-pointer hover:bg-[#ff4d4f]/10 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ═══ HAMBURGER MENU (Mobile) ═══ */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] cursor-pointer hover:bg-[var(--border-color)] transition-all duration-200"
              aria-label="Mở menu di động"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE MENU (Slide Down) ═══ */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-color)] bg-[var(--bg-color)]/95 backdrop-blur-xl animate-slide-down">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {/* Nav links mobile */}
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-4 py-3 text-sm font-semibold no-underline rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Auth buttons mobile */}
            {!isLoggedIn && (
              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-[var(--border-color)]">
                <Link
                  to={paths.register}
                  className="w-full py-3 text-center text-sm font-bold no-underline rounded-full text-[var(--text-color)] border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-secondary)] transition-all duration-200"
                >
                  Đăng ký
                </Link>
                <Link
                  to={paths.login}
                  className="w-full py-3 text-center text-sm font-extrabold no-underline rounded-full bg-primary text-black border border-primary shadow-[0_2px_10px_rgba(204,255,0,0.2)] hover:bg-primary-hover transition-all duration-200"
                >
                  Đăng nhập
                </Link>
              </div>
            )}

            {/* User info mobile */}
            {isLoggedIn && (
              <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#00f5d4] text-black font-black text-sm shrink-0">
                    {userInitial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-[var(--text-color)] m-0 truncate">{userName}</p>
                    <p className="text-xs text-[var(--text-muted)] m-0 truncate">{userInfo?.email || ""}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#ff4d4f] bg-transparent border-none cursor-pointer rounded-xl hover:bg-[#ff4d4f]/10 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
