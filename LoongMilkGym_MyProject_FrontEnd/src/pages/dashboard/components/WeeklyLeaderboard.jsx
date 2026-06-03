import React from "react";
import { Trophy } from "lucide-react";

function WeeklyLeaderboard({ userName, userInitial }) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-4 flex items-center gap-1.5">
        <Trophy className="w-4.5 h-4.5 text-[var(--text-muted)]" />
        Bảng xếp hạng tuần
      </h3>

      <div className="flex flex-col gap-2.5">
        {/* TOP 1 */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-primary/20 rounded-2xl shadow-xs">
          <span className="text-sm font-black w-6 text-center text-primary">1</span>
          <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-black">
            MT
          </div>
          <span className="text-xs font-bold text-[var(--text-color)] flex-1 truncate">Minh T.</span>
          <span className="text-[11px] font-black text-primary">4200 pts</span>
        </div>

        {/* TOP 2 */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
          <span className="text-sm font-black w-6 text-center text-[var(--text-muted)]">2</span>
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[var(--text-muted)] flex items-center justify-center text-xs font-bold">
            HP
          </div>
          <span className="text-xs font-bold text-[var(--text-color)] flex-1 truncate">Hoàng P.</span>
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">3850 pts</span>
        </div>

        {/* TOP 3 */}
        <div className="flex items-center gap-3 p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl">
          <span className="text-sm font-black w-6 text-center text-[var(--text-muted)]">3</span>
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {userInitial || "A"}
          </div>
          <span className="text-xs font-bold text-[var(--text-color)] flex-1 truncate">{userName || "Alex"} (Bạn)</span>
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">3100 pts</span>
        </div>
      </div>
    </div>
  );
}

export default WeeklyLeaderboard;
