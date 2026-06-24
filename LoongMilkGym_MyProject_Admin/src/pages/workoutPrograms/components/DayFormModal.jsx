import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DayFormModal({
  isOpen,
  onClose,
  onSave,
  day = null,
  suggestedCycleDay = 1,
  isLoading = false,
}) {
  const [title, setTitle] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [cycleDay, setCycleDay] = useState(1);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (day) {
      setTitle(day.title || "");
      setFocusArea(day.focusArea || "");
      setCycleDay(day.cycleDay || 1);
      setDescription(day.description || "");
    } else {
      setTitle("");
      setFocusArea("");
      setCycleDay(suggestedCycleDay);
      setDescription("");
    }
  }, [day, isOpen, suggestedCycleDay]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      focusArea: focusArea.trim(),
      cycleDay: parseInt(cycleDay) || 1,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      {/* Modal Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-reactions-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-color)]/60 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-[var(--text-color)]">
            {day ? "Chỉnh sửa ngày tập" : "Thêm ngày tập mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--border-color)]/30 hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Tiêu đề ngày tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
              placeholder="Ví dụ: Ngày 1: Ngực & Tay sau"
            />
          </div>

          {/* Cycle Day */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Thứ tự ngày trong chu kỳ tập (Cycle Day) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={cycleDay}
              onChange={(e) => setCycleDay(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
              placeholder="Ví dụ: 1"
            />
          </div>

          {/* Focus Area */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Nhóm cơ tập trung (Focus Area)
            </label>
            <input
              type="text"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full h-11 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 px-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)]"
              placeholder="Ví dụ: Ngực, Vai, Tay sau"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              Ghi chú / Mô tả ngày tập
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 p-4 text-xs font-bold focus:border-[var(--color-primary)] outline-none transition-all text-[var(--text-color)] resize-none"
              placeholder="Nhập ghi chú nhỏ cho buổi tập..."
            />
          </div>

          {/* Actions */}
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
              {isLoading ? "Đang lưu..." : day ? "Lưu thay đổi" : "Thêm ngày"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
