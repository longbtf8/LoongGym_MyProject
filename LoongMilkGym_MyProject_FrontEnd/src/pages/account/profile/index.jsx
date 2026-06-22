import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  User, 
  ChevronRight,
  Lock,
  Shield,
  Bell,
  ShoppingBag,
  ArrowLeft,
  LogOut,
  Settings
} from "lucide-react";

import PersonalInfoSection from "./PersonalInfoSection/index";
import SecuritySection from "./SecuritySection";
import PlaceholderSection from "./PlaceholderSection";
import { useProfileForm } from "./hooks/useProfileForm";
import { useGetUserProfileByIdQuery } from "@/services/auth/authApi";
import ProfileDashboard from "./components/ProfileDashboard";
import { useAuth } from "@/hooks/useAuth";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=60";

function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  // If viewing other user's profile or own profile dashboard
  const isSettingsPage = !userId;

  // Form hooks for own profile
  const ownProfileForm = useProfileForm();
  
  // Query other user's profile if userId exists
  const { data: otherProfileResponse, isLoading: isLoadingOtherProfile } = useGetUserProfileByIdQuery(userId, {
    skip: isSettingsPage,
  });

  // State to manage edit sub-view on own profile dashboard
  const [showEditForm, setShowEditForm] = useState(false);

  // Current tab in Sidebar (Own profile only): "personal_info" | "security" | "privacy" | "notifications" | "orders"
  const [activeTab, setActiveTab] = useState("personal_info");
  
  // Mobile navigation state
  const [mobileView, setMobileView] = useState("menu");

  const handleMobileTabClick = (tabId) => {
    if (tabId === "logout") {
      ownProfileForm.handleLogout();
      return;
    }
    setActiveTab(tabId);
    setMobileView("detail");
  };

  const MENU_ITEMS = [
    { 
      id: "personal_info", 
      title: "Chỉnh sửa hồ sơ", 
      desc: "Cập nhật thông tin cá nhân, chỉ số chiều cao và cân nặng.", 
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

  // ==========================================
  // RENDER PROFILE DASHBOARD PAGE (/profile/:userId)
  // ==========================================
  if (!isSettingsPage) {
    const isOwnProfileDashboard = userId === userInfo?.id;
    return (
      <div className="w-full min-h-screen py-6 mb-16 lg:mb-6 px-4 max-w-[1250px] mx-auto animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4.5 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-xs font-black text-[var(--text-color)] hover:text-primary transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>Quay lại</span>
        </button>

        {isLoadingOtherProfile ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Đang tải hồ sơ...</span>
          </div>
        ) : (
          <ProfileDashboard 
            profile={otherProfileResponse?.data} 
            isOwnProfile={isOwnProfileDashboard} 
          />
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER OWN PROFILE (WITH EDIT SIDEBAR)
  // ==========================================
  return (
    <div className="w-full min-h-screen py-6 mb-16 lg:mb-6 animate-slide-down">
      
      {/* DESKTOP VIEW */}
      <div className="hidden lg:flex gap-8 max-w-[1200px] mx-auto px-4">
        
        {/* LEFT SIDEBAR MENU */}
        <aside className="w-[280px] shrink-0">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
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
                    onClick={() => { setActiveTab(item.id); setShowEditForm(false); }}
                    className={`flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? "bg-primary text-black shadow-md"
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
                onClick={ownProfileForm.handleLogout}
                className="flex items-center justify-between w-full px-4 py-3.5 text-sm font-bold rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
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

        {/* RIGHT PANEL CONTENT */}
        <main className="flex-1 flex flex-col gap-6">
          {activeTab === "personal_info" && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
              <PersonalInfoSection 
                formData={ownProfileForm.formData}
                isEditing={ownProfileForm.isEditing}
                setIsEditing={ownProfileForm.setIsEditing}
                handleChange={ownProfileForm.handleChange}
                handleAvatarChange={ownProfileForm.handleAvatarChange}
                handleSave={ownProfileForm.handleSave}
                handleCancel={ownProfileForm.handleCancel}
                formatDateDisplay={ownProfileForm.formatDateDisplay}
                userInfo={ownProfileForm.userInfo}
                isSaving={ownProfileForm.isSaving}
                avatarPreviewUrl={ownProfileForm.avatarPreviewUrl}
                errorMessage={ownProfileForm.errorMessage}
              />
            </div>
          )}

          {activeTab === "security" && (
            <SecuritySection />
          )}

          {activeTab !== "personal_info" && activeTab !== "security" && (
            <PlaceholderSection title={MENU_ITEMS.find(i => i.id === activeTab)?.title || ""} />
          )}
        </main>

      </div>

      {/* MOBILE VIEW */}
      <div className="lg:hidden px-4">
        
        {/* VIEW 1: Vertical Menu Items */}
        {mobileView === "menu" && (
          <div className="flex flex-col gap-5">
            
            {/* User Profile Card Summary */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 flex items-center gap-4.5 shadow-sm">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 flex items-center justify-center">
                {ownProfileForm.userInfo?.profile?.avatarUrl && ownProfileForm.userInfo.profile.avatarUrl !== DEFAULT_AVATAR ? (
                  <img 
                    src={ownProfileForm.userInfo.profile.avatarUrl} 
                    alt="avatar" 
                    className="w-full h-full rounded-full object-cover bg-black"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-2xl font-black text-primary capitalize select-none">
                    {ownProfileForm.formData.fullName ? ownProfileForm.formData.fullName.trim().charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden text-left">
                <span className="text-[9px] font-black text-primary uppercase tracking-widest block leading-none mb-1">
                  TÀI KHOẢN CỦA BẠN
                </span>
                <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight truncate">
                  {ownProfileForm.formData.fullName}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-medium m-0 truncate mt-0.5">
                  {ownProfileForm.userInfo?.email}
                </p>
              </div>
            </div>

            {/* Menu Items List */}
            <div className="flex flex-col gap-3">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleMobileTabClick(item.id)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--border-color)]/25 transition-all shadow-sm"
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

        {/* VIEW 2: Sub-details panel */}
        {mobileView === "detail" && (
          <div className="flex flex-col gap-4">
            
            <button
              onClick={() => {
                setMobileView("menu");
                setShowEditForm(false);
              }}
              className="self-start flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm font-extrabold text-[var(--text-color)] hover:text-primary transition-all cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span>Quay lại</span>
            </button>

            <div className="mt-2">
              {activeTab === "personal_info" && (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm">
                  <PersonalInfoSection 
                    formData={ownProfileForm.formData}
                    isEditing={ownProfileForm.isEditing}
                    setIsEditing={ownProfileForm.setIsEditing}
                    handleChange={ownProfileForm.handleChange}
                    handleAvatarChange={ownProfileForm.handleAvatarChange}
                    handleSave={ownProfileForm.handleSave}
                    handleCancel={ownProfileForm.handleCancel}
                    formatDateDisplay={ownProfileForm.formatDateDisplay}
                    userInfo={ownProfileForm.userInfo}
                    isSaving={ownProfileForm.isSaving}
                    avatarPreviewUrl={ownProfileForm.avatarPreviewUrl}
                    errorMessage={ownProfileForm.errorMessage}
                  />
                </div>
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
