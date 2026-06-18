import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Play, ChevronRight, Zap } from "lucide-react";
import { useGetWorkoutProgramsQuery } from "@/services/roadmap/roadmapApi";
import paths from "@/config/path";

const MOCK_PROGRAMS = [
  {
    id: "push-day",
    title: "Push Day",
    slug: "push-day",
    description: "Tập trung phát triển sức mạnh và độ dày nhóm cơ đẩy (Ngực, Vai, Tay sau).",
    durationWeeks: 4,
    difficulty: "Trung bình",
    daysCount: 3,
    level: "Intermediate",
    accent: true,
  },
  {
    id: "pull-day",
    title: "Pull Day",
    slug: "pull-day",
    description: "Tối ưu độ rộng lưng xô, cơ thang và độ cuộn của bắp tay trước.",
    durationWeeks: 4,
    difficulty: "Trung bình",
    daysCount: 3,
    level: "Intermediate",
    accent: false,
  },
  {
    id: "leg-day",
    title: "Leg Day",
    slug: "leg-day",
    description: "Xây dựng bệ đỡ thân dưới vững chắc với các bài đùi trước, đùi sau và bắp chân.",
    durationWeeks: 4,
    difficulty: "Khó",
    daysCount: 2,
    level: "Advanced",
    accent: false,
  },
];

function RecommendedPrograms() {
  const navigate = useNavigate();
  const { data: apiData, isLoading } = useGetWorkoutProgramsQuery();

  // Use API programs if available, otherwise mock
  const programs = apiData?.data && apiData.data.length > 0
    ? apiData.data.slice(0, 3).map((p, idx) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description || "Giáo án tập luyện chuyên nghiệp thiết kế theo khoa học.",
        durationWeeks: p.durationWeeks || 8,
        difficulty: p.difficulty || "Trung bình",
        daysCount: p.days?.[0]?.dayNumber || 4,
        level: p.difficulty === "Advanced" ? "Nâng cao" : "Cơ bản",
        accent: idx === 0, // Accent the first one
      }))
    : MOCK_PROGRAMS;

  return (
    <section className="w-full py-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight m-0">
            Lộ trình gợi ý
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xl">
            Các giáo án được thiết kế chuyên biệt dựa trên mục tiêu tăng cơ, giảm mỡ hoặc nâng cao thể lực bền bỉ.
          </p>
        </div>
        
        <button
          onClick={() => navigate(paths.myPlan)}
          className="inline-flex items-center gap-1 text-xs font-black tracking-wider uppercase text-[var(--text-primary)] hover:opacity-85 cursor-pointer bg-transparent border-0"
        >
          Tất cả lộ trình
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Program list grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-72 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div 
              key={program.id}
              className={`flex flex-col p-6 rounded-3xl border transition-all duration-300 min-h-[280px] ${
                program.accent 
                  ? "bg-indigo-500/5 dark:bg-indigo-500/10 border-indigo-500/35 shadow-md shadow-indigo-500/5 hover:-translate-y-1.5" 
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-primary/45 hover:-translate-y-1"
              }`}
            >
              {/* Badge/Tags */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${
                  program.accent 
                    ? "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/25" 
                    : "bg-gray-500/10 text-[var(--text-muted)] border border-[var(--border-color)]"
                }`}>
                  {program.level || "Phổ thông"}
                </span>
                
                <div className="flex items-center gap-1 text-xs font-extrabold text-[var(--text-muted)]">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {program.durationWeeks} tuần
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-black text-[var(--text-color)] m-0 leading-snug tracking-tight">
                  {program.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2.5">
                  {program.description}
                </p>
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">Độ khó</span>
                  <span className="text-xs font-black text-[var(--text-color)]">{program.difficulty}</span>
                </div>

                <button
                  onClick={() => navigate(paths.myPlan)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 font-black text-xs rounded-xl transition-all duration-200 cursor-pointer border-0 ${
                    program.accent
                      ? "bg-primary text-black hover:bg-primary-hover shadow-md shadow-primary/15"
                      : "bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary/40"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  Bắt đầu
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </section>
  );
}

export default RecommendedPrograms;
