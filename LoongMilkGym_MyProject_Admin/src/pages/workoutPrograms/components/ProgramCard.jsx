import React from "react";
import { CalendarDays, Edit2, Eye, Trash2, Tag, Layers, Dumbbell } from "lucide-react";

export const GOAL_MAP = {
  muscle_gain: "Tăng cơ bắp",
  fat_loss: "Giảm mỡ",
  weight_gain: "Tăng cân",
  toning: "Giữ dáng",
  fitness: "Thể chất",
  maintenance: "Duy trì",
  hypertrophy: "Phì đại cơ",
};

export const DIFFICULTY_MAP = {
  beginner: "Mới bắt đầu",
  intermediate: "Trung bình",
  advanced: "Nâng cao",
};

export default function ProgramCard({ program, onOpenDetail, onEdit, onDelete }) {
  const {
    id,
    title,
    coverImageUrl,
    goal,
    difficulty,
    isPublished,
    price,
    daysCount,
  } = program;

  const goalLabel = GOAL_MAP[goal] || goal || "Chưa xác định";
  const difficultyLabel = DIFFICULTY_MAP[difficulty] || difficulty || "Chưa xác định";

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
      {/* Cover Image & Status Badge */}
      <div className="relative aspect-[16/9] w-full bg-[var(--border-color)]/20 overflow-hidden">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-[var(--text-muted)]">
            <Dumbbell className="w-10 h-10 opacity-40" />
          </div>
        )}

        {/* Status Badge */}
        <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-md ${
          isPublished
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md"
            : "bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-md"
        }`}>
          {isPublished ? "Đã xuất bản" : "Bản nháp"}
        </span>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {goal && (
              <span className="px-2 py-0.5 rounded bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[10px] font-bold text-[var(--text-primary)] flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {goalLabel}
              </span>
            )}
            {difficulty && (
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 flex items-center gap-1">
                <Layers className="w-2.5 h-2.5" />
                {difficultyLabel}
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-sm sm:text-base text-[var(--text-color)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
            {title}
          </h3>
        </div>

        {/* Meta Info */}
        <div className="pt-3 border-t border-[var(--border-color)]/40 text-xs font-bold text-[var(--text-muted)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>{daysCount || 0} ngày tập</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => onOpenDetail(id)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-[var(--border-color)]/60 text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/30 hover:border-[var(--text-color)] transition-all cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem</span>
          </button>
          <button
            onClick={() => onEdit(program)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-[var(--border-color)]/60 text-xs font-bold text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/40 transition-all cursor-pointer"
            title="Sửa thông tin"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa</span>
          </button>
          <button
            onClick={() => onDelete(id)}
            className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-400/40 transition-all cursor-pointer"
            title="Xóa giáo án"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
