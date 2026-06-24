import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LogOut, 
  User, 
  LayoutDashboard,
  ShoppingCart,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import paths from "@/config/path";
import BottomNavBar from "./BottomNavBar";
import MobileBottomSheet from "./MobileBottomSheet";
import { useGetCartQuery } from "@/services/store/storeApi";

// Danh sách các mục điều hướng chính trên Desktop
const NAV_ITEMS = [
  { label: "Trang chủ", path: paths.home },
  { label: "Bảng điều khiển", path: paths.dashboard },
  { label: "Lịch tập", path: paths.myPlan },
  { label: "Thư viện", path: paths.exercises },
  { label: "AI Coach", path: paths.aiCoach },
  { label: "Cửa hàng", path: paths.store },
  { label: "Cộng đồng", path: paths.community },
];

function Header() {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Sử dụng custom hook useAuth để quản lý logic xác thực
  const {
    isLoggedIn,
    userInfo,
    userName,
    userInitial,
    handleLogout,
  } = useAuth();

  // Lấy dữ liệu giỏ hàng để hiển thị badge
  const { data: cartData } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const cartItemCount = cartData?.data?.summary?.totalQuantity || 0;

  // Sử dụng custom hook useClickOutside để đóng dropdown menu khi click ra ngoài
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] transition-colors duration-300 bg-[var(--bg-color)]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">

            {/* ═══ LOGO (Trái) ═══ */}
            <Logo className="text-2xl" />

            {/* ═══ NAV LINKS (Giữa - Ẩn trên mobile) ═══ */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={`relative px-2.5 py-1.5 text-xs xl:text-sm xl:px-4 xl:py-2 font-semibold no-underline rounded-full whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "text-black bg-primary font-extrabold shadow-sm shadow-primary/10"
                        : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--bg-secondary)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* ═══ ACTIONS (Phải) ═══ */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Nút chuyển đổi Theme Sáng/Tối */}
              <ThemeToggle />

              {/* Nút Giỏ hàng (Chỉ hiện khi đã đăng nhập) */}
              {isLoggedIn && (
                <Link
                  to={paths.cart}
                  className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 no-underline"
                  aria-label="Giỏ hàng"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-black shadow-md shadow-primary/20">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* ═══ TRẠNG THÁI CHƯA ĐĂNG NHẬP ═══ */}
              {!isLoggedIn && (
                <>
                  {/* Desktop view */}
                  <div className="hidden sm:flex items-center gap-2 xl:gap-3">
                    <Link
                      to={paths.register}
                      className="tap-stable hidden xl:inline-flex items-center justify-center min-h-11 px-5 xl:px-6 py-2.5 text-xs xl:text-sm font-bold no-underline rounded-full whitespace-nowrap text-[var(--text-color)] border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-secondary)] active:opacity-90 select-none"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={paths.login}
                      className="tap-stable inline-flex items-center justify-center min-h-11 px-5 xl:px-6 py-2.5 text-xs xl:text-sm font-extrabold no-underline rounded-full whitespace-nowrap bg-primary text-black border border-primary shadow-[0_2px_10px_rgba(204,255,0,0.2)] hover:bg-primary-hover active:opacity-90 select-none"
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
                      className="group relative w-10 h-10 flex items-center justify-center rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-[0_2px_10px_rgba(204,255,0,0.15)] before:absolute before:content-[''] before:w-full before:h-4 before:-bottom-3 before:left-0"
                      aria-label="Menu tài khoản"
                    >
                      {userInfo?.profile?.avatarUrl ? (
                        <img 
                          src={userInfo.profile.avatarUrl} 
                          alt={userName} 
                          className="w-full h-full rounded-full object-cover bg-[var(--bg-color)]"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-base font-black text-primary">
                          {userInitial}
                        </div>
                      )}

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
                          to={paths.dashboard}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-color)] no-underline hover:bg-[var(--border-color)]/30 transition-colors duration-200"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[var(--text-muted)]" />
                          Bảng điều khiển
                        </Link>

                         <Link
                          to={`/profile/${userInfo?.id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-color)] no-underline hover:bg-[var(--border-color)]/30 transition-colors duration-200"
                        >
                          <User className="w-4 h-4 text-[var(--text-muted)]" />
                          Trang cá nhân
                        </Link>

                        <Link
                          to={paths.profile}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--text-color)] no-underline hover:bg-[var(--border-color)]/30 transition-colors duration-200"
                        >
                          <Settings className="w-4 h-4 text-[var(--text-muted)]" />
                          Chỉnh sửa hồ sơ
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

                  {/* Mobile view (Click mở menu chức năng) */}
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] border-2 border-transparent shadow-[0_2px_10px_rgba(204,255,0,0.15)] hover:border-primary/50 transition-all duration-200 cursor-pointer"
                    aria-label="Mở menu chức năng"
                  >
                    {userInfo?.profile?.avatarUrl ? (
                      <img 
                        src={userInfo.profile.avatarUrl} 
                        alt={userName} 
                        className="w-full h-full rounded-full object-cover bg-[var(--bg-color)]"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-base font-black text-primary">
                        {userInitial}
                      </div>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ BOTTOM NAVIGATION BAR (Mobile only) ═══ */}
      <BottomNavBar 
        showMobileMenu={showMobileMenu} 
        setShowMobileMenu={setShowMobileMenu} 
      />

      {/* ═══ BOTTOM SHEET MENU (Mobile only overlay & drawer) ═══ */}
      <MobileBottomSheet
        show={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        userName={userName}
        userInitial={userInitial}
        handleLogout={handleLogout}
      />
    </>
  );
}

export default Header;
