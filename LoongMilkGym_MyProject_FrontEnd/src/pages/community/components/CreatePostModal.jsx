import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Globe, Lock, Image, Smile, Dumbbell, ArrowLeft, Check, Pencil, Tag, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePostMutation } from "@/services/community/communityApi";
import { useListSessionsQuery } from "@/services/workoutSession/workoutSessionApi";
import EmojiSelector from "./EmojiSelector";

export default function CreatePostModal({ onClose }) {
  const { userInfo } = useAuth();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);
  const [feeling, setFeeling] = useState(null);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [showEditImagesModal, setShowEditImagesModal] = useState(false);
  
  // Attachments
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [createPost, { isLoading: isPosting }] = useCreatePostMutation();
  const { data: workoutsData, isLoading: isLoadingWorkouts } = useListSessionsQuery({ status: "completed" });
  const completedWorkouts = workoutsData?.data || [];

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
        alert(`Tệp "${file.name}" không phải là ảnh hợp lệ!`);
        continue;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Tệp "${file.name}" vượt quá dung lượng tối đa 10MB!`);
        continue;
      }
      validImageFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validImageFiles.length > 0) {
      setMediaFiles((prev) => [...prev, ...validImageFiles]);
      setMediaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaPreviews((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setShowEditImagesModal(false);
      }
      return next;
    });
  };

  const handlePostSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0 && !selectedWorkout) return;

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);
      formData.append("postType", selectedWorkout ? "workout_share" : mediaFiles.length > 0 ? "image" : "text");
      
      if (selectedWorkout) {
        formData.append("relatedWorkoutSessionId", selectedWorkout.id);
      }
      
      if (feeling) {
        formData.append("metadata", JSON.stringify({ feeling }));
      }

      mediaFiles.forEach((file) => {
        formData.append("images", file); // Backend expects images in multer upload array
      });

      await createPost(formData).unwrap();
      onClose();
    } catch (err) {
      console.error("Lỗi đăng bài viết:", err);
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
            {showWorkoutSelector ? "Chọn phiên tập liên kết" : "Tạo bài viết"}
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

        {/* Regular Create Post Flow */}
        {!showWorkoutSelector && (
          <div className="p-6 flex flex-col gap-4 relative">
            
            {/* User Details */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm">
                <img
                  src={userInfo?.profile?.avatarUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=60"}
                  alt={userInfo?.profile?.fullName || "User"}
                  className="w-full h-full rounded-full object-cover bg-black"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h4 className="text-sm font-black text-[var(--text-color)]">
                    {capitalizeName(userInfo?.profile?.fullName || userInfo?.fullname || "Thành viên LoongMilkGym")}
                  </h4>
                  {feeling && (
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      đang cảm thấy {feeling.emoji} <span className="font-bold text-[var(--text-color)] capitalize">{feeling.text}</span>
                    </span>
                  )}
                </div>
                
                {selectedWorkout && (
                  <div className="text-[11px] text-primary font-bold mt-0.5 flex items-center gap-1.5">
                    <span>(Buổi tập {selectedWorkout.title} ngày {formatWorkoutDate(selectedWorkout.endedAt || selectedWorkout.createdAt)})</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWorkout(null)}
                      className="text-rose-500 hover:text-rose-600 font-bold ml-1 cursor-pointer bg-transparent border-0 p-0 text-[10px]"
                    >
                      [Gỡ]
                    </button>
                  </div>
                )}
                
                {/* Visibility Trigger */}
                <button
                  onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
                  className="flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-[var(--border-color)]/30 hover:bg-[var(--border-color)]/50 border border-[var(--border-color)]/20 rounded-full text-[10px] font-black text-[var(--text-color)] uppercase tracking-wider transition-all cursor-pointer"
                >
                  {visibility === "public" ? <Globe className="w-3 h-3 text-primary" /> : <Lock className="w-3 h-3 text-amber-500" />}
                  <span>{visibility === "public" ? "Công khai" : "Chỉ mình tôi"}</span>
                </button>
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
            {mediaPreviews.length > 0 && (
              <div className="mt-2 relative">
                {mediaPreviews.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setShowEditImagesModal(true)}
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-black rounded-xl text-xs font-black shadow-md z-20 cursor-pointer border-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Chỉnh sửa tất cả
                  </button>
                )}
                {mediaPreviews.length === 1 && (
                  <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-black/15 flex items-center justify-center max-h-[500px]">
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                      style={{ backgroundImage: `url(${mediaPreviews[0]})` }}
                    />
                    <img src={mediaPreviews[0]} alt="preview" className="relative z-10 w-full h-auto max-h-[500px] object-contain block mx-auto" />
                    <button
                      type="button"
                      onClick={() => removeMedia(0)}
                      className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {mediaPreviews.length === 2 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
                    {mediaPreviews.map((url, index) => (
                      <div key={index} className="relative w-full h-full min-h-0 overflow-hidden flex items-center justify-center bg-black/15">
                        <div 
                          className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                          style={{ backgroundImage: `url(${url})` }}
                        />
                        <img src={url} alt="preview" className="relative z-10 max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {mediaPreviews.length === 3 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
                    <div className="relative w-full h-full min-h-0 overflow-hidden">
                      <img src={mediaPreviews[0]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeMedia(0)}
                        className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[1, 2].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={mediaPreviews[idx]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mediaPreviews.length === 4 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[3/2] w-full">
                    {/* Left Column: 2 rows */}
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={mediaPreviews[idx]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
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
                          <img src={mediaPreviews[idx]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mediaPreviews.length >= 5 && (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)] aspect-[1/1] w-full">
                    {/* Left Column: 2 rows */}
                    <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                      {[0, 1].map((idx) => (
                        <div key={idx} className="relative w-full h-full min-h-0 overflow-hidden">
                          <img src={mediaPreviews[idx]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
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
                          <img src={mediaPreviews[idx]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <div className="relative w-full h-full min-h-0 overflow-hidden">
                        <img src={mediaPreviews[4]} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeMedia(4)}
                          className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition-all cursor-pointer z-20 shadow-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {mediaPreviews.length > 5 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-black pointer-events-none select-none z-10">
                            +{mediaPreviews.length - 5}
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
              disabled={isPosting || (!content.trim() && mediaFiles.length === 0 && !selectedWorkout)}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-black disabled:opacity-50 font-black rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              {isPosting ? "Đang đăng..." : "Đăng bài viết"}
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
              {mediaPreviews.map((url, idx) => (
                <div key={idx} className="border border-[var(--border-color)] rounded-2xl overflow-hidden bg-black/5 flex flex-col relative group">
                  
                  {/* Backdrop blur layout */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                    {/* Blur bg */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-105"
                      style={{ backgroundImage: `url(${url})` }}
                    />
                    
                    {/* Image */}
                    <img src={url} alt="edit preview" className="relative z-10 max-h-full max-w-full object-contain aspect-video" />
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
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

    </div>,
    document.body
  );
}
