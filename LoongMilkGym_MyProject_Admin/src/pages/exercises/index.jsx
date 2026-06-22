import React from "react";
import { Plus, Search, Dumbbell, Award, Flame } from "lucide-react";

export default function Exercises() {
  const exercises = [
    { id: 1, name: "Push up (Hít đất)", category: "Ngực, Vai, Tay sau", level: "Cơ bản", duration: "10-15 phút", xp: "+20 XP" },
    { id: 2, name: "Squat (Gánh đùi)", category: "Mông, Đùi trước, Đùi sau", level: "Cơ bản", duration: "12-18 phút", xp: "+25 XP" },
    { id: 3, name: "Pull up (Hít xà đơn)", category: "Lưng xô, Tay trước", level: "Trung bình", duration: "15-20 phút", xp: "+35 XP" },
    { id: 4, name: "Plank (Gồng bụng)", category: "Cơ trọng tâm (Core)", level: "Cơ bản", duration: "5-10 phút", xp: "+15 XP" },
  ];

  return (
    <div className="space-y-6 animate-reactions-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-color)]">Thư viện bài tập</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-1">
            Quản lý cơ sở dữ liệu các bài tập thể lực và thể hình của hệ thống LoongMilkGym.
          </p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-black hover:bg-[var(--color-primary-hover)] text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all">
          <Plus className="w-4 h-4" /> Thêm bài tập
        </button>
      </div>

      {/* Search and filter */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Tìm bài tập theo tên hoặc nhóm cơ..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 text-xs font-bold outline-none text-[var(--text-color)] focus:border-[var(--input-focus-border)] transition-all"
        />
      </div>

      {/* Grid of exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[var(--text-primary)] mb-3">
                <Dumbbell className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{exercise.category}</span>
              </div>
              <h3 className="text-sm font-black text-[var(--text-color)]">{exercise.name}</h3>
            </div>
            <div className="flex items-center justify-between mt-5 border-t border-[var(--border-color)]/60 pt-4">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-semibold">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {exercise.level}
              </div>
              <span className="text-[10px] font-extrabold text-[var(--text-primary)] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10">
                {exercise.xp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
