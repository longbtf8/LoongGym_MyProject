import React, { useState, useEffect, useMemo } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { GOAL_MAP, DIFFICULTY_MAP } from "./ProgramCard";
import CustomSelect from "@/components/common/CustomSelect";

export default function ProgramFormModal({
  isOpen,
  onClose,
  onSave,
  program = null,
  filtersData = null,
  isLoading = false,
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [goal, setGoal] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (program) {
      setTitle(program.title || "");
      setSlug(program.slug || "");
      setGoal(program.goal || "");
      setDifficulty(program.difficulty || "");
      setDescription(program.description || "");
      setPreviewUrl(program.coverImageUrl || "");
      setCoverImage(null);
    } else {
      setTitle("");
      setSlug("");
      setGoal("");
      setDifficulty("");
      setDescription("");
      setPreviewUrl("");
      setCoverImage(null);
    }
  }, [program, isOpen]);

  const filterGoals = filtersData?.goals || [];
  const allGoals = Array.from(new Set([...filterGoals, "muscle_gain", "fat_loss", "weight_gain", "toning", "fitness", "maintenance", "hypertrophy"]));
  const filterDiffs = filtersData?.difficulties || [];
  const allDiffs = Array.from(new Set([...filterDiffs, "beginner", "intermediate", "advanced"]));

  const goalOptions = useMemo(
    () => allGoals.map((g) => ({ label: GOAL_MAP[g] || g, value: g })),
    [filtersData]
  );
  const difficultyOptions = useMemo(
    () => allDiffs.map((d) => ({ label: DIFFICULTY_MAP[d] || d, value: d })),
    [filtersData]
  );

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("slug", slug.trim());
    formData.append("goal", goal);
    formData.append("difficulty", difficulty);
    formData.append("price", "0");
    formData.append("description", description.trim());
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      {/* Modal Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-reactions-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)]/60 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[var(--text-color)]">
            {program ? "Chỉnh sửa giáo án" : "Tạo giáo án mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {/* Cover image upload */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Ảnh bìa giáo án
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-64 aspect-[16/9] rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-color)] flex items-center justify-center overflow-hidden relative group">
                {previewUrl ? (
                   <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[var(--text-muted)] opacity-40" />
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[10px] font-black text-[var(--text-color)]">
                    <Upload className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>Đổi ảnh</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 w-full">
                <p className="text-[10px] font-bold text-[var(--text-muted)]">
                  Hỗ trợ JPG, PNG. Tối đa 5MB. Di chuột vào ảnh để đổi.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Tiêu đề giáo án <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                placeholder="Ví dụ: Giáo án Đẩy - Kéo - Chân (PPL)"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Đường dẫn (Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
                placeholder="Để trống tự tạo từ tiêu đề"
              />
            </div>

            {/* Goal */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Mục tiêu
              </label>
              <CustomSelect
                value={goal}
                onChange={setGoal}
                options={goalOptions}
                placeholder="Chọn mục tiêu..."
                variant="form"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Độ khó
              </label>
              <CustomSelect
                value={difficulty}
                onChange={setDifficulty}
                options={difficultyOptions}
                placeholder="Chọn độ khó..."
                variant="form"
              />
            </div>

            {/* Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                Mô tả chi tiết
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 p-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)] resize-none"
                placeholder="Nhập mô tả ngắn gọn về mục tiêu, lịch trình hoặc kết quả mong đợi..."
              />
            </div>
          </div>

          {/* Footer Action buttons */}
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
              {isLoading ? "Đang lưu..." : program ? "Lưu thay đổi" : "Tạo giáo án"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
