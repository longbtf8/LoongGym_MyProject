import { useState } from "react";
import { Dumbbell, CalendarDays, Target } from "lucide-react";
import { useGetWorkoutProgramsQuery, useStartCustomPlanMutation } from "@/services/roadmap/roadmapApi";

// getProgramFrequency: Phân tích slug của giáo án để xác định số buổi tập mặc định trong một chu kỳ
const getProgramFrequency = (slug) => {
  if (!slug) return { vi: "Chu kỳ linh hoạt" };
  const s = slug.toLowerCase();
  if (s.includes("ppl") || s.includes("legs")) return { vi: "6 buổi mỗi chu kỳ" };
  if (s.includes("upper") || s.includes("lower")) return { vi: "4 buổi mỗi chu kỳ" };
  if (s.includes("fullbody") || s.includes("full-body")) return { vi: "3 buổi mỗi chu kỳ" };
  if (s.includes("bro-split") || s.includes("bro")) return { vi: "5 buổi mỗi chu kỳ" };
  return { vi: "Chu kỳ linh hoạt" };
};

// PlanSelector: Component hiển thị danh sách các lộ trình có sẵn và tuỳ chọn tự tạo lộ trình
export default function PlanSelector({
  stats,
  onOpenScheduler,
  onSuccess
}) {
  const { data: programsRes, isLoading: isLoadingPrograms } = useGetWorkoutProgramsQuery({ limit: 20 });
  const programs = programsRes?.data?.data || [];

  const [customPlanTitle, setCustomPlanTitle] = useState("Lộ trình tự chọn của tôi");
  const [startCustomPlan, { isLoading: isStartingCustom }] = useStartCustomPlanMutation();

  // handleStartCustomPlan: Gửi yêu cầu khởi tạo lộ trình tự chọn với tiêu đề tuỳ ý của người dùng
  const handleStartCustomPlan = async () => {
    try {
      await startCustomPlan({ title: customPlanTitle }).unwrap();
      onSuccess("Đã tạo lộ trình tự chọn.");
    } catch {
      onSuccess("Không thể tạo lộ trình tự chọn.");
    }
  };
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="border-b border-[var(--border-color)] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Chọn lộ trình tập luyện</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
              Bắt đầu bằng giáo án có sẵn hoặc tự xây lịch riêng rồi thêm bài theo từng ngày.
            </p>
          </div>
          <div className="flex gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-3 self-start md:self-auto min-w-[260px] shadow-sm">
            <div className="flex-1 text-center border-r border-[var(--border-color)] pr-3">
              <div className="text-[9px] text-[var(--text-muted)] font-black uppercase">Số buổi đã tập</div>
              <div className="text-base font-black text-primary mt-0.5">{stats.totalWorkoutDays} ngày</div>
            </div>
            <div className="flex-1 text-center pl-3">
              <div className="text-[9px] text-[var(--text-muted)] font-black uppercase">Lượng Calo đã đốt</div>
              <div className="text-base font-black text-primary mt-0.5">{stats.totalCaloriesBurned} kcal</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-5 items-start">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Lộ trình có sẵn
              </h2>
              {isLoadingPrograms && <span className="text-xs text-[var(--text-muted)]">Đang tải...</span>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {programs.map((program) => (
                <div key={program.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col">
                  <div className="aspect-[16/8] bg-[var(--bg-color)] overflow-hidden">
                    {program.coverImageUrl ? (
                      <img src={program.coverImageUrl} alt={program.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                        <Dumbbell className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-extrabold text-base line-clamp-1">{program.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                        {program.description || "Giáo án tập luyện được thiết kế sẵn theo chu kỳ."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      <span className="px-2 py-1 rounded-md bg-[var(--bg-color)] border border-[var(--border-color)] text-primary">
                        {getProgramFrequency(program.slug).vi}
                      </span>
                    </div>
                    <button
                      onClick={() => onOpenScheduler(program.id)}
                      className="mt-auto h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover cursor-pointer"
                    >
                      Bắt đầu lộ trình
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">Tự lên lộ trình riêng</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Tạo lịch rỗng trước, sau đó chọn từng ngày và thêm bài. Nên bắt đầu 3-5 bài mỗi buổi, ưu tiên bài chính trước bài phụ.
              </p>
            </div>
            <input
              value={customPlanTitle}
              onChange={(e) => setCustomPlanTitle(e.target.value)}
              className="h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] px-3 text-sm outline-none focus:border-primary text-[var(--text-color)]"
              placeholder="Tên lộ trình"
            />
            <label className="text-xs font-bold text-[var(--text-muted)]">
              Hệ thống sẽ tạo trước 30 ngày đầu và tự nối thêm khi gần hết lịch.
            </label>
            <button
              onClick={handleStartCustomPlan}
              disabled={isStartingCustom}
              className="h-11 rounded-xl bg-[var(--bg-color)] border border-primary/40 text-primary text-sm font-black hover:bg-primary hover:text-black disabled:opacity-60 cursor-pointer transition-all"
            >
              {isStartingCustom ? "Đang tạo..." : "Tạo lộ trình tự chọn"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
