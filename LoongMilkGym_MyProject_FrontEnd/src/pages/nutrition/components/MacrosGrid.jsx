import React from "react";

function MacrosGrid({
  totals,
  proTargetVal,
  proPct,
  isProExceeded,
  carbTargetVal,
  carbPct,
  isCarbExceeded,
  fatTargetVal,
  fatPct,
  isFatExceeded,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* CARD PROTEIN */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Protein (Chất đạm)</span>
            <div className="text-xl font-black mt-1">{totals.protein}g / {proTargetVal}g</div>
          </div>
          <span className="w-7 h-7 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black flex items-center justify-center rounded-lg">P</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(proPct, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${isProExceeded ? "bg-red-500" : "bg-primary"}`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[var(--text-muted)]">{proPct}% nạp vào</span>
          {isProExceeded && (
            <span className="text-red-500 flex items-center gap-0.5 font-black uppercase">
              ⚠️ Vượt {Math.round((totals.protein - proTargetVal) * 10) / 10}g
            </span>
          )}
        </div>
      </div>

      {/* CARD CARBS */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Carbs (Tinh bột)</span>
            <div className="text-xl font-black mt-1">{totals.carbs}g / {carbTargetVal}g</div>
          </div>
          <span className="w-7 h-7 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] font-black flex items-center justify-center rounded-lg">C</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(carbPct, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${isCarbExceeded ? "bg-red-500" : "bg-cyan-400"}`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[var(--text-muted)]">{carbPct}% nạp vào</span>
          {isCarbExceeded && (
            <span className="text-red-500 flex items-center gap-0.5 font-black uppercase">
              ⚠️ Vượt {Math.round((totals.carbs - carbTargetVal) * 10) / 10}g
            </span>
          )}
        </div>
      </div>

      {/* CARD FAT */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-3.5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-[var(--text-muted)]">Fat (Chất béo)</span>
            <div className="text-xl font-black mt-1">{totals.fat}g / {fatTargetVal}g</div>
          </div>
          <span className="w-7 h-7 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black flex items-center justify-center rounded-lg">F</span>
        </div>
        <div className="h-1.5 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(fatPct, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${isFatExceeded ? "bg-red-500" : "bg-amber-500"}`}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[var(--text-muted)]">{fatPct}% nạp vào</span>
          {isFatExceeded && (
            <span className="text-red-500 flex items-center gap-0.5 font-black uppercase">
              ⚠️ Vượt {Math.round((totals.fat - fatTargetVal) * 10) / 10}g
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MacrosGrid;
