import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Coffee,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import {
  useGetCurrentPlanQuery,
  useGetStatsQuery,
  useGetWorkoutProgramsQuery,
  useStartTrainingPlanMutation,
  useGetTrainingPlanDaysQuery,
  useUpdateTrainingPlanDayStatusMutation,
  useCancelActivePlanMutation,
} from "@/services/roadmap/roadmapApi";
import LoadingScreen from "@/components/LoadingScreen";
import paths from "@/config/path";
import SchedulerModal from "../roadmap/components/SchedulerModal";

// Helper to get start and end of a week (Monday to Sunday) based on offset in weeks from current week
const getWeekRange = (weekOffset = 0) => {
  const current = new Date();
  // Adjust to the week offset
  current.setDate(current.getDate() + weekOffset * 7);
  
  const day = current.getDay();
  // Adjust if Sunday (0) to get Monday as first day
  const diff = current.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(current.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Format dates as YYYY-MM-DD in local time
  const formatLocal = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const date = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`;
  };

  return {
    from: formatLocal(monday),
    to: formatLocal(sunday),
    monday,
  };
};

export default function MyPlan() {
  const navigate = useNavigate();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [customTitle, setCustomTitle] = useState("Lộ trình tự tập");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const { from, to } = getWeekRange(weekOffset);

  // Queries & Mutations
  const { data: currentPlanRes, isLoading: isLoadingPlan } = useGetCurrentPlanQuery();
  const { data: statsRes } = useGetStatsQuery();
  const { data: programsRes, isLoading: isLoadingPrograms } = useGetWorkoutProgramsQuery({ limit: 6 });
  const { data: daysRes, isLoading: isLoadingDays } = useGetTrainingPlanDaysQuery({ from, to }, {
    skip: !currentPlanRes?.data,
  });

  const [startTrainingPlan, { isLoading: isStartingCustom }] = useStartTrainingPlanMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateTrainingPlanDayStatusMutation();
  const [cancelActivePlan, { isLoading: isCancelling }] = useCancelActivePlanMutation();

  const activePlan = currentPlanRes?.data;
  const stats = statsRes?.data || { totalWorkoutDays: 0, totalCaloriesBurned: 0 };
  const programs = programsRes?.data?.data || [];
  const daysList = daysRes?.data || [];

  const todayStr = new Date().toISOString().split("T")[0];

  // Set default selected day
  useEffect(() => {
    if (daysList.length > 0) {
      const todayDay = daysList.find((d) => d.scheduledDate.startsWith(todayStr));
      const pendingDay = daysList.find((d) => d.status === "pending");
      const targetDay = todayDay || pendingDay || daysList[0];
      
      // Only set selected day initially or if current selected day is not in current list
      const exists = daysList.some((d) => d.id === selectedDay?.id);
      if (!selectedDay || !exists) {
        setSelectedDay(targetDay);
      } else {
        // Keep the latest updated state of selected day
        const updated = daysList.find((d) => d.id === selectedDay.id);
        if (updated) setSelectedDay(updated);
      }
    }
  }, [daysList]);

  if (isLoadingPlan) {
    return <LoadingScreen message="Đang tải lộ trình tập luyện của bạn..." />;
  }

  // Handle starting custom training plan
  const handleStartCustom = async () => {
    try {
      await startTrainingPlan({ title: customTitle }).unwrap();
      showToast("Khởi tạo lộ trình tập luyện tự chọn thành công!");
    } catch (error) {
      showToast(error?.data?.message || "Không thể tạo lộ trình tự chọn.", "error");
    }
  };

  // Handle program scheduler modal success
  const handleSchedulerSuccess = (message) => {
    setSelectedProgramId(null);
    showToast(message);
  };

  // Cancel active plan
  const handleCancelPlan = async () => {
    if (window.confirm("Bạn có chắc chắn muốn huỷ lộ trình tập luyện hiện tại không? Mọi dữ liệu lịch sẽ bị xoá.")) {
      try {
        await cancelActivePlan().unwrap();
        setSelectedDay(null);
        setWeekOffset(0);
        showToast("Đã huỷ lộ trình tập luyện.");
      } catch (error) {
        showToast("Không thể huỷ lộ trình lúc này.", "error");
      }
    }
  };

  // Update status of training plan day
  const handleUpdateStatus = async (dayId, status, skipReason = null) => {
    try {
      await updateStatus({
        id: dayId,
        data: { status, skipReason },
      }).unwrap();
      showToast(`Cập nhật trạng thái ngày tập thành công!`);
    } catch (error) {
      showToast(error?.data?.message || "Không thể cập nhật trạng thái.", "error");
    }
  };

  // Show program selector if there is no active plan
  if (!activePlan) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="border-b border-[var(--border-color)] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Kế hoạch tập luyện cá nhân</h1>
              <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
                Bắt đầu bằng cách lựa chọn một giáo án có sẵn hoặc tự lập lịch cá nhân hóa.
              </p>
            </div>
            
            <div className="flex gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm self-start md:self-auto min-w-[260px]">
              <div className="flex-1 text-center border-r border-[var(--border-color)] pr-4">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Đã hoàn thành</span>
                <div className="text-xl font-black text-primary mt-1">{stats.totalWorkoutDays} buổi</div>
              </div>
              <div className="flex-1 text-center pl-4">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Năng lượng tiêu thụ</span>
                <div className="text-xl font-black text-primary mt-1">{stats.totalCaloriesBurned} kcal</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-6 items-start">
            <section className="flex flex-col gap-4">
              <h2 className="text-base font-extrabold uppercase tracking-widest flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                Giáo án gợi ý
              </h2>
              {isLoadingPrograms ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {programs.map((program) => (
                    <div key={program.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-300 shadow-sm">
                      <div className="aspect-[16/9] bg-[var(--bg-color)] relative overflow-hidden group">
                        {program.coverImageUrl ? (
                          <img src={program.coverImageUrl} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-secondary)]">
                            <Dumbbell className="w-10 h-10 text-[var(--text-muted)]/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                          <span className="px-2.5 py-1 rounded-lg bg-primary text-black font-extrabold text-[10px] uppercase tracking-wide">
                            {program.difficulty || "Phổ thông"}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div>
                          <h3 className="font-extrabold text-base line-clamp-1">{program.title}</h3>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                            {program.description || "Lộ trình chi tiết giúp tối ưu hóa kết quả thể chất."}
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedProgramId(program.id)}
                          className="mt-auto w-full h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] cursor-pointer transition-all duration-200"
                        >
                          Bắt đầu giáo án này
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Tự lên lịch riêng</h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  Tạo lịch rỗng trước, sau đó tự do thêm bài tập yêu thích cho từng ngày theo sở thích của bạn.
                </p>
              </div>
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] px-3.5 text-xs outline-none focus:border-primary text-[var(--text-color)] w-full transition-all"
                placeholder="Tên lộ trình của bạn..."
              />
              <span className="text-[10px] text-[var(--text-muted)]">
                Lịch tự động tạo trước 30 ngày và sẽ tự cuốn chiếu khi gần hết.
              </span>
              <button
                onClick={handleStartCustom}
                disabled={isStartingCustom}
                className="h-10 w-full rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isStartingCustom ? "Đang xử lý..." : "Khởi tạo lộ trình tự chọn"}
              </button>
            </aside>
          </div>

          <SchedulerModal
            programId={selectedProgramId}
            onClose={() => setSelectedProgramId(null)}
            onSuccess={handleSchedulerSuccess}
          />

          {toast.show && (
            <div className={`fixed bottom-6 right-6 z-[160] border rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-slide-down ${
              toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[var(--bg-secondary)] border-primary/30 text-[var(--text-color)]"
            }`}>
              {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-primary" />}
              <span className="text-xs font-bold">{toast.message}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active plan UI with 7-day calendar
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full flex justify-center">
      <div className="max-w-[1000px] w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">Lịch trình cá nhân</span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">{activePlan.title}</h1>
          </div>
          <button
            onClick={handleCancelPlan}
            disabled={isCancelling}
            className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer self-start sm:self-auto"
          >
            {isCancelling ? "Đang huỷ..." : "Huỷ lộ trình hiện tại"}
          </button>
        </div>

        {/* 7-Day Calendar Slider */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black tracking-wide uppercase text-[var(--text-muted)] flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-primary" />
              Lịch tuần này
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWeekOffset((prev) => prev - 1)}
                className="w-7 h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center hover:border-primary transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold">
                Tuần {weekOffset === 0 ? "này" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
              </span>
              <button
                onClick={() => setWeekOffset((prev) => prev + 1)}
                className="w-7 h-7 rounded-lg border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-color)] flex items-center justify-center hover:border-primary transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isLoadingDays ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : daysList.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--text-muted)] font-bold">
              Không có dữ liệu lịch cho khoảng thời gian này.
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {daysList.map((day, index) => {
                const dateObj = new Date(day.scheduledDate);
                const isSelected = selectedDay?.id === day.id;
                const isToday = day.scheduledDate.split("T")[0] === todayStr;
                const weekdayLabel = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"][index] || "Day";

                // Determine badge color based on status
                let statusBadge = null;
                if (day.status === "completed") {
                  statusBadge = <CheckCircle2 className="w-3 h-3 text-green-500" />;
                } else if (day.status === "skipped") {
                  statusBadge = <XCircle className="w-3 h-3 text-rose-500" />;
                } else if (day.status === "rest") {
                  statusBadge = <Coffee className="w-3 h-3 text-amber-500" />;
                }

                return (
                  <div
                    key={day.id}
                    onClick={() => setSelectedDay(day)}
                    className={`flex flex-col items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all min-h-[75px] relative ${
                      isSelected
                        ? "bg-primary text-black border-primary font-black shadow-md shadow-primary/10"
                        : isToday
                        ? "bg-[var(--bg-color)] border-primary/50 text-[var(--text-color)]"
                        : "bg-[var(--bg-color)] border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold opacity-75">{weekdayLabel}</span>
                    <span className="text-sm font-extrabold">{dateObj.getDate()}</span>
                    {isToday && (
                      <span className={`text-[8px] font-bold ${isSelected ? "text-black" : "text-primary"}`}>
                        Hôm nay
                      </span>
                    )}
                    <div className="mt-1 h-3 flex items-center justify-center">
                      {statusBadge}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Details Panel */}
        {selectedDay && (
          <div className="grid md:grid-cols-[1.5fr_0.9fr] gap-6">
            
            {/* Exercises list */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight">{selectedDay.title}</h2>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">
                    {new Date(selectedDay.scheduledDate).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                
                {/* Status indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Trạng thái:</span>
                  <span className={`text-[10px] font-extrabold uppercase ${
                    selectedDay.status === "completed"
                      ? "text-green-500"
                      : selectedDay.status === "skipped"
                      ? "text-rose-500"
                      : selectedDay.status === "rest"
                      ? "text-amber-500"
                      : "text-blue-400"
                  }`}>
                    {selectedDay.status === "completed"
                      ? "Đã tập"
                      : selectedDay.status === "skipped"
                      ? "Đã qua"
                      : selectedDay.status === "rest"
                      ? "Nghỉ"
                      : "Chờ tập"}
                  </span>
                </div>
              </div>

              {/* Day notes */}
              {selectedDay.notes && (
                <div className="p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)]">
                  <span className="font-bold text-[var(--text-color)]">Ghi chú:</span> {selectedDay.notes}
                </div>
              )}

              {/* Main Action - Start Workout */}
              {selectedDay.status !== "rest" && (
                <button
                  onClick={() => navigate(`/today-workout?dayId=${selectedDay.id}`)}
                  className="w-full h-11 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-md shadow-primary/5"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  Bắt đầu buổi tập ngay
                </button>
              )}

              {/* Mini instructions */}
              <div className="mt-2">
                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                  Danh sách bài tập dự kiến
                </span>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Nhấp vào nút "Bắt đầu buổi tập ngay" ở trên để vào màn hình tập luyện chi tiết, ghi nhận kết quả các set tập trực tiếp.
                </p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl shadow-sm flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">Cập nhật nhanh trạng thái</h3>
              
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => handleUpdateStatus(selectedDay.id, "pending")}
                  disabled={isUpdatingStatus}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-bold flex items-center justify-center gap-2 hover:border-blue-400 text-[var(--text-color)] cursor-pointer disabled:opacity-50 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt lại Chờ tập (Pending)
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedDay.id, "rest")}
                  disabled={isUpdatingStatus}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-bold flex items-center justify-center gap-2 hover:border-amber-400 text-[var(--text-color)] cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Chuyển thành Ngày nghỉ (Rest)
                </button>

                <button
                  onClick={() => {
                    const reason = window.prompt("Nhập lý do bỏ qua ngày tập (không bắt buộc):");
                    if (reason !== null) {
                      handleUpdateStatus(selectedDay.id, "skipped", reason);
                    }
                  }}
                  disabled={isUpdatingStatus}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-bold flex items-center justify-center gap-2 hover:border-rose-400 text-[var(--text-color)] cursor-pointer disabled:opacity-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Đánh dấu Bỏ qua (Skipped)
                </button>

                <button
                  onClick={() => handleUpdateStatus(selectedDay.id, "completed")}
                  disabled={isUpdatingStatus}
                  className="w-full h-10 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-bold flex items-center justify-center gap-2 hover:border-green-400 text-[var(--text-color)] cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  Đánh dấu Hoàn thành (Completed)
                </button>
              </div>
            </div>

          </div>
        )}

        {toast.show && (
          <div className={`fixed bottom-6 right-6 z-[160] border rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-slide-down ${
            toast.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-[var(--bg-secondary)] border-primary/30 text-[var(--text-color)]"
          }`}>
            {toast.type === "error" ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-primary" />}
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
