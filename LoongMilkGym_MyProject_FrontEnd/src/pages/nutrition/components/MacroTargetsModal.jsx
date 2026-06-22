import React, { useEffect } from "react";
import { Settings, Sparkles } from "lucide-react";

function MacroTargetsModal({
  showSettings,
  setShowSettings,
  targetCalories,
  setTargetCalories,
  targetProtein,
  setTargetProtein,
  targetCarbs,
  setTargetCarbs,
  targetFat,
  setTargetFat,
  targetFiber,
  setTargetFiber,
  targetWater,
  setTargetWater,
  handleSaveTargets,
  handleAutoCalculateTargets,
  isSavingTarget,
}) {
  useEffect(() => {
    if (showSettings) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSettings]);

  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <form
        onSubmit={handleSaveTargets}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-5 w-full max-w-[420px] flex flex-col gap-4 shadow-2xl animate-slide-up"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-[var(--text-color)] m-0">
            <Settings className="w-5 h-5 text-primary" />
            Mục tiêu dinh dưỡng
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              Mục tiêu Calories (kcal)
            </label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                Protein (g)
              </label>
              <input
                type="number"
                value={targetProtein}
                onChange={(e) => setTargetProtein(e.target.value)}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                Carbs (g)
              </label>
              <input
                type="number"
                value={targetCarbs}
                onChange={(e) => setTargetCarbs(e.target.value)}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                Fat (g)
              </label>
              <input
                type="number"
                value={targetFat}
                onChange={(e) => setTargetFat(e.target.value)}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                Chất xơ (g)
              </label>
              <input
                type="number"
                value={targetFiber}
                onChange={(e) => setTargetFiber(e.target.value)}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider text-center">
                Nước (ml)
              </label>
              <input
                type="number"
                value={targetWater}
                onChange={(e) => setTargetWater(e.target.value)}
                className="w-full h-10 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl px-3 text-xs text-[var(--text-color)] outline-none focus:border-primary font-bold text-center"
              />
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleAutoCalculateTargets}
          className="w-full h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 mt-1"
        >
          <Sparkles className="w-4 h-4" />
          Tự động tính theo chỉ số cơ thể
        </button>
        
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="flex-1 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--bg-color)] cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="submit"
            disabled={isSavingTarget}
            className="flex-1 h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover disabled:opacity-60 cursor-pointer border-0"
          >
            {isSavingTarget ? "Đang lưu..." : "Xác nhận & Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MacroTargetsModal;
