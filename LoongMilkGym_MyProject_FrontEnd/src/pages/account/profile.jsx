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
  X
} from "lucide-react";

function Profile() {
  const { userInfo, refetch } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

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
        fullName: userInfo.profile?.fullName || userInfo.fullname || "Nguyễn Văn A",
        phone: userInfo.profile?.phone || "+84 987 654 321",
        // Định dạng ngày sinh YYYY-MM-DD để hiển thị trong input type="date"
        birthDate: userInfo.profile?.birthDate 
          ? new Date(userInfo.profile.birthDate).toISOString().split('T')[0] 
          : "1995-08-15",
        gender: userInfo.profile?.gender || "Nam",
        address: userInfo.profile?.address || "Quận 1, TP. Hồ Chí Minh",
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
    // Giả lập lưu thành công (Sau này user sẽ kết nối API updateProfile)
    setIsEditing(false);
    // Sau khi lưu có thể gọi refetch() để cập nhật lại dữ liệu từ backend
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset lại form về thông tin cũ
    if (userInfo) {
      setFormData({
        fullName: userInfo.profile?.fullName || userInfo.fullname || "Nguyễn Văn A",
        phone: userInfo.profile?.phone || "+84 987 654 321",
        birthDate: userInfo.profile?.birthDate 
          ? new Date(userInfo.profile.birthDate).toISOString().split('T')[0] 
          : "1995-08-15",
        gender: userInfo.profile?.gender || "Nam",
        address: userInfo.profile?.address || "Quận 1, TP. Hồ Chí Minh",
        weight: userInfo.profile?.weightKg || "72",
        height: userInfo.profile?.heightCm || "178",
        calorieGoal: userInfo.profile?.calorieGoal || "2800"
      });
    }
  };

  // Hàm chuyển đổi định dạng ngày từ YYYY-MM-DD sang DD/MM/YYYY để hiển thị đẹp
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  return (
    <div className="w-full min-h-screen py-6 animate-slide-down">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR BÊN TRÁI - DANH MỤC TÀI KHOẢN */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm transition-all duration-300">
            <h3 className="text-xl font-extrabold text-[var(--text-color)] mb-6 px-2">
              Tài khoản
            </h3>
            <nav className="flex flex-col gap-2">
              <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4" />
                  <span>Tổng quan</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              
              <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-bold rounded-2xl bg-primary text-black transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(204,255,0,0.15)]">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Thông tin cá nhân</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              
              <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  <span>Bảo mật</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              
              <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  <span>Quyền riêng tư</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              
              <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Thông báo</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              
              <button className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Đơn hàng</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </nav>
          </div>
        </aside>

        {/* CONTAINER CHÍNH BÊN PHẢI */}
        <main className="flex-1 flex flex-col gap-6">
          
          {/* HEADER CHÍNH CÓ NÚT EDIT */}
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-[var(--text-color)] leading-none m-0">
              Thông tin cá nhân
            </h2>
            
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-full border border-[var(--border-color)] text-sm font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-black text-sm font-black transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(204,255,0,0.2)] hover:bg-primary-hover active:bg-primary-active hover:-translate-y-0.5"
                  >
                    <Check className="w-4 h-4 stroke-[3px]" />
                    Lưu thay đổi
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 rounded-full border-2 border-[var(--border-color)] text-sm font-bold text-[var(--text-color)] hover:border-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-all duration-200 cursor-pointer"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* CARD TỔNG QUAN AVATAR & BADGES */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm transition-all duration-300">
            
            {/* AVATAR KHU VỰC ĐỔI ẢNH */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-md">
                {userInfo?.profile?.avatarUrl ? (
                  <img 
                    src={userInfo.profile.avatarUrl} 
                    alt={formData.fullName} 
                    className="w-full h-full rounded-full object-cover bg-[var(--bg-color)]"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-3xl font-black text-primary">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Nút cây bút chỉnh sửa Avatar - Chỉ hiển thị khi đang trong chế độ Edit */}
              {isEditing && (
                <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-black border border-[var(--bg-secondary)] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200 animate-slide-down">
                  <Camera className="w-4 h-4 stroke-[2.5px]" />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              )}
            </div>

            {/* THÔNG TIN TÊN & BADGES */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h3 className="text-2xl font-black text-[var(--text-color)] m-0 leading-none">
                  {formData.fullName}
                </h3>
                {isEditing && (
                  <span className="self-center text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                    Đang chỉnh sửa
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)] font-medium m-0 mb-4">
                {userInfo?.email || "nguyenvana.fitness@gmail.com"}
              </p>
              
              {/* Badges trang trí theo mockup */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Award className="w-3.5 h-3.5" />
                  Thành viên Pro
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/20">
                  <Flame className="w-3.5 h-3.5" />
                  Mục tiêu: Tăng cơ
                </span>
              </div>
            </div>
          </div>

          {/* 3 THẺ THỐNG KÊ CHIỀU CAO - CÂN NẶNG - CALORIES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* THẺ CÂN NẶNG */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 flex items-center justify-between shadow-sm transition-all duration-300">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Cân nặng</span>
                <div className="flex items-baseline gap-1.5">
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-20 px-2 py-1 text-2xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none"
                    />
                  ) : (
                    <span className="text-3xl font-black text-[var(--text-color)] leading-none">{formData.weight}</span>
                  )}
                  <span className="text-sm font-bold text-[var(--text-muted)]">kg</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M6 3h12"/>
                  <path d="M12 3v4"/>
                </svg>
              </div>
            </div>

            {/* THẺ CHIỀU CAO */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 flex items-center justify-between shadow-sm transition-all duration-300">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Chiều cao</span>
                <div className="flex items-baseline gap-1.5">
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-20 px-2 py-1 text-2xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none"
                    />
                  ) : (
                    <span className="text-3xl font-black text-[var(--text-color)] leading-none">{formData.height}</span>
                  )}
                  <span className="text-sm font-bold text-[var(--text-muted)]">cm</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
              </div>
            </div>

            {/* THẺ MỤC TIÊU CALORIES */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 flex items-center justify-between shadow-sm transition-all duration-300">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Mục tiêu Calo</span>
                <div className="flex items-baseline gap-1.5">
                  {isEditing ? (
                    <input 
                      type="number" 
                      name="calorieGoal"
                      value={formData.calorieGoal}
                      onChange={handleChange}
                      className="w-24 px-2 py-1 text-2xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none"
                    />
                  ) : (
                    <span className="text-3xl font-black text-[var(--text-color)] leading-none">{formData.calorieGoal}</span>
                  )}
                  <span className="text-sm font-bold text-[var(--text-muted)]">kcal</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center animate-pulse">
                <Flame className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* CARD CHI TIẾT HỒ SƠ - INLINE EDIT */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-300">
            <h3 className="text-xl font-extrabold text-[var(--text-color)] mb-6 m-0">
              Chi tiết hồ sơ
            </h3>
            
            <div className="flex flex-col">
              
              {/* DÒNG HỌ VÀ TÊN */}
              <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[var(--border-color)] gap-2 sm:gap-6 min-h-[64px]">
                <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44">Họ và tên</span>
                <div className="flex-1">
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[var(--text-color)]">{formData.fullName}</span>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="self-start sm:self-center text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors bg-[var(--border-color)]/30 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {/* DÒNG SỐ ĐIỆN THOẠI */}
              <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[var(--border-color)] gap-2 sm:gap-6 min-h-[64px]">
                <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44">Số điện thoại</span>
                <div className="flex-1">
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[var(--text-color)]">{formData.phone}</span>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="self-start sm:self-center text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors bg-[var(--border-color)]/30 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {/* DÒNG NGÀY SINH */}
              <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[var(--border-color)] gap-2 sm:gap-6 min-h-[64px]">
                <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44">Ngày sinh</span>
                <div className="flex-1">
                  {isEditing ? (
                    <input 
                      type="date" 
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[var(--text-color)]">{formatDateDisplay(formData.birthDate)}</span>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="self-start sm:self-center text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors bg-[var(--border-color)]/30 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {/* DÒNG GIỚI TÍNH */}
              <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-[var(--border-color)] gap-2 sm:gap-6 min-h-[64px]">
                <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44">Giới tính</span>
                <div className="flex-1">
                  {isEditing ? (
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  ) : (
                    <span className="text-sm font-bold text-[var(--text-color)]">{formData.gender}</span>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="self-start sm:self-center text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors bg-[var(--border-color)]/30 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {/* DÒNG ĐỊA CHỈ */}
              <div className="flex flex-col sm:flex-row sm:items-center py-4 gap-2 sm:gap-6 min-h-[64px]">
                <span className="text-sm font-semibold text-[var(--text-muted)] sm:w-44">Địa chỉ</span>
                <div className="flex-1">
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[var(--text-color)]">{formData.address}</span>
                  )}
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="self-start sm:self-center text-xs font-bold text-[var(--text-muted)] hover:text-primary transition-colors bg-[var(--border-color)]/30 hover:bg-primary/10 px-3 py-1.5 rounded-full cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

            </div>
          </div>

        </main>
        
      </div>
    </div>
  );
}

export default Profile;
