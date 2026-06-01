import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  Camera, 
  Flame,
  Award,
  ChevronRight,
  Lock,
  Shield,
  Bell,
  ShoppingBag,
  Info,
  Check,
  X,
  ArrowLeft,
  LogOut,
  Laptop,
  Smartphone,
  Globe
} from "lucide-react";

function Profile() {
  const { userInfo, handleLogout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Quản lý tab hiện tại cho cả Desktop và Mobile
  // "personal_info" | "security" | "privacy" | "notifications" | "orders"
  const [activeTab, setActiveTab] = useState("personal_info");
  
  // Trạng thái view trên Mobile: "menu" | "detail"
  const [mobileView, setMobileView] = useState("menu");

  // Khởi tạo state cho các trường thông tin dựa trên dữ liệu thật từ Backend (hoặc fallback mặc định)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    weight: "",
    height: "",
    calorieGoal: ""
  });

  // Đồng bộ dữ liệu từ useAuth khi tải trang
  useEffect(() => {
    if (userInfo) {
      setFormData({
        fullName: userInfo.profile?.fullName || userInfo.fullname || "Bùi Thành Long",
        phone: userInfo.profile?.phone || "+84 987 654 321",
        birthDate: userInfo.profile?.birthDate 
          ? new Date(userInfo.profile.birthDate).toISOString().split('T')[0] 
          : "2005-12-31",
        gender: userInfo.profile?.gender || "Nam",
        address: userInfo.profile?.address || "Hà Nội, Việt Nam",
        weight: userInfo.profile?.weightKg || "72",
        height: userInfo.profile?.heightCm || "178",
        calorieGoal: userInfo.profile?.calorieGoal || "2800"
      });
    }
  }, [userInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userInfo) {
      setFormData({
        fullName: userInfo.profile?.fullName || userInfo.fullname || "Bùi Thành Long",
        phone: userInfo.profile?.phone || "+84 987 654 321",
        birthDate: userInfo.profile?.birthDate 
          ? new Date(userInfo.profile.birthDate).toISOString().split('T')[0] 
          : "2005-12-31",
        gender: userInfo.profile?.gender || "Nam",
        address: userInfo.profile?.address || "Hà Nội, Việt Nam",
        weight: userInfo.profile?.weightKg || "72",
        height: userInfo.profile?.heightCm || "178",
        calorieGoal: userInfo.profile?.calorieGoal || "2800"
      });
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Xử lý chuyển tab trên Mobile (Option A: click chuyển sang view chi tiết và hiển thị nút back)
  const handleMobileTabClick = (tabId) => {
    if (tabId === "logout") {
      handleLogout();
      return;
    }
    setActiveTab(tabId);
    setMobileView("detail");
  };

  // Mock danh sách thiết bị cho tab Bảo mật
  const [activeDevices, setActiveDevices] = useState([
    {
      id: 1,
      os: "macOS Sequoia",
      browser: "Chrome",
      ip: "113.23.45.67",
      location: "Hà Nội, Việt Nam",
      lastActive: "Đang hoạt động",
      isCurrent: true,
      icon: Laptop
    },
    {
      id: 2,
      os: "iPhone 15 Pro",
      browser: "Safari",
      ip: "27.72.3.15",
      location: "TP. Hồ Chí Minh, Việt Nam",
      lastActive: "10 phút trước",
      isCurrent: false,
      icon: Smartphone
    },
    {
      id: 3,
      os: "Windows 11",
      browser: "Firefox",
      ip: "42.116.12.98",
      location: "Đà Nẵng, Việt Nam",
      lastActive: "2 ngày trước",
      isCurrent: false,
      icon: Laptop
    }
  ]);

  const handleRevokeDevice = (id) => {
    setActiveDevices(prev => prev.filter(device => device.id !== id));
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
      
      {/* ═══ GIAO DIỆN DESKTOP (lg:flex, ẩn trên mobile) ═══ */}
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
            />
          )}

          {activeTab === "security" && (
            <SecuritySection 
              activeDevices={activeDevices}
              handleRevokeDevice={handleRevokeDevice}
            />
          )}

          {activeTab !== "personal_info" && activeTab !== "security" && (
            <PlaceholderSection title={MENU_ITEMS.find(i => i.id === activeTab)?.title || ""} />
          )}
        </main>
      </div>

      {/* ═══ GIAO DIỆN MOBILE (Ẩn trên desktop) ═══ */}
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

              <div className="flex-1 overflow-hidden">
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
                      {/* Icon container với màu sắc sinh động tương ứng */}
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
                />
              )}

              {activeTab === "security" && (
                <SecuritySection 
                  activeDevices={activeDevices}
                  handleRevokeDevice={handleRevokeDevice}
                />
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

// ═══ COMPONENT CON 1: THÔNG TIN CÁ NHÂN ═══
function PersonalInfoSection({
  formData,
  isEditing,
  setIsEditing,
  handleChange,
  handleSave,
  handleCancel,
  formatDateDisplay,
  userInfo
}) {
  return (
    <div className="flex flex-col gap-6 animate-slide-down">
      
      {/* HEADER CHÍNH CÓ NÚT EDIT */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] leading-none m-0">
          Thông tin cá nhân
        </h2>
        
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-4.5 py-2 rounded-full bg-primary text-black text-xs font-black transition-all duration-200 cursor-pointer shadow-md hover:bg-primary-hover active:bg-primary-active"
              >
                <Check className="w-3.5 h-3.5 stroke-[3px]" />
                Lưu
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-full border-2 border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:border-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-all duration-200 cursor-pointer"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* CARD TỔNG QUAN AVATAR & BADGES */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm transition-all duration-300">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-md">
            {userInfo?.profile?.avatarUrl ? (
              <img 
                src={userInfo.profile.avatarUrl} 
                alt={formData.fullName} 
                className="w-full h-full rounded-full object-cover bg-[var(--bg-color)]"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-2xl sm:text-3xl font-black text-primary">
                {formData.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {isEditing && (
            <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-black border border-[var(--bg-secondary)] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200">
              <Camera className="w-4 h-4 stroke-[2.5px]" />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          )}
        </div>

        <div className="text-center sm:text-left flex-1 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 justify-center sm:justify-start">
            <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)] m-0 leading-none truncate">
              {formData.fullName}
            </h3>
            {isEditing && (
              <span className="self-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                Đang sửa
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium m-0 mb-4 truncate">
            {userInfo?.email || "builong3122005@gmail.com"}
          </p>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Award className="w-3 h-3" />
              Thành viên Pro
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/20">
              <Flame className="w-3 h-3" />
              Mục tiêu: Tăng cơ
            </span>
          </div>
        </div>
      </div>

      {/* 3 THỂ THỐNG KÊ CHIỀU CAO - CÂN NẶNG - CALORIES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* CÂN NẶNG */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm transition-all duration-300">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cân nặng</span>
            <div className="flex items-baseline gap-1">
              {isEditing ? (
                <input 
                  type="number" 
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-16 px-1.5 py-0.5 text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{formData.weight}</span>
              )}
              <span className="text-xs font-bold text-[var(--text-muted)]">kg</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M6 3h12"/>
              <path d="M12 3v4"/>
            </svg>
          </div>
        </div>

        {/* CHIỀU CAO */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm transition-all duration-300">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Chiều cao</span>
            <div className="flex items-baseline gap-1">
              {isEditing ? (
                <input 
                  type="number" 
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-16 px-1.5 py-0.5 text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{formData.height}</span>
              )}
              <span className="text-xs font-bold text-[var(--text-muted)]">cm</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
            <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          </div>
        </div>

        {/* CALO */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm transition-all duration-300">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mục tiêu Calo</span>
            <div className="flex items-baseline gap-1">
              {isEditing ? (
                <input 
                  type="number" 
                  name="calorieGoal"
                  value={formData.calorieGoal}
                  onChange={handleChange}
                  className="w-20 px-1.5 py-0.5 text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{formData.calorieGoal}</span>
              )}
              <span className="text-xs font-bold text-[var(--text-muted)]">kcal</span>
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 animate-pulse">
            <Flame className="w-5.5 h-5.5" />
          </div>
        </div>

      </div>

      {/* CARD CHI TIẾT HỒ SƠ */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
        <h3 className="text-lg font-extrabold text-[var(--text-color)] mb-5 m-0 text-left">
          Chi tiết hồ sơ
        </h3>
        
        <div className="flex flex-col">
          {[
            { label: "Họ và tên", name: "fullName", type: "text" },
            { label: "Số điện thoại", name: "phone", type: "text" },
            { 
              label: "Ngày sinh", 
              name: "birthDate", 
              type: "date",
              renderVal: (v) => formatDateDisplay(v)
            },
            { 
              label: "Giới tính", 
              name: "gender", 
              type: "select",
              options: ["Nam", "Nữ", "Khác"]
            },
            { label: "Địa chỉ", name: "address", type: "text" }
          ].map((field, idx) => (
            <div 
              key={field.name}
              className={`flex flex-col sm:flex-row sm:items-center py-4 gap-2 sm:gap-6 min-h-[64px] text-left ${
                idx !== 4 ? "border-b border-[var(--border-color)]" : ""
              }`}
            >
              <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44 shrink-0">{field.label}</span>
              <div className="flex-1">
                {isEditing ? (
                  field.type === "select" ? (
                    <select 
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    >
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      type={field.type} 
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    />
                  )
                ) : (
                  <span className="text-sm font-bold text-[var(--text-color)]">
                    {field.renderVal ? field.renderVal(formData[field.name]) : formData[field.name]}
                  </span>
                )}
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="self-start sm:self-center text-[10px] font-bold text-[var(--text-muted)] hover:text-primary transition-colors bg-[var(--border-color)]/30 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ═══ COMPONENT CON 2: BẢO MẬT (DEVICE TRACKING) ═══
function SecuritySection({ activeDevices, handleRevokeDevice }) {
  return (
    <div className="flex flex-col gap-6 animate-slide-down">
      <div className="text-left">
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-color)] leading-none m-0">
          Cài đặt bảo mật
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-2 mb-0">
          Quản lý mật khẩu tài khoản và giám sát các phiên đăng nhập hoạt động.
        </p>
      </div>

      {/* ĐỔI MẬT KHẨU CARD */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 text-left">
        <h3 className="text-lg font-extrabold text-[var(--text-color)] mb-1 m-0">
          Đổi mật khẩu
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-medium mb-6">
          Bạn nên sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
        </p>

        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Mật khẩu hiện tại</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Mật khẩu mới</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary transition-all"
            />
          </div>
          <button className="self-start mt-2 px-6 py-2.5 rounded-full bg-primary text-black text-xs font-black transition-all duration-200 cursor-pointer shadow-md hover:bg-primary-hover active:bg-primary-active hover:-translate-y-0.5">
            Cập nhật mật khẩu
          </button>
        </div>
      </div>

      {/* THIẾT BỊ ĐÃ ĐĂNG NHẬP CARD */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300 text-left">
        <h3 className="text-lg font-extrabold text-[var(--text-color)] mb-1 m-0">
          Thiết bị đang hoạt động
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-medium mb-6">
          Dưới đây là danh sách các thiết bị đã đăng nhập và đang sử dụng tài khoản của bạn. Bạn có thể đăng xuất từ xa nếu nghi ngờ.
        </p>

        <div className="flex flex-col gap-4">
          {activeDevices.map((device) => {
            const DeviceIcon = device.icon;
            return (
              <div 
                key={device.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] gap-4 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* Icon tròn */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    device.isCurrent 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]"
                  }`}>
                    <DeviceIcon className="w-5.5 h-5.5" />
                  </div>
                  
                  {/* Thông tin chi tiết */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-[var(--text-color)]">{device.os} ({device.browser})</span>
                      {device.isCurrent && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/25 text-primary border border-primary/30 animate-pulse">
                          Thiết bị này
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-[var(--text-muted)] font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        {device.ip}
                      </span>
                      <span>•</span>
                      <span>{device.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${device.isCurrent ? "text-primary" : "text-[var(--text-muted)]"}`}>
                    {device.lastActive}
                  </span>
                  
                  {!device.isCurrent && (
                    <button 
                      onClick={() => handleRevokeDevice(device.id)}
                      className="px-3.5 py-1.5 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-all duration-200 cursor-pointer"
                    >
                      Đăng xuất từ xa
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ═══ COMPONENT CON 3: THẺ THAY THẾ CHO CÁC TAB KHÁC ═══
function PlaceholderSection({ title }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-12 text-center shadow-sm animate-slide-down">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
        <Flame className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-extrabold text-[var(--text-color)] mb-2 m-0">
        Tính năng {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto m-0 leading-relaxed font-medium">
        Hệ thống đang đồng bộ dữ liệu tập luyện của bạn. Tính năng {title} cao cấp sẽ sẵn sàng trong vài giây tới.
      </p>
    </div>
  );
}

export default Profile;
