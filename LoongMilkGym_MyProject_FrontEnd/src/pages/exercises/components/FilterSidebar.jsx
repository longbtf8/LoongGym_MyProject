import React from "react";
import { useGetMuscleGroupsQuery, useGetEquipmentQuery } from "@/services/exercise/exerciseApi";
import { Search, RotateCcw } from "lucide-react";

const muscleTranslation = {
  "Ngực": "Chest",
  "Lưng": "Back",
  "Chân": "Legs",
  "Vai": "Shoulders",
  "Core": "Core",
  "Đùi sau": "Hamstrings",
  "Đùi trước": "Quads",
  "Bắp chân": "Calves",
  "Lưng dưới": "Lower Back",
  "Mông": "Glutes",
  "Tay sau": "Triceps",
  "Tay trước": "Biceps",
  "Tim mạch": "Cardio"
};

export default function FilterSidebar({
  searchTerm,
  setSearchTerm,
  difficulty,
  setDifficulty,
  selectedMuscles,
  toggleMuscle,
  selectedEquipment,
  toggleEquipment,
  resetFilters
}) {
  const { data: muscleGroupsData, isLoading: loadingMuscles } = useGetMuscleGroupsQuery();
  const { data: equipmentData, isLoading: loadingEquipment } = useGetEquipmentQuery();

  const muscleGroups = muscleGroupsData?.data || [];
  const equipmentList = equipmentData?.data || [];

  const difficulties = [
    { label: "Người mới", value: "beginner" },
    { label: "Trung bình", value: "intermediate" },
    { label: "Nâng cao", value: "advanced" }
  ];

  const handleDifficultyClick = (val) => {
    if (difficulty === val) {
      setDifficulty(""); // Deselect if click again
    } else {
      setDifficulty(val);
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-5 shrink-0 flex flex-col gap-6 shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <h2 className="text-xl font-bold text-[var(--text-color)]">Bộ lọc thông minh</h2>
        <button
          onClick={resetFilters}
          className="text-xs text-[var(--text-muted)] hover:text-[#ccff00] flex items-center gap-1 transition-colors cursor-pointer"
          title="Đặt lại bộ lọc"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Tìm kiếm */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Tìm kiếm</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-color)] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-border)] focus:border-[var(--input-focus-border)] transition-colors placeholder-[var(--text-muted)]/60"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]/75" size={16} />
        </div>
      </div>

      {/* Nhóm cơ */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nhóm cơ</label>
        {loadingMuscles ? (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="h-4 bg-[var(--border-color)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--border-color)] rounded w-5/6"></div>
            <div className="h-4 bg-[var(--border-color)] rounded w-2/3"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {muscleGroups.map((mg) => {
              const engName = muscleTranslation[mg.name] || mg.name;
              const isChecked = selectedMuscles.includes(mg.slug);
              return (
                <label
                  key={mg.id}
                  className="flex items-center gap-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMuscle(mg.slug)}
                    className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] accent-[#ccff00] text-black cursor-pointer focus:ring-0 focus:ring-offset-0"
                  />
                  <span>
                    {mg.name} <span className="text-xs text-[var(--text-muted)]/70">({engName})</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Thiết bị */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Thiết bị</label>
        {loadingEquipment ? (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="h-4 bg-[var(--border-color)] rounded w-2/3"></div>
            <div className="h-4 bg-[var(--border-color)] rounded w-3/4"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {equipmentList.map((eq) => {
              const isChecked = selectedEquipment.includes(eq.slug);
              return (
                <label
                  key={eq.id}
                  className="flex items-center gap-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleEquipment(eq.slug)}
                    className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] accent-[#ccff00] text-black cursor-pointer focus:ring-0 focus:ring-offset-0"
                  />
                  <span>{eq.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Cấp độ */}
      <div className="flex flex-col gap-3 border-t border-[var(--border-color)] pt-4">
        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Cấp độ</label>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => {
            const isActive = difficulty === diff.value;
            return (
              <button
                key={diff.value}
                onClick={() => handleDifficultyClick(diff.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#ccff00] text-black shadow-md shadow-[#ccff00]/10 scale-105"
                    : "bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]"
                }`}
              >
                {diff.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
