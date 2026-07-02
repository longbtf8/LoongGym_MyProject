import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Globe, Lock, Image, Smile, Dumbbell, ArrowLeft, Check, Pencil, Tag, Plus, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePostMutation, useUpdatePostMutation } from "@/services/community/communityApi";
import { useListSessionsQuery } from "@/services/workoutSession/workoutSessionApi";
import EmojiSelector from "./EmojiSelector";

export default function CreatePostModal({
  onClose,
  postToEdit = null,
  onRequestStarted,
  onRequestSuccess,
  onRequestError,
}) {
  const { userInfo } = useAuth();

  // Parse initial metadata if in edit mode
  const initialMetadata = React.useMemo(() => {
    if (!postToEdit?.metadata) return null;
    try {
      return typeof postToEdit.metadata === "string"
        ? JSON.parse(postToEdit.metadata)
        : postToEdit.metadata;
    } catch {
      return null;
    }
  }, [postToEdit]);

  const [content, setContent] = useState(postToEdit ? postToEdit.content || "" : "");
  const [visibility, setVisibility] = useState(postToEdit ? postToEdit.visibility || "public" : "public");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [feeling, setFeeling] = useState(initialMetadata?.feeling || null);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showEditImagesModal, setShowEditImagesModal] = useState(false);
  
  // Attachments
  const [selectedWorkout, setSelectedWorkout] = useState(postToEdit ? postToEdit.relatedWorkoutSession || null : null);
  const [existingMedia, setExistingMedia] = useState(postToEdit ? postToEdit.media || [] : []);
  const [existingMediaCaptions, setExistingMediaCaptions] = useState(() =>
    Object.fromEntries((postToEdit?.media || []).map((item) => [item.id, item.caption || ""]))
  );
  const [removeMediaIds, setRemoveMediaIds] = useState([]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [newMediaCaptions, setNewMediaCaptions] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [createPost, { isLoading: isPosting }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useListSessionsQuery({ status: "completed" });
  const completedWorkouts = workoutsData?.data || [];

  const isSubmitting = isPosting || isUpdating;

  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  React.useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Combine existing media and new local previews into a single grid
  const combinedMedia = React.useMemo(() => {
    return [
      ...existingMedia.map((m) => ({
        isExisting: true,
        id: m.id,
        url: m.mediaUrl,
        caption: existingMediaCaptions[m.id] || "",
      })),
      ...mediaPreviews.map((url, index) => ({
        isExisting: false,
        index,
        url,
        caption: newMediaCaptions[index] || "",
      })),
    ];
  }, [existingMedia, existingMediaCaptions, mediaPreviews, newMediaCaptions]);

  const formatWorkoutDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Lock background scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Textarea auto-resize
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validImageFiles = [];
    const newPreviews = [];
    
    for (const file of files) {
      // Validate file type (only images allowed)
      if (!file.type.startsWith("image/")) {
        showToast(`Tệp "${file.name}" không phải là ảnh hợp lệ!`, "error");
        continue;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast(`Tệp "${file.name}" vượt quá dung lượng tối đa 10MB!`, "error");
        continue;
      }
      validImageFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validImageFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...validImageFiles]);
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
      setNewMediaCaptions((prev) => [...prev, ...validImageFiles.map(() => "")]);
    }
  };

  const handleRemoveMedia = (item) => {
    if (item.isExisting) {
      setRemoveMediaIds((prev) => [...prev, item.id]);
      setExistingMediaCaptions((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setExistingMedia((prev) => {
        const next = prev.filter((m) => m.id !== item.id);
        if (next.length === 0 && mediaPreviews.length === 0) {
          setShowEditImagesModal(false);
        }
        return next;
      });
    } else {
      const idx = mediaPreviews.indexOf(item.url);
      if (idx !== -1) {
        setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
        URL.revokeObjectURL(item.url);
        setNewMediaCaptions((prev) => prev.filter((_, i) => i !== idx));
        setMediaPreviews((prev) => {
          const next = prev.filter((_, i) => i !== idx);
          if (next.length === 0 && existingMedia.length === 0) {
            setShowEditImagesModal(false);
          }
          return next;
        });
      }
    }
  };

  const handleCaptionChange = (item, value) => {
    if (item.isExisting) {
      setExistingMediaCaptions((prev) => ({ ...prev, [item.id]: value }));
      return;
    }
    setNewMediaCaptions((prev) => prev.map((caption, idx) => (idx === item.index ? value : caption)));
  };

  const handlePostSubmit = async () => {
    if (!content.trim() && combinedMedia.length === 0 && !selectedWorkout) return;

    const actionLabel = postToEdit ? "Cập nhật bài viết" : mediaFiles.length > 0 ? "Đăng ảnh" : "Đăng bài viết";
    onRequestStarted?.(`${actionLabel} đang được xử lý...`);
    onClose();

    try {
      if (postToEdit) {
        // Edit mode
        const formData = new FormData();
        formData.append("content", content);
        formData.append("visibility", visibility);
        formData.append("postType", selectedWorkout ? "workout_share" : combinedMedia.length > 0 ? "image" : "text");
        
        if (selectedWorkout) {
          formData.append("relatedWorkoutSessionId", selectedWorkout.id);
        } else {
          formData.append("relatedWorkoutSessionId", ""); // clear
        }
        
        if (feeling) {
          formData.append("metadata", JSON.stringify({
            feeling,
            mediaCaptions: existingMedia.map((item) => ({
              id: item.id,
              caption: existingMediaCaptions[item.id] || "",
            })),
            newMediaCaptions,
          }));
        } else {
          formData.append("metadata", JSON.stringify({
            mediaCaptions: existingMedia.map((item) => ({
              id: item.id,
              caption: existingMediaCaptions[item.id] || "",
            })),
            newMediaCaptions,
          }));
        }

        formData.append("removeMediaIds", JSON.stringify(removeMediaIds));

        mediaFiles.forEach((file) => {
          formData.append("images", file);
        });

        await updatePost({ postId: postToEdit.id, formData }).unwrap();
      } else {
        // Create mode
        const formData = new FormData();
        formData.append("content", content);
        formData.append("visibility", visibility);
        formData.append("postType", selectedWorkout ? "workout_share" : mediaFiles.length > 0 ? "image" : "text");
        
        if (selectedWorkout) {
          formData.append("relatedWorkoutSessionId", selectedWorkout.id);
        }
        
        if (feeling) {
          formData.append("metadata", JSON.stringify({ feeling, mediaCaptions: newMediaCaptions }));
        } else if (newMediaCaptions.some((caption) => caption.trim())) {
          formData.append("metadata", JSON.stringify({ mediaCaptions: newMediaCaptions }));
        }

        mediaFiles.forEach((file) => {
          formData.append("images", file);
        });

        await createPost(formData).unwrap();
      }
      onRequestSuccess?.(postToEdit ? "Cập nhật bài viết thành công." : "Đăng bài viết thành công.");
    } catch (err) {
      console.error("Lỗi gửi bài viết:", err);
      const uploadMessage = err?.status === 413
        ? "Ảnh tải lên quá lớn. Vui lòng nén ảnh hoặc chọn ít ảnh hơn rồi thử lại."
        : err?.data?.message;
      onRequestError?.(uploadMessage || `${actionLabel} thất bại, hãy liên hệ admin để được giúp đỡ.`);
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return "0 phút";
    const min = Math.round(sec / 60);
    return `${min} phút`;
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] overflow-y-auto flex items-start justify-center p-4 md:py-10 animate-fade-in"
    >
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-[3px] transition-opacity"
      />
      
      {/* Modal Content Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-[500px] rounded-3xl shadow-2xl relative flex flex-col my-auto z-10"
      >
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <div className="w-6" /> {/* Spacer */}
          <h2 className="text-lg font-black text-[var(--text-color)] text-center">
            {showWorkoutSelector
              ? "Chọn phiên tập liên kết"
              : postToEdit
              ? "Chỉnh sửa bài viết"
              : "Tạo bài viết"}
          </h2>
          <button
            onClick={showWorkoutSelector ? () => setShowWorkoutSelector(false) : onClose}
            className="p-1.5 bg-[var(--border-color)]/30 hover:bg-[var(--border-color)]/60 rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-[var(--text-color)]" />
          </button>
        </div>

        {/* Visibility Dropdown Menu */}
        {showVisibilityDropdown && (
          <div className="absolute top-[68px] left-[150px] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-xl z-30 p-2 flex flex-col gap-1 w-[180px]">
            <button
              onClick={() => { setVisibility("public"); setShowVisibilityDropdown(false); }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all hover:bg-[var(--border-color)]/30 ${visibility === "public" ? "text-primary bg-primary/10" : "text-[var(--text-color)]"}`}
            >
              <Globe className="w-4 h-4" />
              <span>Công khai (Public)</span>
            </button>
            <button
              onClick={() => { setVisibility("private"); setShowVisibilityDropdown(false); }}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl transition-all hover:bg-[var(--border-color)]/30 ${visibility === "private" ? "text-primary bg-primary/10" : "text-[var(--text-color)]"}`}
            >
              <Lock className="w-4 h-4" />
              <span>Chỉ mình tôi (Private)</span>
            </button>
          </div>
        )}

        {/* Regular Create/Edit Post Flow */}
        {!showWorkoutSelector && (
          <div className="p-6 flex flex-col gap-4 relative">
            
            {/* User Details */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 flex items-center justify-center">
                {userInfo?.profile?.avatarUrl && !userInfo.profile.avatarUrl.includes("photo-1534438327276-14e5300c3a48") ? (
                  <img
                    src={userInfo.profile.avatarUrl}
                    alt={userInfo?.profile?.fullName || "User"}
                    className="w-full h-full rounded-full object-cover bg-black"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-base font-black text-primary capitalize select-none">
                    {userInfo?.profile?.fullName ? userInfo.profile.fullName.trim().charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="text-sm font-black text-[var(--text-color)]">
                    {capitalizeName(userInfo?.profile?.fullName || userInfo?.fullname || "Thành viên LoongMilkGym")}
                  </h4>
                  {feeling && !postToEdit && (
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      đang cảm thấy {feeling.emoji} <span className="font-bold text-[var(--text-color)] capitalize">{feeling.text}</span>
                    </span>
                  )}
                </div>
                
                {selectedWorkout && (
                  <div className="text-[11px] text-primary font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="truncate max-w-[200px]">({selectedWorkout.title} - {formatWorkoutDate(selectedWorkout.endedAt || selectedWorkout.createdAt)})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkout(null)}
                      className="text-rose-500 hover:text-rose-600 font-bold ml-1 cursor-pointer bg-transparent border-0 p-0 text-[10px]"
                    >
                      [Gỡ]
                    </button>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {/* Visibility Trigger */}
                  <button
                    onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--border-color)]/30 hover:bg-[var(--border-color)]/50 border border-[var(--border-color)]/20 rounded-full text-[10px] font-black text-[var(--text-color)] uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    {visibility === "public" ? <Globe className="w-3 h-3 text-primary" /> : <Lock className="w-3 h-3 text-amber-500" />}
                    <span>{visibility === "public" ? "Công khai" : "Chỉ mình tôi"}</span>
                  </button>

                  {/* Feeling Chip for Edit Mode - styled beautifully */}
                  {feeling && postToEdit && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-500 animate-fade-in shadow-sm select-none">
                      <span className="text-xs leading-none">{feeling.emoji}</span>
                      <span className="capitalize">{feeling.text}</span>
                      <button
                        type="button"
                        onClick={() => setFeeling(null)}
                        className="hover:bg-amber-500/20 rounded-full p-0.5 ml-0.5 cursor-pointer text-amber-500/70 hover:text-amber-500 border-0 bg-transparent transition-all flex items-center justify-center"
                        title="Xóa cảm xúc"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Textarea Input */}
            <textarea
              ref={textareaRef}
              placeholder={`${userInfo?.profile?.fullName || "Bạn"} ơi, bạn đang nghĩ gì thế?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-[var(--text-color)] bg-transparent border-0 outline-none resize-none placeholder-[var(--text-muted)] font-semibold text-base leading-relaxed mt-2"
              rows={1}
            />

            {/* Media Upload Previews */}
            {combinedMedia.length > 0 && (
              <div className="mt-2 relative">
                {combinedMedia.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowEditImagesModal(true)}
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-black rounded-xl text-xs font-black shadow-md z-20 cursor-pointer border-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Chỉnh sửa ảnh
                  </button>
                )}
                {combinedMedia.length === 1 && (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black/15 flex items-center justify-center max-h-[500px]">
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                      style={{ backgroundImage: `url(${combinedMedia[0].url})` }}
                    />
                    <img src={combinedMedia[0].url} alt="preview" className="relative z-10 w-full h-auto max-h-[500px] object-contain block mx-auto" />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(combinedMedia[0])}
                      className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {combinedMedia.length === 2 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
                    {combinedMedia.map((item, index) => (
                      <div key={index} className="relative w-full h-full min-h-0 overflow-hidden flex items-center justify-center bg-black/15">
                        <div 
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                          style={{ backgroundImage: `url(${item.url})` }}
                        />
                        <img src={item.url} alt="preview" className="relative z-10 max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(item)}
                          className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {combinedMedia.length === 3 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
                    <div className="relative w-full h-full min-h-0 overflow-hidden">
                      <img src={combinedMedia[0].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(combinedMedia[0])}
                        className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[1, 2].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={combinedMedia[idx].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(combinedMedia[idx])}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {combinedMedia.length === 4 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
                    {/* Left Column: 2 rows */}
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={combinedMedia[idx].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(combinedMedia[idx])}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Right Column: 2 rows */}
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[2, 3].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={combinedMedia[idx].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(combinedMedia[idx])}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {combinedMedia.length >= 5 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[1/1] w-full">
                    {/* Left Column: 2 rows */}
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={combinedMedia[idx].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(combinedMedia[idx])}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Right Column: 3 rows */}
                    <div className="grid grid-rows-3 gap-1 h-full min-h-0">
                      {[2, 3].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={combinedMedia[idx].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(combinedMedia[idx])}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="relative w-full h-full min-h-0 overflow-hidden">
                        <img src={combinedMedia[4].url} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(combinedMedia[4])}
                          className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md border-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {combinedMedia.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-black pointer-events-none select-none z-10">
                            +{combinedMedia.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Toolbar: Thêm vào bài viết của bạn */}
            <div className="mt-auto border border-[var(--border-color)] rounded-3xl p-3.5 flex items-center justify-between bg-[var(--bg-secondary)] shadow-sm">
              <span className="text-xs font-bold text-[var(--text-color)] pl-1">
                Thêm vào bài viết của bạn
              </span>
              <div className="flex items-center gap-1">
                {/* Photo Upload Trigger */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-[var(--border-color)]/40 rounded-full text-emerald-500 transition-all cursor-pointer"
                  title="Thêm ảnh"
                >
                  <Image className="w-5.5 h-5.5" />
                </button>

                {/* Feeling Trigger */}
                <button
                  type="button"
                  onClick={() => setShowEmojiSelector(true)}
                  className="p-2 hover:bg-[var(--border-color)]/40 rounded-full text-amber-500 transition-all cursor-pointer"
                  title="Cảm xúc/Hoạt động"
                >
                  <Smile className="w-5.5 h-5.5" />
                </button>

                {/* Workout Attachment Trigger */}
                <button
                  type="button"
                  onClick={() => setShowWorkoutSelector(true)}
                  className="p-2 hover:bg-[var(--border-color)]/40 rounded-full text-primary transition-all cursor-pointer"
                  title="Gắn kèm Workout"
                >
                  <Dumbbell className="w-5.5 h-5.5" />
                </button>
              </div>
            </div>

            {/* Feelings overlay */}
            {showEmojiSelector && (
              <EmojiSelector
                onClose={() => setShowEmojiSelector(false)}
                onSelect={(selected) => {
                  setFeeling(selected);
                  setShowEmojiSelector(false);
                }}
              />
            )}

          </div>
        )}

        {/* Workout Selector Overlay */}
        {showWorkoutSelector && (
          <div className="p-6 flex flex-col gap-4">
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-2">
              Chọn một buổi tập hoàn thành gần đây của bạn để chia sẻ:
            </p>
            {isLoadingWorkouts ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : completedWorkouts.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-3xl text-[var(--text-muted)] text-sm font-semibold">
                Bạn chưa có buổi tập nào hoàn thành. Hãy bắt đầu buổi tập hôm nay nhé!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto">
                {completedWorkouts.map((workout) => {
                  const isSelected = selectedWorkout?.id === workout.id;
                  return (
                    <button
                      key={workout.id}
                      onClick={() => {
                        setSelectedWorkout(workout);
                        setShowWorkoutSelector(false);
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-[var(--border-color)] bg-[var(--border-color)]/10 hover:bg-[var(--border-color)]/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-[var(--text-color)]">
                            {workout.title}
                          </h4>
                          <span className="text-[11px] text-primary font-bold">
                            ({formatWorkoutDate(workout.endedAt || workout.createdAt)})
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-[11px] text-[var(--text-muted)] font-bold">
                          <span>Thời gian: {formatDuration(workout.durationSeconds)}</span>
                          {workout.perceivedEffort && (
                            <span>RPE: {workout.perceivedEffort}/10</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        {!showWorkoutSelector && (
          <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end">
            <button
              onClick={handlePostSubmit}
              disabled={isSubmitting || (!content.trim() && combinedMedia.length === 0 && !selectedWorkout)}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-black disabled:opacity-50 font-black rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              {isSubmitting
                ? postToEdit
                  ? "Đang lưu..."
                  : "Đang đăng..."
                : postToEdit
                ? "Lưu"
                : "Đăng bài viết"}
            </button>
          </div>
        )}

      </div>

      {/* Sub-modal: Edit Images Modal */}
      {showEditImagesModal && (
        <div className="fixed inset-0 z-[9999999] overflow-y-auto flex items-start justify-center p-4 md:py-10 animate-fade-in">
          {/* Overlay */}
          <div 
            onClick={() => setShowEditImagesModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-[4px] transition-opacity"
          />

          {/* Modal Card */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-[700px] rounded-3xl shadow-2xl relative flex flex-col my-auto z-10 max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
              <button
                type="button"
                onClick={() => setShowEditImagesModal(false)}
                className="p-1.5 hover:bg-[var(--border-color)]/30 rounded-full transition-all text-[var(--text-color)] cursor-pointer border-0 bg-transparent"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-black text-[var(--text-color)] text-center">
                Ảnh
              </h2>
              <button
                type="button"
                onClick={() => setShowEditImagesModal(false)}
                className="p-1.5 hover:bg-[var(--border-color)]/30 rounded-full transition-all text-[var(--text-color)] cursor-pointer border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: list of images */}
            <div className="flex-1 overflow-y-auto max-h-[500px] p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--bg-secondary)]">
              {combinedMedia.map((item, idx) => (
                <div key={idx} className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-black/5 flex flex-col relative group">
                  
                  {/* Backdrop blur layout */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                    {/* Blur bg */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-105"
                      style={{ backgroundImage: `url(${item.url})` }}
                    />
                    
                    {/* Image */}
                    <img src={item.url} alt="edit preview" className="relative z-10 max-h-full max-w-full object-contain aspect-video" />
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(item)}
                      className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-full z-20 cursor-pointer transition-all shadow-md border-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Caption Input */}
                  <div className="p-3 border-t border-[var(--border-color)] flex items-center gap-2 bg-[var(--bg-secondary)]">
                    <Tag className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <input
                      type="text"
                      placeholder="Chú thích"
                      value={item.caption}
                      onChange={(event) => handleCaptionChange(item, event.target.value)}
                      className="w-full text-xs font-semibold text-[var(--text-color)] bg-transparent border-0 outline-none placeholder-[var(--text-muted)] p-0"
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)] shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-primary font-bold text-xs hover:underline cursor-pointer border-0 bg-transparent"
              >
                <Plus className="w-4 h-4" />
                Thêm ảnh
              </button>
              <button
                type="button"
                onClick={() => setShowEditImagesModal(false)}
                className="px-5 py-2 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-xs transition-all shadow-md cursor-pointer border-0"
              >
                Xong
              </button>
            </div>

          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-sm animate-slide-down bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-500/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}
    </div>,
    document.body
  );
}
