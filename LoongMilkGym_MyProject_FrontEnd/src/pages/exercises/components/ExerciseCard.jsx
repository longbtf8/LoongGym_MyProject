import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarPlus, Flame, Heart } from "lucide-react";

const difficultyMap = {
  beginner: { label: "Người mới", color: "text-emerald-400" },
  intermediate: { label: "Trung bình", color: "text-primary" },
  advanced: { label: "Nâng cao", color: "text-rose-500" }
};

export default function ExerciseCard({ exercise, isFavorite = false, onToggleFavorite, onAddToSchedule }) {
  const navigate = useNavigate();
  const primaryMuscle = exercise.muscles?.find((m) => m.role === "primary")?.muscleGroup?.name || "Toàn thân";
  const equipmentName = exercise.primaryEquipment?.name || "Tự trọng";
  const diffInfo = difficultyMap[exercise.difficulty] || { label: exercise.difficulty, color: "text-[var(--text-color)]" };

  return (
    <div className="group h-full pb-1">
      <div 
        onClick={() => navigate(`/exercises/${exercise.slug}`)}
        className="h-full bg-[var(--bg-secondary)] border border-[var(--border-color)] group-hover:border-primary/40 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-primary/5 cursor-pointer"
      >
        {/* Thumbnail Area */}
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--input-bg)]">
          {exercise.thumbnailUrl ? (
            <img
              src={exercise.thumbnailUrl}
              alt={exercise.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
              <Flame size={24} className="animate-pulse" />
            </div>
          )}
          
          {/* Badges overlay */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="bg-primary text-black text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md tracking-wider">
              {primaryMuscle}
            </span>
            <span className="bg-[var(--bg-color)]/80 backdrop-blur-md text-[var(--text-color)] text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-[var(--border-color)]/20">
              {equipmentName}
            </span>
          </div>

          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToSchedule?.(exercise);
              }}
              className="w-8 h-8 rounded-lg bg-[var(--bg-color)]/85 backdrop-blur-md border border-[var(--border-color)]/40 text-[var(--text-color)] hover:text-primary hover:border-primary/40 flex items-center justify-center transition cursor-pointer"
              title="Thêm vào lịch tập"
            >
              <CalendarPlus size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(exercise.id);
              }}
              className={`w-8 h-8 rounded-lg backdrop-blur-md border flex items-center justify-center transition cursor-pointer ${
                isFavorite
                  ? "bg-rose-500 text-white border-rose-400"
                  : "bg-[var(--bg-color)]/85 text-[var(--text-color)] border-[var(--border-color)]/40 hover:text-rose-400 hover:border-rose-400/40"
              }`}
              title={isFavorite ? "Bỏ yêu thích" : "Yêu thích bài tập"}
            >
              <Heart size={15} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-5 flex flex-col flex-1 gap-2 sm:gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--text-color)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-1">
              {exercise.name}
            </h3>
            {/* Ẩn mô tả trên mobile để tiết kiệm diện tích */}
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 min-h-8 hidden sm:block">
              {exercise.description || "Không có mô tả chi tiết cho bài tập này."}
            </p>
          </div>

          {/* Footer Area */}
          <div className="mt-auto pt-2 sm:pt-4 border-t border-[var(--border-color)] flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-1 shrink-0">
              <Flame size={12} className={`${diffInfo.color} sm:w-3.5 sm:h-3.5`} />
              <span className={`text-[10px] sm:text-xs font-semibold ${diffInfo.color}`}>{diffInfo.label}</span>
            </div>
            
            <Link
              to={`/exercises/${exercise.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-primary text-black hover:bg-primary-hover dark:bg-[#2a3014] dark:text-primary dark:hover:bg-[#343b19] font-bold text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-0.5 sm:gap-1 transition-all active:scale-95 shadow-sm w-full sm:w-auto lg:w-full xl:w-auto text-center whitespace-nowrap"
            >
              <span>Chi tiết</span>
              <ArrowRight size={11} className="sm:w-3 sm:h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
