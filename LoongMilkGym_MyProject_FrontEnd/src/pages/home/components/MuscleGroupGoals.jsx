import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Activity, ShieldCheck, Zap, Flame, Target, Heart } from "lucide-react";
import paths from "@/config/path";

function MuscleGroupGoals() {
  const navigate = useNavigate();

  const muscleGroups = [
    { name: "Ngực", slug: "nguc", icon: Dumbbell, color: "text-red-500 bg-red-500/10" },
    { name: "Lưng", slug: "lung", icon: Activity, color: "text-blue-500 bg-blue-500/10" },
    { name: "Vai", slug: "vai", icon: ShieldCheck, color: "text-purple-500 bg-purple-500/10" },
    { name: "Tay", slug: "tay", icon: Zap, color: "text-yellow-500 bg-yellow-500/10" },
    { name: "Chân", slug: "chan", icon: Flame, color: "text-orange-500 bg-orange-500/10" },
    { name: "Bụng", slug: "bung", icon: Target, color: "text-green-500 bg-green-500/10" },
    { name: "Cardio", slug: "cardio", icon: Heart, color: "text-pink-500 bg-pink-500/10" },
  ];

  const handleSelect = (slug) => {
    // Navigate to exercise library with query parameter
    navigate(`${paths.exercises}?muscle=${slug}`);
  };

  return (
    <section className="w-full py-10 text-center">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight m-0">
          Mục tiêu tập luyện theo nhóm cơ
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-lg mx-auto">
          Tập trung thúc đẩy và phát triển các vùng cơ thể cụ thể bạn mong muốn nâng cấp.
        </p>
      </div>

      {/* Grid horizontal scrollable list */}
      <div className="flex items-center justify-start lg:justify-center gap-4 overflow-x-auto pb-4 no-scrollbar px-2">
        {muscleGroups.map((mg, index) => {
          const Icon = mg.icon;
          return (
            <button
              key={index}
              onClick={() => handleSelect(mg.slug)}
              className="flex flex-col items-center gap-3 shrink-0 px-6 py-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/45 rounded-2xl shadow-sm hover:shadow active:scale-95 transition-all duration-300 min-w-[96px] cursor-pointer"
            >
              <div className={`p-3 rounded-xl ${mg.color} transition-colors duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-extrabold text-[var(--text-color)]">
                {mg.name}
              </span>
            </button>
          );
        })}
      </div>

    </section>
  );
}

export default MuscleGroupGoals;
