import React from "react";
import { Camera, Award, Flame, Check } from "lucide-react";

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
            <label className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-black border border-[var(--bg-secondary)] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200 animate-bounce">
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
                  className="w-16 px-1.5 py-0.5 text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:ring-1 focus:ring-primary"
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
                  className="w-16 px-1.5 py-0.5 text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:ring-1 focus:ring-primary"
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
                  className="w-20 px-1.5 py-0.5 text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:ring-1 focus:ring-primary"
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
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input 
                      type={field.type} 
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full max-w-md px-4 py-2 text-sm font-semibold rounded-xl border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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

export default PersonalInfoSection;
