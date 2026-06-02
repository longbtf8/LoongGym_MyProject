import React, { useState } from "react";
import { 
  User, 
  ChevronRight,
  Lock,
  Shield,
  Bell,
  ShoppingBag,
  ArrowLeft,
  LogOut
} from "lucide-react";

import PersonalInfoSection from "./PersonalInfoSection/index";
import SecuritySection from "./SecuritySection";
import PlaceholderSection from "./PlaceholderSection";
import { useProfileForm } from "./hooks/useProfileForm";

function Profile() {
  const {
    userInfo,
    formData,
    isEditing,
    setIsEditing,
    handleChange,
    handleSave,
    handleCancel,
    formatDateDisplay,
    handleLogout,
    isSaving,
    errorMessage
  } = useProfileForm();
  
  // Quản lý tab hiện tại cho cả Desktop và Mobile: "personal_info" | "security" | "privacy" | "notifications" | "orders"
  const [activeTab, setActiveTab] = useState("personal_info");
  
  // Trạng thái view trên Mobile: "menu" | "detail"
  const [mobileView, setMobileView] = useState("menu");

  // Xử lý chuyển tab trên Mobile (Option A: click chuyển sang view chi tiết và hiển thị nút back)
  const handleMobileTabClick = (tabId) => {
    if (tabId === "logout") {
      handleLogout();
      return;
    }
    setActiveTab(tabId);
    setMobileView("detail");
  };

  // Định nghĩa menu danh mục giống F8
  const MENU_ITEMS = [
    { 
      id: "personal_info", 
      title: "Trang cá nhân", 
      desc: "Xem chỉ số cơ thể, cân nặng, chiều cao và calo.", 
      icon: User, 
      colorClass: "bg-orange-500/10 text-orange-500 border-orange-500/20" 
    },
    { 
      id: "security", 
      title: "Bảo mật", 
      desc: "Cập nhật mật khẩu và quản lý thiết bị đăng nhập.", 
      icon: Lock, 
      colorClass: "bg-amber-500/10 text-amber-500 border-amber-500/20" 
    },
    { 
      id: "privacy", 
      title: "Quyền riêng tư", 
      desc: "Cấu hình quyền riêng tư và chia sẻ dữ liệu sức khỏe.", 
      icon: Shield, 
      colorClass: "bg-sky-500/10 text-sky-500 border-sky-500/20" 
    },
    { 
      id: "notifications", 
      title: "Cài đặt thông báo", 
      desc: "Quản lý lịch nhắc nhở luyện tập và tin tức LoongGym.", 
      icon: Bell, 
      colorClass: "bg-purple-500/10 text-purple-500 border-purple-500/20" 
    },
    { 
      id: "orders", 
      title: "Đơn hàng của tôi", 
      desc: "Lịch sử giao dịch, gói tập và hóa đơn mua sắm.", 
      icon: ShoppingBag, 
      colorClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
    },
    { 
      id: "logout", 
      title: "Đăng xuất", 
      desc: "Thoát khỏi tài khoản trên thiết bị này.", 
      icon: LogOut, 
      colorClass: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      isDangerous: true 
    }
  ];

  return (
    <div className="w-full min-h-screen py-6 mb-16 lg:mb-6 animate-slide-down">
      
      {/* GIAO DIỆN DESKTOP */}
      <div className="hidden lg:flex gap-8">
        
        {/* SIDEBAR BÊN TRÁI - DANH MỤC TÀI KHOẢN */}
        <aside className="w-[280px] shrink-0">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm transition-all duration-300">
            <h3 className="text-xl font-extrabold text-[var(--text-color)] mb-6 px-2">
              Tài khoản
            </h3>
            <nav className="flex flex-col gap-2">
              {MENU_ITEMS.filter(item => item.id !== "logout").map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-primary text-black shadow-[0_4px_12px_rgba(204,255,0,0.15)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-black" : "opacity-60"}`} />
                  </button>
                );
              })}
              
              <div className="h-[1px] bg-[var(--border-color)] my-2" />
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4.5 h-4.5" />
                  <span>Đăng xuất</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTAINER CHÍNH BÊN PHẢI (DESKTOP) */}
        <main className="flex-1 flex flex-col gap-6">
          {activeTab === "personal_info" && (
            <PersonalInfoSection 
              formData={formData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleChange={handleChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              formatDateDisplay={formatDateDisplay}
              userInfo={userInfo}
              isSaving={isSaving}
              errorMessage={errorMessage}
            />
          )}

          {activeTab === "security" && (
            <SecuritySection />
          )}

          {activeTab !== "personal_info" && activeTab !== "security" && (
            <PlaceholderSection title={MENU_ITEMS.find(i => i.id === activeTab)?.title || ""} />
          )}
        </main>
      </div>

      {/* GIAO DIỆN MOBILE */}
      <div className="lg:hidden">
        
        {/* VIEW 1: MENU DANH MỤC XẾP DỌC (GIỐNG HỆT F8 MOCKUP) */}
        {mobileView === "menu" && (
          <div className="flex flex-col gap-5">
            
            {/* THẺ TÀI KHOẢN TRÊN CÙNG */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 flex items-center gap-4.5 shadow-sm transition-all duration-300">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm">
                  {userInfo?.profile?.avatarUrl ? (
                    <img 
                      src={userInfo.profile.avatarUrl} 
                      alt={formData.fullName} 
                      className="w-full h-full rounded-full object-cover bg-[var(--bg-color)]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-xl font-black text-primary">
                      {formData.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-hidden text-left">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest block leading-none mb-1">
                  TÀI KHOẢN
                </span>
                <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight truncate">
                  {formData.fullName}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-medium m-0 truncate mt-0.5">
                  {userInfo?.email || "@buithanhlong1"}
                </p>
              </div>
            </div>

            {/* DANH SÁCH MENU DỌC MOCKUP F8 */}
            <div className="flex flex-col gap-3">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleMobileTabClick(item.id)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--border-color)]/20 active:scale-[0.99] transition-all duration-150 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${item.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="text-left overflow-hidden">
                        <h4 className={`text-sm font-extrabold m-0 leading-tight ${item.isDangerous ? "text-rose-500" : "text-[var(--text-color)]"}`}>
                          {item.title}
                        </h4>
                        <p className={`text-xs m-0 mt-1 leading-normal truncate max-w-[200px] ${item.isDangerous ? "text-rose-400/80" : "text-[var(--text-muted)] font-medium"}`}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    
                    <ChevronRight className={`w-4 h-4 shrink-0 ${item.isDangerous ? "text-rose-400" : "text-[var(--text-muted)] opacity-60"}`} />
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* VIEW 2: CHI TIẾT KHI CLICK (OPTION A - CÓ NÚT BACK QUAY LẠI) */}
        {mobileView === "detail" && (
          <div className="flex flex-col gap-4">
            
            {/* NÚT QUAY LẠI HÀNG ĐẦU */}
            <button
              onClick={() => {
                setMobileView("menu");
                setIsEditing(false);
              }}
              className="self-start flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm font-extrabold text-[var(--text-color)] hover:text-primary transition-all duration-200 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              Quay lại danh mục
            </button>

            {/* NỘI DUNG CHI TIẾT TƯƠNG ỨNG TAB */}
            <div className="mt-2">
              {activeTab === "personal_info" && (
                <PersonalInfoSection 
                  formData={formData}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  handleChange={handleChange}
                  handleSave={handleSave}
                  handleCancel={handleCancel}
                  formatDateDisplay={formatDateDisplay}
                  userInfo={userInfo}
                  isSaving={isSaving}
                  errorMessage={errorMessage}
                />
              )}

              {activeTab === "security" && (
                <SecuritySection />
              )}

              {activeTab !== "personal_info" && activeTab !== "security" && (
                <PlaceholderSection title={MENU_ITEMS.find(i => i.id === activeTab)?.title || ""} />
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;
