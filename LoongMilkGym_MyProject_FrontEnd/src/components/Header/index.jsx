import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
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
            )}

            {/* ═══ HAMBURGER MENU (Mobile) ═══ */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-color)] cursor-pointer hover:border-primary/50 hover:bg-[var(--border-color)]/30 active:scale-95 transition-all duration-200"
              aria-label="Mở menu di động"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE SLIDE DRAWER (Trượt từ bên phải sang) ═══ */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop tối mờ mịn phía sau - Đồng bộ sáng tối */}
          <div 
            className="fixed inset-0 bg-black/35 dark:bg-black/70 backdrop-blur-[3px] z-[99] lg:hidden animate-fade-in animate-duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer trượt chính - Đồng bộ shadow sáng tối */}
          <div className="fixed top-0 right-0 h-screen w-[320px] max-w-[85vw] bg-[var(--bg-secondary)] border-l border-[var(--border-color)] z-[100] lg:hidden shadow-[0_0_50px_rgba(0,0,0,0.06)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col p-6 animate-slide-left">
            
            {/* Drawer Header: Logo + Nút Đóng */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <Logo className="text-xl" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/50 active:scale-90 transition-all duration-200 cursor-pointer"
                aria-label="Đóng menu"
              >
                <X className="w-4 h-4 transition-transform duration-300 hover:rotate-90" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pt-4 pr-1">
              
              {/* ═══ PHẦN TÀI KHOẢN (Đưa lên trên đầu) ═══ */}
              {isLoggedIn ? (
                <div className="flex flex-col gap-2">
                  
                  {/* Card thông tin user */}
                  <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#00f5d4] text-black font-black text-sm shrink-0">
                      {userInitial}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-[var(--text-color)] m-0 truncate leading-none mb-1">{userName}</p>
                      <p className="text-xs text-[var(--text-muted)] m-0 truncate leading-none">{userInfo?.email || ""}</p>
                    </div>
                  </div>

                  {/* Nút vào Profile */}
                  <Link
                    to={paths.profile}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--text-color)] no-underline rounded-2xl hover:bg-[var(--border-color)]/30 transition-all duration-200"
                  >
                    <User className="w-4.5 h-4.5 text-[var(--text-muted)]" />
                    Thông tin cá nhân
                  </Link>

                  {/* Nút Đăng xuất */}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#ff4d4f] bg-transparent border-none cursor-pointer rounded-2xl hover:bg-[#ff4d4f]/10 transition-all duration-200"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                    Đăng xuất
                  </button>

                  {/* Divider ngăn cách */}
                  <div className="h-[1px] bg-[var(--border-color)] my-1" />

                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to={paths.register}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-bold no-underline rounded-full text-[var(--text-color)] border border-[var(--border-color)] bg-transparent hover:bg-[var(--border-color)]/30 transition-all duration-200"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={paths.login}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-center text-xs font-black no-underline rounded-full bg-primary text-black border border-primary shadow-[0_4px_12px_rgba(204,255,0,0.15)] hover:bg-primary-hover active:bg-primary-active transition-all duration-200"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                  
                  {/* Divider ngăn cách */}
                  <div className="h-[1px] bg-[var(--border-color)] my-1" />
                </div>
              )}

              {/* ═══ DANH SÁCH MENU ĐIỀU HƯỚNG BÊN DƯỚI ═══ */}
              <nav className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-4 mb-1 block">Điều hướng</span>
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 text-sm font-bold no-underline rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "text-primary bg-primary/10 border-l-4 border-primary pl-3"
                          : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

          </div>
        </>
      )}
    </header>
  );
}

export default Header;
