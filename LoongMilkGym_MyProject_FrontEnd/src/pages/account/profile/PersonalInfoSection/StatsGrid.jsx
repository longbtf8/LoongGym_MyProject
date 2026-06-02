import React from "react";
import { Flame } from "lucide-react";
import { WEIGHT_UNIT_OPTIONS, HEIGHT_UNIT_OPTIONS } from "./constants";

function StatsGrid({ formData, isEditing, handleChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      
      {/* CÂN NẶNG */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cân nặng</span>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input 
                  type="number" 
                  name="weight"
                  step="any"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-16 px-1.5 py-0.5 text-lg sm:text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  name="weightUnit"
                  value={formData.weightUnit}
                  onChange={handleChange}
                  className="px-1.5 py-1 text-xs font-bold rounded-lg border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary cursor-pointer"
                >
                  {WEIGHT_UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{formData.weight || "--"}</span>
                <span className="text-xs font-bold text-[var(--text-muted)]">{formData.weightUnit || "kg"}</span>
              </>
            )}
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
            <path d="M6 3h12"/>
            <path d="M12 3v4"/>
          </svg>
        </div>
      </div>

      {/* CHIỀU CAO */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Chiều cao</span>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <input 
                  type="number" 
                  name="height"
                  step="any"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-16 px-1.5 py-0.5 text-lg sm:text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  name="heightUnit"
                  value={formData.heightUnit}
                  onChange={handleChange}
                  className="px-1.5 py-1 text-xs font-bold rounded-lg border-2 border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:border-primary cursor-pointer"
                >
                  {HEIGHT_UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{formData.height || "--"}</span>
                <span className="text-xs font-bold text-[var(--text-muted)]">{formData.heightUnit || "cm"}</span>
              </>
            )}
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <polyline points="19 12 12 19 5 12"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        </div>
      </div>

      {/* CALO */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 sm:p-6 flex items-center justify-between shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Mục tiêu Calo</span>
          <div className="flex items-baseline gap-1">
            {isEditing ? (
              <input 
                type="number" 
                name="calorieGoal"
                value={formData.calorieGoal}
                onChange={handleChange}
                className="w-20 px-1.5 py-0.5 text-lg sm:text-xl font-black rounded-lg border-2 border-primary bg-[var(--input-bg)] text-[var(--text-color)] outline-none focus:ring-1 focus:ring-primary mt-0.5"
              />
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-[var(--text-color)] leading-none">{formData.calorieGoal || "--"}</span>
            )}
            <span className="text-xs font-bold text-[var(--text-muted)]">kcal</span>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 animate-pulse">
          <Flame className="w-5.5 h-5.5" />
        </div>
      </div>

    </div>
  );
}

export default StatsGrid;
