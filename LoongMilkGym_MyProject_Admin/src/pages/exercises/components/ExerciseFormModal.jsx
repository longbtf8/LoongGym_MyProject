import React, { useState, useEffect, useMemo } from "react";
import { X, Video, Info, Upload, Image as ImageIcon } from "lucide-react";
import { useGetMuscleGroupsQuery } from "@/services/admin/adminApi";
import CustomSelect from "@/components/common/CustomSelect";

export const DIFFICULTY_MAP = {
  beginner: "Mới bắt đầu",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

export default function ExerciseFormModal({
  isOpen,
  onClose,
  onSave,
  exercise = null,
  isLoading = false,
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [primaryMuscleGroupId, setPrimaryMuscleGroupId] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [muscleError, setMuscleError] = useState("");

  const { data: muscleGroupsRes } = useGetMuscleGroupsQuery(undefined, { skip: !isOpen });
  const muscleGroups = muscleGroupsRes?.data || [];

  const muscleOptions = useMemo(
    () => muscleGroups.map((mg) => ({ label: mg.name, value: mg.id })),
    [muscleGroups]
  );

  useEffect(() => {
    if (exercise) {
      setName(exercise.name || "");
      setSlug(exercise.slug || "");
      setDifficulty(exercise.difficulty || "beginner");
      setVideoUrl(exercise.videoUrl || "");
      setDescription(exercise.description || "");
      setIsPublished(exercise.isPublished ?? true);
      setPreviewUrl(exercise.thumbnailUrl || "");
      setThumbnail(null);

      const primary = exercise.muscles?.find((m) => m.role === "primary");
      setPrimaryMuscleGroupId(primary?.muscleGroupId || primary?.muscleGroup?.id || "");
    } else {
      setName("");
      setSlug("");
      setDifficulty("beginner");
      setVideoUrl("");
      setDescription("");
      setIsPublished(true);
      setPrimaryMuscleGroupId("");
      setPreviewUrl("");
      setThumbnail(null);
    }
    setMuscleError("");
  }, [exercise, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!primaryMuscleGroupId) {
      setMuscleError("Vui lòng chọn nhóm cơ chính.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (slug.trim()) {
      formData.append("slug", slug.trim());
    }
    formData.append("difficulty", difficulty);
    formData.append("videoUrl", videoUrl.trim() || "");
    formData.append("description", description.trim());
    formData.append("isPublished", isPublished ? "true" : "false");
    formData.append("primaryMuscleGroupId", primaryMuscleGroupId);

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-reactions-in">
        <div className="px-6 py-4 border-b border-[var(--border-color)]/60 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[var(--text-color)]">
            {exercise ? "Chỉnh sửa bài tập" : "Thêm bài tập mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Hình ảnh bài tập
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-color)] flex items-center justify-center overflow-hidden relative group shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-[var(--text-muted)] opacity-40" />
                )}
              </div>

              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 h-10 px-4 border border-[var(--border-color)]/60 border-dashed rounded-xl cursor-pointer hover:bg-[var(--border-color)]/25 text-xs font-black transition-all">
                  <Upload className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>Tải ảnh lên...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[9px] font-bold text-[var(--text-muted)] mt-1.5">
                  Định dạng JPG, PNG. Tối đa 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Tên bài tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
              placeholder="Ví dụ: Bench Press, Barbell Squat..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Đường dẫn (Slug)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
              placeholder="Để trống tự tạo từ tên bài tập"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Nhóm cơ chính <span className="text-rose-500">*</span>
            </label>
            <CustomSelect
              value={primaryMuscleGroupId}
              onChange={(val) => {
                setPrimaryMuscleGroupId(val);
                setMuscleError("");
              }}
              options={muscleOptions}
              placeholder="-- Chọn nhóm cơ chính --"
              variant="form"
              error={!!muscleError}
            />
            {muscleError && (
              <p className="text-[10px] font-bold text-rose-500">{muscleError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Độ khó bài tập
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DIFFICULTY_MAP).map(([key, label]) => {
                const isActive = difficulty === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDifficulty(key)}
                    className={`h-11 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? "bg-[var(--color-primary)]/15 border-[var(--color-primary)] text-[var(--text-primary)]"
                        : "bg-[var(--bg-color)] border-[var(--border-color)]/60 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/20"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Video className="w-4 h-4 text-rose-500" />
              <span>Link hướng dẫn YouTube</span>
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Mô tả hướng dẫn thực hiện
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 p-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)] resize-none"
              placeholder="Nhập mô tả tư thế chuẩn, nhịp thở hoặc các lỗi sai thường gặp khi tập..."
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[var(--text-color)]">Kích hoạt bài tập</p>
                <p className="text-[10px] text-[var(--text-muted)] font-bold">Người dùng có thể xem và chọn bài tập này.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--border-color)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-[var(--border-color)]/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl border border-[var(--border-color)] text-xs font-black text-[var(--text-color)] hover:bg-[var(--border-color)]/30 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 h-11 rounded-xl bg-[var(--color-primary)] text-black text-xs font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? "Đang lưu..." : exercise ? "Lưu thay đổi" : "Thêm bài tập"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
