import { Check } from "lucide-react";
import AvatarCard from "./AvatarCard";
import StatsGrid from "./StatsGrid";
import ProfileDetailsList from "./ProfileDetailsList";
import { useGetPostsQuery } from "@/services/community/communityApi";

function PersonalInfoSection({
  formData,
  isEditing,
  setIsEditing,
  handleChange,
  handleAvatarChange,
  handleSave,
  handleCancel,
  formatDateDisplay,
  userInfo,
  isSaving,
  avatarPreviewUrl,
  errorMessage
}) {
  const { data: postsResponse } = useGetPostsQuery(
    { authorId: userInfo?.id, page: 1, limit: 5 },
    { skip: !userInfo?.id || !isEditing }
  );
  const suggestedAvatarImages = (postsResponse?.data || [])
    .flatMap((post) => post.media || [])
    .filter((media) => !media.mediaType || media.mediaType === "image")
    .map((media) => media.mediaUrl)
    .filter(Boolean)
    .slice(0, 1);

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
                disabled={isSaving}
                className="px-4 py-2 rounded-full border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1 px-4.5 py-2 rounded-full bg-primary text-black text-xs font-black transition-all duration-200 cursor-pointer shadow-md hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1 animate-pulse">
                    Đang lưu...
                  </span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    Lưu
                  </>
                )}
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

      {/* THÔNG BÁO LỖI NẾU CÓ */}
      {errorMessage && (
        <div className="bg-[#ff4d4f]/10 text-[#ff4d4f] px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold border border-[#ff4d4f]/20 text-left animate-slide-down">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* THÀNH PHẦN 1: CARD AVATAR, BADGES & BIO */}
      <AvatarCard 
        formData={formData} 
        userInfo={userInfo} 
        isEditing={isEditing} 
        avatarPreviewUrl={avatarPreviewUrl}
        onAvatarChange={handleAvatarChange}
        suggestedImages={suggestedAvatarImages}
      />

      {/* THÀNH PHẦN 2: LƯỚI CHỈ SỐ CƠ THỂ & ĐƠN VỊ ĐO */}
      <StatsGrid 
        formData={formData} 
        isEditing={isEditing} 
        handleChange={handleChange} 
      />

      {/* THÀNH PHẦN 3: CHI TIẾT HỒ SƠ CHI TIẾT */}
      <ProfileDetailsList 
        formData={formData} 
        isEditing={isEditing} 
        handleChange={handleChange} 
        formatDateDisplay={formatDateDisplay} 
      />

    </div>
  );
}

export default PersonalInfoSection;
