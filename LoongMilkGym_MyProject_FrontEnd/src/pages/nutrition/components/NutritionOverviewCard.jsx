import React from "react";
import { AlertTriangle, Flame, Droplet, Info } from "lucide-react";

function NutritionOverviewCard({
  totals,
  calTargetVal,
  calRemaining,
  isCalExceeded,
  calPct,
  target,
}) {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      {/* CỘT 1: SỐ LIỆU CALO */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
        <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-wider">
          Lượng Calo nạp vào
        </span>
        <div className="text-4xl font-black tracking-tight flex items-baseline gap-1.5">
          <span>{totals.calories}</span>
          <span className="text-sm font-extrabold text-[var(--text-muted)]">/ {calTargetVal} kcal</span>
        </div>
        <div className={`text-xs font-extrabold flex items-center gap-1 mt-1 ${isCalExceeded ? "text-red-500" : "text-primary"}`}>
          {isCalExceeded ? (
            <>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Đã vượt {Math.abs(calRemaining)} kcal
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 fill-primary shrink-0 animate-bounce" />
              Còn lại {calRemaining} kcal
            </>
          )}
        </div>
      </div>

      {/* CỘT 2: THANH TIẾN TRÌNH TRỰC QUAN */}
      <div className="flex flex-col justify-center gap-1.5 animate-pulse-slow">
        <div className="h-4 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden relative">
          <div
            style={{ width: `${Math.min(calPct, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${isCalExceeded ? "bg-red-500" : "bg-primary"}`}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white mix-blend-difference">
            {calPct}% mục tiêu
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-bold">
          <span>0 kcal</span>
          <span>Mục tiêu: {calTargetVal} kcal</span>
        </div>
      </div>

      {/* CỘT 3: NƯỚC UỐNG & CHẤT XƠ */}
      <div className="border-t md:border-t-0 md:border-l border-[var(--border-color)] pt-4 md:pt-0 md:pl-6 flex flex-col gap-3 justify-center">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> Nước uống:
          </span>
          <span className="text-xs font-black">
            Mục tiêu: {target.waterMlTarget ?? 2000} ml
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-orange-400" /> Chất xơ (Fiber):
          </span>
          <span className="text-xs font-black">
            Mục tiêu: {target.fiberGTarget ?? 25} g
          </span>
        </div>
      </div>
    </div>
  );
}

export default NutritionOverviewCard;
