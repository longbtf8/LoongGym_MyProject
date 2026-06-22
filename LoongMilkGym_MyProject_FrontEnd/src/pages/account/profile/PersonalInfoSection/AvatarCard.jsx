import { useState } from "react";
import { Camera, Award, Flame, Check } from "lucide-react";
import { getFitnessLevelLabel } from "./constants";
import AvatarPhotoModal from "../components/AvatarPhotoModal";

function AvatarCard({
  formData,
  userInfo,
  isEditing,
  avatarPreviewUrl,
  onAvatarChange,
  suggestedImages = [],
}) {
  const [avatarModalMode, setAvatarModalMode] = useState(null);
  const currentAvatarUrl = avatarPreviewUrl || userInfo?.profile?.avatarUrl || "";

  const handleModalSave = async (file) => {
    onAvatarChange(file);
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm transition-all duration-300">
      
      {/* KHỐI ẢNH ĐẠI DIỆN */}
      <div className="relative group shrink-0">
        <button
          type="button"
          onClick={() => setAvatarModalMode(isEditing ? "picker" : "viewer")}
          className="block w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-md cursor-pointer"
          title="Ảnh đại diện"
        >
          {avatarPreviewUrl ? (
            <img 
              src={avatarPreviewUrl} 
              alt={formData.fullName} 
              className="w-full h-full rounded-full object-cover bg-[var(--bg-color)] border border-primary"
            />
          ) : userInfo?.profile?.avatarUrl ? (
            <img 
              src={userInfo.profile.avatarUrl} 
              alt={formData.fullName} 
              className="w-full h-full rounded-full object-cover bg-[var(--bg-color)]"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-2xl sm:text-3xl font-black text-primary">
              {(formData.fullName || userInfo?.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={() => setAvatarModalMode("picker")}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-black border border-[var(--bg-secondary)] flex items-center justify-center cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all duration-200 animate-bounce"
            title="Chỉnh sửa ảnh đại diện"
          >
            <Camera className="w-4 h-4 stroke-[2.5px]" />
          </button>
        )}
      </div>

      {/* THÔNG TIN CHI TIẾT TÊN, EMAIL & THẺ THÀNH VIÊN */}
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
        
        {/* HÀNG BADGES THÔNG TIN HẠNG / MỤC TIÊU / TRÌNH ĐỘ */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 mt-1">
          {/* HẠNG THÀNH VIÊN - PREMIUM STYLE GOLD OR BRAND NEON */}
          <span className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 ${
            (formData.membershipTier || "Standard").toLowerCase() === "standard"
              ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_2px_8px_rgba(204,255,0,0.06)]"
              : "bg-gradient-to-r from-amber-500 to-yellow-400 text-black border border-amber-300 shadow-[0_2px_10px_rgba(245,158,11,0.25)] font-extrabold animate-pulse"
          }`}>
            <Award className="w-3.5 h-3.5" />
            Hạng: {formData.membershipTier || "Standard"}
          </span>

          {/* MỤC TIÊU TẬP LUYỆN - GLOW CYAN BADGE */}
          {formData.goal && (
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/20 shadow-[0_2px_8px_rgba(0,245,212,0.06)]">
              <Flame className="w-3.5 h-3.5" />
              Mục tiêu: {formData.goal}
            </span>
          )}

          {/* TRÌNH ĐỘ THỂ CHẤT - ENERGY GLOW BADGES */}
          {formData.fitnessLevel && (
            <span className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 ${
              formData.fitnessLevel.includes("SEDENTARY")
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[0_2px_8px_rgba(14,165,233,0.06)]"
                : formData.fitnessLevel.includes("LIGHT")
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.06)]"
                : formData.fitnessLevel.includes("MODERATE")
                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_2px_8px_rgba(20,184,166,0.06)]"
                : formData.fitnessLevel.includes("ACTIVE")
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_2px_8px_rgba(99,102,241,0.06)]"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_2px_10px_rgba(244,63,94,0.12)] animate-pulse"
            }`}>
              <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
              {getFitnessLevelLabel(formData.fitnessLevel)}
            </span>
          )}
        </div>
        
        {/* TIỂU SỬ BIO */}
        {formData.bio && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] italic m-0 mt-4 max-w-xl text-center sm:text-left leading-relaxed bg-[var(--border-color)]/10 border-l-2 border-primary/50 pl-3 py-1.5 rounded-r-xl">
            "{formData.bio}"
          </p>
        )}
      </div>

      <AvatarPhotoModal
        key={avatarModalMode || "closed"}
        open={Boolean(avatarModalMode)}
        mode={avatarModalMode || "viewer"}
        currentAvatarUrl={currentAvatarUrl && !currentAvatarUrl.includes("photo-1534438327276-14e5300c3a48") ? currentAvatarUrl : ""}
        fullName={formData.fullName}
        suggestedImages={suggestedImages}
        onSave={handleModalSave}
        onClose={() => setAvatarModalMode(null)}
      />
    </div>
  );
}

export default AvatarCard;
