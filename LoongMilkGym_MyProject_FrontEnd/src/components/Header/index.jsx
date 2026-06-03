import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LogOut, 
  User, 
  Home, 
  Compass, 
  Sparkles, 
  ShoppingBag,
  Dumbbell,
  Menu,
  X,
  Users,
  LogIn,
  UserPlus,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import paths from "@/config/path";

// Danh sách các mục điều hướng chính trên Desktop
const NAV_ITEMS = [
  { label: "Trang chủ", path: paths.home },
  { label: "Bảng điều khiển", path: paths.dashboard },
  { label: "Lộ trình", path: "#" },
  { label: "Thư viện", path: paths.exercises },
  { label: "AI Coach", path: "#" },
  { label: "Cửa hàng", path: "#" },
  { label: "Cộng đồng", path: "#" },
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

  // Sử dụng custom hook useClickOutside để đóng dropdown menu khi click ra ngoài
  useClickOutside(userMenuRef, () => setShowUserMenu(false));

  // Danh sách các tab dưới thanh Bottom Nav (Mobile) - Chỉ gồm 4 tab chính, tab thứ 5 là "Thêm"
  const BOTTOM_NAV_ITEMS = [
    { label: "Trang chủ", path: paths.home, icon: Home },
    { label: "Lộ trình", path: "/route-placeholder", icon: Compass },
    { label: "Thư viện", path: paths.exercises, icon: Dumbbell },
    { label: "AI Coach", path: "/ai-coach-placeholder", icon: Sparkles },
  ];

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

              {/* ═══ TRẠNG THÁI CHƯA ĐĂNG NHẬP ═══ */}
              {!isLoggedIn && (
                <>
                  {/* Desktop view */}
                  <div className="hidden sm:flex items-center gap-1.5 xl:gap-2.5">
                    <Link
                      to={paths.register}
                      className="hidden xl:inline-flex px-3 py-1.5 text-xs xl:text-sm xl:px-5 xl:py-2 font-bold no-underline rounded-full whitespace-nowrap text-[var(--text-color)] border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-secondary)] transition-all duration-200 hover:-translate-y-0.5"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to={paths.login}
                      className="px-3 py-1.5 text-xs xl:text-sm xl:px-5 xl:py-2 font-extrabold no-underline rounded-full whitespace-nowrap bg-primary text-black border border-primary shadow-[0_2px_10px_rgba(204,255,0,0.2)] hover:bg-primary-hover hover:-translate-y-0.5 transition-all duration-200"
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
                    className="sm:hidden w-10 h-10 flex items-center justify-center rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] border-2 border-transparent shadow-[0_2px_10px_rgba(204,255,0,0.15)] hover:border-primary/50 transition-all duration-200"
                    aria-label="Xem trang cá nhân"
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
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ BOTTOM NAVIGATION BAR (Mobile only) ═══ */}
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

      {/* ═══ BOTTOM SHEET MENU (Mobile only overlay & drawer) ═══ */}
      {showMobileMenu && (
        <>
          {/* Backdrop mờ */}
          <div 
            onClick={() => setShowMobileMenu(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          />
          
          {/* Bottom Sheet Drawer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)]/95 backdrop-blur-2xl rounded-t-3xl border-t border-[var(--border-color)] px-6 pt-4 pb-10 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto">
            {/* Thanh drag notch nhỏ đại diện cho việc vuốt */}
            <div 
              onClick={() => setShowMobileMenu(false)}
              className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-800 rounded-full mx-auto mb-5 cursor-pointer hover:bg-neutral-400 dark:hover:bg-neutral-700 transition-colors"
            />
            
            {/* Tiêu đề & Nút đóng */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-base font-black tracking-tight text-[var(--text-color)]">Menu Chức Năng</span>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] active:scale-90 transition-transform"
                aria-label="Đóng menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Section (Nếu đăng nhập) */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 p-4 mb-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
                {userInfo?.profile?.avatarUrl ? (
                  <img 
                    src={userInfo.profile.avatarUrl} 
                    alt={userName} 
                    className="w-12 h-12 rounded-full object-cover border border-primary/20"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-black text-primary border border-primary/20">
                    {userInitial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-[var(--text-color)] truncate m-0">{userName}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate m-0 mt-0.5">{userInfo?.email || ""}</p>
                  
                  {/* Badge hạng vip */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`px-2 py-0.5 text-[8px] font-extrabold rounded-full ${
                      userInfo?.profile?.membershipTier === "VIP" 
                        ? "bg-amber-400/10 text-amber-500 border border-amber-500/20" 
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {userInfo?.profile?.membershipTier || "STANDARD"}
                    </span>
                    <span className="px-2 py-0.5 text-[8px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {userInfo?.profile?.fitnessLevel ? "Đã đặt trình độ" : "Người mới"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 mb-5 bg-primary/5 border border-primary/10 rounded-2xl text-center">
                <p className="text-xs font-bold text-[var(--text-muted)] m-0">Đăng nhập để theo dõi lộ trình và kết nối cùng huấn luyện viên AI của riêng bạn!</p>
              </div>
            )}

            {/* Menu Grid (Thiết kế cực kỳ sang xịn) */}
            <div className="grid grid-cols-3 gap-3">
              {/* Bảng điều khiển */}
              <Link 
                to={paths.dashboard}
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
              >
                <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2 group-hover:bg-orange-500 group-hover:text-black transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Bảng điều khiển</span>
              </Link>

              {/* Cửa hàng */}
              <Link 
                to="/shop-placeholder"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Cửa hàng</span>
              </Link>

              {/* Cộng đồng */}
              <Link 
                to="/community-placeholder"
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:bg-indigo-500 group-hover:text-black transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Cộng đồng</span>
              </Link>

              {/* Tài khoản */}
              <Link 
                to={isLoggedIn ? paths.profile : paths.login}
                onClick={() => setShowMobileMenu(false)}
                className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Tài khoản</span>
              </Link>

              {/* Nút Authentication chính */}
              {!isLoggedIn ? (
                <>
                  <Link 
                    to={paths.login}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-black transition-colors">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Đăng nhập</span>
                  </Link>
                  <Link 
                    to={paths.register}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline col-span-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Đăng ký tài khoản</span>
                  </Link>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setShowMobileMenu(false);
                    handleLogout();
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-red-500/50 transition-all active:scale-95 duration-200 group col-span-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-2 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-[#ff4d4f] text-center whitespace-nowrap">Đăng xuất tài khoản</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Header;
