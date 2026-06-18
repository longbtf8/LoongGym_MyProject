import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Play, ChevronRight, Dumbbell, AlertTriangle, ArrowRight, Loader2, Check } from "lucide-react";
import { 
  useGetWorkoutProgramsQuery, 
  useGetActivePlanQuery,
  useStartProgramPlanMutation 
} from "@/services/roadmap/roadmapApi";
import { useAuth } from "@/hooks/useAuth";
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
  const { isLoggedIn } = useAuth();
  
  // State for confirm modal
  const [confirmProgram, setConfirmProgram] = useState(null);
  // State for toast message
  const [toastMsg, setToastMsg] = useState("");

  // Fetch programs list
  const { data: apiData, isLoading: isLoadingPrograms } = useGetWorkoutProgramsQuery();
  
  // Fetch active plan if logged in
  const { data: activePlanRes, isLoading: isLoadingActivePlan, refetch: refetchActivePlan } = useGetActivePlanQuery(undefined, {
    skip: !isLoggedIn,
  });

  const activePlan = isLoggedIn && activePlanRes?.data ? activePlanRes.data : null;

  // Start plan mutation
  const [startProgramPlan, { isLoading: isStarting }] = useStartProgramPlanMutation();

  // Use API programs if available, otherwise mock
  const programs = apiData?.data && apiData.data.length > 0
    ? apiData.data.map((p, idx) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        description: p.description || "Giáo án tập luyện chuyên nghiệp thiết kế theo khoa học.",
        durationWeeks: p.durationWeeks || 8,
        difficulty: p.difficulty || "Trung bình",
        daysCount: p.daysCount || 4,
        level: p.difficulty === "Advanced" ? "Nâng cao" : "Cơ bản",
        accent: idx === 0, // Accent the first one
      }))
    : MOCK_PROGRAMS;

  // Filter out the active program from the recommended list so we don't recommend the one they are already doing
  const displayPrograms = activePlan 
    ? programs.filter(p => p.id !== activePlan.programId).slice(0, 3)
    : programs.slice(0, 3);

  // Smooth scroll to alternatives section
  const scrollToAlternatives = () => {
    document.getElementById("alternative-plans-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleActionClick = (program) => {
    if (!isLoggedIn) {
      navigate(paths.login);
      return;
    }
    setConfirmProgram(program);
  };

  const handleConfirmStart = async () => {
    if (!confirmProgram) return;
    try {
      await startProgramPlan({ programId: confirmProgram.id }).unwrap();
      setToastMsg(`Đã kích hoạt lộ trình ${confirmProgram.title} thành công!`);
      setConfirmProgram(null);
      refetchActivePlan();
      
      // Navigate to plan page after a short delay
      setTimeout(() => {
        navigate(paths.myPlan);
      }, 1500);
    } catch (err) {
      setToastMsg("Không thể kích hoạt lộ trình này. Vui lòng thử lại!");
      setConfirmProgram(null);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => {
        setToastMsg("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const isLoading = isLoadingPrograms || (isLoggedIn && isLoadingActivePlan);

  return (
    <section className="w-full py-10 relative">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-24 right-4 z-[99999] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2 shadow-2xl animate-bounce">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmProgram && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-6 sm:p-8 w-full max-w-[440px] flex flex-col gap-5 shadow-2xl">
            <div className="flex items-center gap-3 text-primary">
              <Dumbbell className="w-6 h-6 animate-pulse" />
              <h3 className="font-black text-lg text-[var(--text-color)] m-0">
                {activePlan ? "Thay thế lộ trình" : "Bắt đầu lộ trình mới"}
              </h3>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0">
              {activePlan ? (
                <>
                  Bạn có chắc chắn muốn hủy lộ trình hiện tại và thay thế bằng lộ trình{" "}
                  <strong className="text-[var(--text-color)]">{confirmProgram.title}</strong> không? Lịch trình cũ của bạn sẽ bị hủy bỏ hoàn toàn.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn bắt đầu lộ trình{" "}
                  <strong className="text-[var(--text-color)]">{confirmProgram.title}</strong> không? Giáo án này sẽ được thiết lập vào lịch của bạn.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                onClick={() => setConfirmProgram(null)}
                disabled={isStarting}
                className="px-4 py-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] font-extrabold text-xs rounded-xl hover:border-primary/40 transition cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmStart}
                disabled={isStarting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-primary text-black font-extrabold text-xs rounded-xl hover:bg-primary-hover hover:scale-105 transition cursor-pointer border-0 disabled:opacity-70"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đồng ý"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 1. HIỂN THỊ LỘ TRÌNH ĐANG THAM GIA (NẾU CÓ) ═══ */}
      {activePlan && (
        <div className="mb-12 bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent border border-primary/20 rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden shadow-sm">
          {/* Decorative background circle */}
          <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Lộ trình tập hiện tại của bạn</span>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-color)] m-0 mt-1 tracking-tight">
                  {activePlan.title || "Lộ trình cá nhân"}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-md">
                  Bạn đang tham gia lộ trình này. Hãy kiên trì thực hiện các buổi tập đúng hạn để nhanh chóng đạt được thể trạng mong muốn.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={scrollToAlternatives}
                className="px-5 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-color)] font-extrabold text-xs rounded-xl hover:border-primary/40 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Đổi lộ trình khác
              </button>
              <button
                onClick={() => navigate(paths.myPlan)}
                className="flex items-center gap-1.5 px-6 py-3 bg-primary text-black font-extrabold text-xs rounded-xl shadow-lg shadow-primary/15 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-0"
              >
                Tiếp tục tập luyện
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 2. TIÊU ĐỀ SECTION ═══ */}
      <div 
        id={activePlan ? "alternative-plans-section" : undefined}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 scroll-mt-24"
      >
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-color)] tracking-tight m-0">
            {activePlan ? "Lộ trình thay thế đề xuất" : "Lộ trình gợi ý"}
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

      {/* ═══ 3. DANH SÁCH LỘ TRÌNH ═══ */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-72 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPrograms.map((program) => (
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
                  onClick={() => handleActionClick(program)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2.5 font-black text-xs rounded-xl transition-all duration-200 cursor-pointer border-0 ${
                    program.accent
                      ? "bg-primary text-black hover:bg-primary-hover shadow-md shadow-primary/15"
                      : "bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary/40"
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  {activePlan ? "Thay thế" : "Bắt đầu"}
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
