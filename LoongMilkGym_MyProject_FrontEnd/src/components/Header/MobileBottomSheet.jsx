import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  X, 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  User, 
  LogIn, 
  UserPlus, 
  LogOut 
} from "lucide-react";
import paths from "@/config/path";

/**
 * Bottom Sheet Menu (Mobile only)
 * Overlay kính mờ + drawer slide-up chứa thông tin tài khoản và lưới hành động
 */
function MobileBottomSheet({ 
  show, 
  onClose, 
  isLoggedIn, 
  userInfo, 
  userName, 
  userInitial, 
  handleLogout 
}) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop mờ */}
      <div 
        onClick={onClose}
        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] transition-opacity duration-300"
      />
      
      {/* Bottom Sheet Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[var(--bg-secondary)]/95 backdrop-blur-2xl rounded-t-3xl border-t border-[var(--border-color)] px-5 pt-3 pb-8 shadow-2xl animate-slide-up max-h-[80vh] overflow-y-auto">
        {/* Thanh drag notch nhỏ đại diện cho việc vuốt */}
        <div 
          onClick={onClose}
          className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-800 rounded-full mx-auto mb-3 cursor-pointer hover:bg-neutral-400 dark:hover:bg-neutral-700 transition-colors"
        />
        
        {/* Tiêu đề & Nút đóng */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-sm font-black tracking-tight text-[var(--text-color)]">Menu Chức Năng</span>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] active:scale-90 transition-transform"
            aria-label="Đóng menu"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Profile Section (Nếu đăng nhập) */}
        {isLoggedIn ? (
          <Link
            to={paths.profile}
            onClick={onClose}
            className="flex items-center gap-3 p-3 mb-4 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl no-underline active:scale-[0.99] transition-transform"
          >
            {userInfo?.profile?.avatarUrl ? (
              <img 
                src={userInfo.profile.avatarUrl} 
                alt={userName} 
                className="w-10 h-10 rounded-full object-cover border border-primary/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base font-black text-primary border border-primary/20">
                {userInitial}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-extrabold text-[var(--text-color)] truncate m-0">{userName}</p>
              <p className="text-[11px] text-[var(--text-muted)] truncate m-0 mt-0.5">{userInfo?.email || ""}</p>
              
              {/* Badge hạng vip */}
              <div className="flex items-center gap-1 mt-1">
                <span className={`px-2 py-0.5 text-[7px] font-extrabold rounded-full ${
                  userInfo?.profile?.membershipTier === "VIP" 
                    ? "bg-amber-400/10 text-amber-500 border border-amber-500/20" 
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  {userInfo?.profile?.membershipTier || "STANDARD"}
                </span>
                <span className="px-2 py-0.5 text-[7px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {userInfo?.profile?.fitnessLevel ? "Đã đặt trình độ" : "Người mới"}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="p-3 mb-4 bg-primary/5 border border-primary/10 rounded-2xl text-center">
            <p className="text-[11px] font-bold text-[var(--text-muted)] m-0">Đăng nhập để theo dõi lộ trình và kết nối cùng huấn luyện viên AI của riêng bạn!</p>
          </div>
        )}

        {/* Menu Grid (Thiết kế cực kỳ sang xịn) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Bảng điều khiển */}
          <Link 
            to={paths.dashboard}
            onClick={onClose}
            className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-1.5 group-hover:bg-orange-500 group-hover:text-black transition-colors">
              <LayoutDashboard className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Bảng điều khiển</span>
          </Link>

          {/* Cửa hàng */}
          <Link 
            to={paths.store}
            onClick={onClose}
            className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-1.5 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Cửa hàng</span>
          </Link>

          {/* Cộng đồng */}
          <Link 
            to={paths.community}
            onClick={onClose}
            className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-1.5 group-hover:bg-indigo-500 group-hover:text-black transition-colors">
              <Users className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Cộng đồng</span>
          </Link>

          {/* Trang cá nhân */}
          <Link 
            to={isLoggedIn ? `/profile/${userInfo?.id}` : paths.login}
            onClick={onClose}
            className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-all active:scale-95 duration-200 group no-underline"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1.5 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <User className="w-4.5 h-4.5" />
            </div>
            <span className="text-[9px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Trang cá nhân</span>
          </Link>

          {/* Nút Authentication chính */}
          {!isLoggedIn ? (
            <>
              <Link
                to={paths.login}
                onClick={onClose}
                className="flex flex-col items-center justify-center min-h-[88px] p-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-colors active:scale-[0.98] duration-200 group no-underline touch-manipulation select-none"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-black transition-colors">
                  <LogIn className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[var(--text-color)] text-center whitespace-nowrap">Đăng nhập</span>
              </Link>
              <Link
                to={paths.register}
                onClick={onClose}
                className="flex flex-col items-center justify-center min-h-[88px] p-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-primary/50 transition-colors active:scale-[0.98] duration-200 group no-underline col-span-2 touch-manipulation select-none"
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
                onClose();
                handleLogout();
              }}
              className="flex flex-col items-center justify-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl hover:border-red-500/50 transition-all active:scale-95 duration-200 group col-span-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-1.5 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <span className="text-[9px] font-bold text-[#ff4d4f] text-center whitespace-nowrap">Đăng xuất tài khoản</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default MobileBottomSheet;
