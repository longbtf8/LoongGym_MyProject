import React from "react";
import { Utensils, Plus } from "lucide-react";

function NutritionTracker({ nutrition }) {
  const getPercent = (value, target) => {
    if (!target) return 0;
    const pct = Math.round((value / target) * 100);
    return pct > 100 ? 100 : pct;
  };

  const proteinPct = getPercent(nutrition.protein, nutrition.proteinTarget);
  const carbsPct = getPercent(nutrition.carbs, nutrition.carbsTarget);
  const fatPct = getPercent(nutrition.fat, nutrition.fatTarget);

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase m-0 flex items-center gap-1.5">
            <Utensils className="w-4.5 h-4.5 text-[var(--text-muted)]" />
            Dinh dưỡng hôm nay
          </h3>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[var(--text-color)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Protein
              </span>
              <span className="text-[var(--text-muted)]">
                {nutrition.protein} / {nutrition.proteinTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
              <div 
                style={{ width: `${proteinPct}%` }}
                className="h-full bg-primary rounded-full transition-all duration-500" 
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[var(--text-color)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Carbs
              </span>
              <span className="text-[var(--text-muted)]">
                {nutrition.carbs} / {nutrition.carbsTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
              <div 
                style={{ width: `${carbsPct}%` }}
                className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[var(--text-color)] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Fat
              </span>
              <span className="text-[var(--text-muted)]">
                {nutrition.fat} / {nutrition.fatTarget}g
              </span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-full overflow-hidden">
              <div 
                style={{ width: `${fatPct}%` }}
                className="h-full bg-amber-500 rounded-full transition-all duration-500" 
              />
            </div>
          </div>
        </div>
      </div>

      <button className="w-full py-3.5 bg-transparent border border-[var(--border-color)] hover:border-primary/45 text-[var(--text-color)] hover:text-primary font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-6 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Thêm bữa ăn
      </button>
    </div>
  );
}

export default NutritionTracker;
