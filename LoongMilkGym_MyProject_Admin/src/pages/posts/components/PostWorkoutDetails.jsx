import React from "react";
import { Trophy, Clock, Flame, Dumbbell } from "lucide-react";

export default function PostWorkoutDetails({ session }) {
  if (!session) return null;

  const formatWorkoutDuration = (seconds) => {
    if (!seconds) return "0 phút";
    const mins = Math.floor(seconds / 60);
    return `${mins} phút`;
  };

  return (
    <div className="p-4.5 rounded-2xl border border-[var(--border-color)]/60 bg-[var(--bg-secondary)] space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border-color)]/20 pb-2">
        <div className="flex items-center gap-2 text-xs font-black text-[var(--text-color)]">
          <Trophy className="w-4 h-4 text-[var(--color-primary)]" />
          <span>Buổi tập kèm theo</span>
        </div>
        <span className="text-[10px] font-black text-[var(--color-primary)] uppercase bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md">
          {session.workoutProgramName || "Buổi tập tự do"}
        </span>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/50 text-center">
          <Clock className="w-4 h-4 text-sky-400 mx-auto mb-1" />
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Thời gian</p>
          <p className="text-xs font-black text-[var(--text-color)] mt-0.5">
            {formatWorkoutDuration(session.duration)}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-color)] border border(--border-color)/50 text-center">
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Calo tiêu hao</p>
          <p className="text-xs font-black text-[var(--text-color)] mt-0.5">
            {session.caloriesBurned || 0} kcal
          </p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/50 text-center">
          <Dumbbell className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Bài tập</p>
          <p className="text-xs font-black text-[var(--text-color)] mt-0.5">
            {session.exercises?.length || 0} bài
          </p>
        </div>
      </div>

      {/* Exercises detail list */}
      {session.exercises && session.exercises.length > 0 && (
        <div className="space-y-2 mt-2">
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Chi tiết bài tập:</p>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar">
            {session.exercises.map((se, idx) => (
              <div key={se.id || idx} className="p-2.5 rounded-xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/30 text-xs flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-[var(--text-color)]">{se.exercise?.name}</span>
                  <p className="text-[9px] text-[var(--text-muted)]">Nhóm cơ: {se.exercise?.muscleGroup}</p>
                </div>
                <span className="font-bold text-[var(--color-primary)] text-[10px]">
                  {se.sets?.length || 0} Sets x {se.sets?.[0]?.reps || 0} reps ({se.sets?.[0]?.weightKg || 0}kg)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
