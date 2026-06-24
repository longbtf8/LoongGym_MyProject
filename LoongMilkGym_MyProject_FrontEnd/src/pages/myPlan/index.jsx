import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dumbbell, Activity, Check, Play, History, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import {
  useGetActivePlanQuery,
  useGetStatsQuery,
  useGetDayDetailsQuery,
  useUpdateDayDetailsMutation,
  useCompleteDayMutation,
  useSwapDaysDatesMutation
} from "@/services/roadmap/roadmapApi";
import { useGetSessionByPlanDayQuery as useGetSessionsByPlanDayQuery } from "@/services/workoutSession/workoutSessionApi";
import LoadingScreen from "@/components/LoadingScreen";

// Import modular components
import PlanSelector from "./components/PlanSelector";
import CalendarSlider from "./components/CalendarSlider";
import ExerciseList from "./components/ExerciseList";
import AnalysisSidebar from "./components/AnalysisSidebar";
import CancelModal from "./components/CancelModal";
import SwapModal from "./components/SwapModal";
import AIModal from "./components/AIModal";
import SchedulerModal from "./components/SchedulerModal";
import RestoreModal from "./components/RestoreModal";

const toSavedExercise = (exercise, index) => ({
  id: exercise.id || exercise.exerciseId,
  exerciseId: exercise.exerciseId,
  exerciseOrder: index + 1,
  sets: exercise.sets || 3,
  repsMin: exercise.repsMin || 8,
  repsMax: exercise.repsMax || 12,
  weightKg: exercise.weightKg || 0,
  restSeconds: exercise.restSeconds || 90,
  tempo: exercise.tempo || "2-0-1-0",
  note: exercise.note || "",
});

const getLocalDateString = (dateInput = new Date()) => {
  if (typeof dateInput === "string" && dateInput.includes("T")) {
    return dateInput.split("T")[0];
  }

  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameLocalDate = (dateInput, dateString) => {
  if (!dateInput || !dateString) return false;
  return getLocalDateString(dateInput) === dateString;
};

const getWorkoutDisplayTitle = (title = "Buổi tập") => {
  return title.replace(/^Ngày\s+\d+\s*:\s*/i, "").trim() || "Buổi tập";
};

export default function MyPlan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryDayId = searchParams.get("dayId");
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetIndex, setSwapTargetIndex] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "" });
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const [sessionNotes, setSessionNotes] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [todayStr, setTodayStr] = useState(() => getLocalDateString());

  const { data: activePlanRes, isLoading: isLoadingPlan, isError: isPlanError, refetch: refetchActivePlan } = useGetActivePlanQuery();
  const { data: statsRes } = useGetStatsQuery();

  const activePlan = isPlanError ? null : activePlanRes?.data;
  const stats = statsRes?.data || { totalWorkoutDays: 0, totalCaloriesBurned: 0 };
  const daysList = useMemo(() => activePlan?.days || [], [activePlan?.days]);

  const selectedIndex = daysList.findIndex(d => d.id === selectedDayId);
  const weekIdx = selectedIndex !== -1 ? Math.floor(selectedIndex / 7) : 0;

  const { data: dayDetailsRes, isLoading: isLoadingDetails, isFetching: isFetchingDetails } = useGetDayDetailsQuery(selectedDayId, {
    skip: !selectedDayId
  });
  const dayDetails = dayDetailsRes?.data;
  const exercises = dayDetails?.exercises || [];
  const selectedWorkoutTitle = getWorkoutDisplayTitle(dayDetails?.day?.title);

  const todayDay = daysList.find(d => isSameLocalDate(d.scheduledDate, todayStr));
  const isSelectedDayToday = isSameLocalDate(dayDetails?.day?.scheduledDate, todayStr);
  const isTodayCompleted = todayDay?.status === "completed";

  const [updateDayDetails, { isLoading: isUpdating }] = useUpdateDayDetailsMutation();
  const [completeDay, { isLoading: isCompleting }] = useCompleteDayMutation();
  const [swapDaysDates, { isLoading: isSwappingDates }] = useSwapDaysDatesMutation();

  const isPending = isLoadingDetails || isFetchingDetails || isUpdating || isCompleting || isSwappingDates;

  const handleRestoreOriginalExercises = async () => {
    if (isPending) return;
    const original = dayDetails?.day?.metadata?.originalExercises;
    if (!original || !Array.isArray(original) || original.length === 0) {
      showToast("Không tìm thấy dữ liệu bài tập gốc để khôi phục.");
      return;
    }

    try {
      await updateDayDetails({
        dayId: selectedDayId,
        data: {
          metadata: {
            customExercises: original,
            customized: false
          }
        }
      }).unwrap();
      setShowRestoreModal(false);
      showToast("Đã khôi phục danh sách bài tập gốc.");
    } catch {
      showToast("Không thể khôi phục danh sách bài tập.");
    }
  };

  // State quản lý việc sửa/lưu ghi chú
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // State quản lý việc thu gọn/mở rộng từng buổi tập trong lịch sử
  const [expandedSessionIds, setExpandedSessionIds] = useState({});

  const { data: completedSessionsRes } = useGetSessionsByPlanDayQuery(selectedDayId, {
    skip: !selectedDayId || !showHistory || dayDetails?.day?.status !== "completed"
  });
  const completedSessions = useMemo(() => {
    return [...(completedSessionsRes?.data || [])].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [completedSessionsRes?.data]);

  // Tự động mở rộng buổi tập duy nhất nếu danh sách chỉ có 1 buổi tập
  useEffect(() => {
    const syncToday = () => {
      const currentTodayStr = getLocalDateString();
      setTodayStr((previousTodayStr) => (
        previousTodayStr === currentTodayStr ? previousTodayStr : currentTodayStr
      ));
    };

    syncToday();
    const intervalId = window.setInterval(syncToday, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (completedSessions.length === 1) {
      const timer = setTimeout(() => {
        setExpandedSessionIds({ [completedSessions[0].id]: true });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [completedSessions]);

  useEffect(() => {
    if (daysList.length > 0) {
      const queryDayExists = queryDayId && daysList.some(d => d.id === queryDayId);
      const exists = daysList.some(d => d.id === selectedDayId);

      if (queryDayExists && selectedDayId !== queryDayId) {
        const timer = setTimeout(() => {
          setSelectedDayId(queryDayId);
          setSearchParams(prev => {
            const copy = new URLSearchParams(prev);
            copy.delete("dayId");
            return copy;
          }, { replace: true });
        }, 0);
        return () => clearTimeout(timer);
      } else if (!selectedDayId || !exists) {
        const todayDay = daysList.find(d => isSameLocalDate(d.scheduledDate, todayStr));
        const pendingDay = daysList.find(d => d.status === "pending");
        const targetDay = todayDay || pendingDay || daysList[0];
        const timer = setTimeout(() => {
          setSelectedDayId(targetDay.id);
        }, 0);
        return () => clearTimeout(timer);
      }
    } else {
      if (selectedDayId !== null) {
        const timer = setTimeout(() => {
          setSelectedDayId(null);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [daysList, selectedDayId, todayStr, queryDayId, setSearchParams]);

  useEffect(() => {
    if (dayDetails?.day) {
      const timer = setTimeout(() => {
        setSessionNotes(dayDetails.day.notes || "");
        setShowHistory(false);
        setIsEditingNotes(false);
        setExpandedSessionIds({});
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [dayDetails]);

  useEffect(() => {
    const handleAiPlanUpdated = () => {
      refetchActivePlan();
    };

    window.addEventListener("aiCoach:plan-updated", handleAiPlanUpdated);
    window.addEventListener("storage", handleAiPlanUpdated);

    return () => {
      window.removeEventListener("aiCoach:plan-updated", handleAiPlanUpdated);
      window.removeEventListener("storage", handleAiPlanUpdated);
    };
  }, [refetchActivePlan]);

  if (isLoadingPlan) {
    return <LoadingScreen message="Đang tải lộ trình tập luyện của bạn..." />;
  }

  const handlePlanSelectorSuccess = (message) => {
    showToast(message);
  };

  const handleSchedulerSuccess = (message) => {
    setSelectedProgramId(null);
    refetchActivePlan();
    showToast(message);
  };

  if (!activePlan) {
    return (
      <>
        <PlanSelector
          stats={stats}
          onOpenScheduler={setSelectedProgramId}
          onSuccess={handlePlanSelectorSuccess}
        />

        {selectedProgramId && (
          <SchedulerModal
            key={selectedProgramId}
            programId={selectedProgramId}
            onClose={() => setSelectedProgramId(null)}
            onSuccess={handleSchedulerSuccess}
          />
        )}

        {toast.show && (
          <div className="fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-primary/30 text-[var(--text-color)] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg animate-slide-down">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold leading-none">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  const weekDays = daysList.slice(weekIdx * 7, (weekIdx + 1) * 7);

  // handlePrevWeek: Chuyển slider lịch hiển thị sang tuần trước đó
  const handlePrevWeek = () => {
    if (weekIdx > 0) {
      const targetDay = daysList[(weekIdx - 1) * 7];
      setSelectedDayId(targetDay.id);
    }
  };

  // handleNextWeek: Chuyển slider lịch hiển thị sang tuần tiếp theo
  const handleNextWeek = () => {
    if ((weekIdx + 1) * 7 < daysList.length) {
      const targetDay = daysList[(weekIdx + 1) * 7];
      setSelectedDayId(targetDay.id);
    }
  };

  // handleUpdateExerciseList: Lưu danh sách bài tập (ví dụ sau khi sửa Sets/Reps/Weight trực tiếp)
  const handleUpdateExerciseList = async (updatedExercises) => {
    if (isPending) return;
    try {
      await updateDayDetails({
        dayId: selectedDayId,
        data: {
          metadata: {
            customExercises: updatedExercises,
            customized: true
          }
        }
      }).unwrap();
      showToast("Đã lưu thay đổi bài tập.");
    } catch {
      showToast("Lỗi khi lưu bài tập.");
    }
  };

  // handleRemoveExercise: Xóa một bài tập ra khỏi danh sách của ngày
  const handleRemoveExercise = async (exerciseIndex) => {
    if (isPending) return;
    const updatedExercises = exercises
      .filter((_, index) => index !== exerciseIndex)
      .map((ex, index) => toSavedExercise(ex, index));

    try {
      await updateDayDetails({
        dayId: selectedDayId,
        data: {
          metadata: {
            customExercises: updatedExercises,
            customized: true
          }
        }
      }).unwrap();
      showToast("Đã xoá bài tập khỏi ngày này.");
    } catch {
      showToast("Không thể xoá bài tập lúc này.");
    }
  };

  // openSwapModal: Mở modal để chọn bài tập thay thế hoặc thêm bài mới
  const openSwapModal = (index = null) => {
    if (isPending) return;
    setSwapTargetIndex(index);
    setShowSwapModal(true);
  };

  // handleSelectExercise: Thay thế bài tập tại vị trí chỉ định hoặc thêm bài tập mới vào cuối danh sách
  const handleSelectExercise = async (newExercise) => {
    if (isPending) return;
    const updatedExercises = swapTargetIndex !== null
      ? exercises.map((ex, index) => {
          if (index === swapTargetIndex) {
            return toSavedExercise({
              id: newExercise.id,
              exerciseId: newExercise.id,
              sets: 3,
              repsMin: 8,
              repsMax: 12,
              weightKg: 20,
              restSeconds: 90,
              note: "Bài tập thay thế"
            }, index);
          }
          return toSavedExercise(ex, index);
        })
      : [
          ...exercises.map((ex, index) => toSavedExercise(ex, index)),
          toSavedExercise({
            id: newExercise.id,
            exerciseId: newExercise.id,
            exerciseOrder: exercises.length + 1,
            sets: 3,
            repsMin: 8,
            repsMax: 12,
            weightKg: 20,
            restSeconds: 90,
            note: "Bài tập thêm mới"
          }, exercises.length)
        ];

    try {
      await updateDayDetails({
        dayId: selectedDayId,
        data: {
          metadata: {
            customExercises: updatedExercises,
            customized: true
          }
        }
      }).unwrap();
      setShowSwapModal(false);
      showToast(swapTargetIndex !== null ? "Thay thế bài tập thành công!" : "Thêm bài tập mới thành công!");
    } catch {
      showToast("Có lỗi xảy ra khi cập nhật bài tập.");
    }
  };

  // handleCompleteWorkout: Gửi yêu cầu hoàn tất buổi tập kèm theo ghi chú lên server
  const handleCompleteWorkout = async () => {
    try {
      await completeDay({
        dayId: selectedDayId,
        notes: sessionNotes
      }).unwrap();
      showToast("🎉 Hoàn tất buổi tập thành công!");
    } catch {
      showToast("Lỗi khi hoàn tất buổi tập.");
    }
  };

  // handleSwapToToday: Đưa nội dung buổi tập được chọn về hôm nay
  const handleSwapToToday = async () => {
    if (isPending) return;
    if (!selectedDayId || daysList.length === 0) return;

    if (!todayDay) {
      showToast("Không tìm thấy ngày tập của ngày hôm nay.");
      return;
    }

    if (selectedDayId === todayDay.id) {
      showToast("Ngày được chọn đã là ngày hôm nay rồi.");
      return;
    }

    if (isTodayCompleted) {
      try {
        const exercisesToCopy = exercises.map((ex, index) => toSavedExercise(ex, index));
        await updateDayDetails({
          dayId: todayDay.id,
          data: {
            title: selectedWorkoutTitle,
            metadata: { 
              customExercises: exercisesToCopy,
              customized: true
            },
          }
        }).unwrap();

        showToast("🔄 Đã thay thế bài tập hôm nay bằng buổi tập này. Chuẩn bị tập thêm!");
        navigate(`/today-workout?dayId=${todayDay.id}`);
      } catch {
        showToast("Lỗi khi thay thế bài tập hôm nay.");
      }
    } else {
      try {
        await swapDaysDates({
          dayId1: selectedDayId,
          dayId2: todayDay.id
        }).unwrap();
        showToast("🔄 Đã chuyển ngày tập thành công về hôm nay!");
        setSelectedDayId(todayDay.id);
      } catch {
        showToast("Lỗi khi hoán đổi ngày tập.");
      }
    }
  };

  // handleCancelPlanSuccess: Xử lý sau khi huỷ lộ trình thành công bên trong Modal
  const handleCancelPlanSuccess = (message) => {
    setSelectedDayId(null);
    setShowCancelModal(false);
    showToast(message);
  };

  return (
    <div className="w-full bg-[var(--bg-color)] text-[var(--text-color)] pt-0 pb-6 px-4 lg:py-6 flex justify-center transition-colors duration-300">
      <div className="max-w-[1000px] w-full flex flex-col gap-4">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-black text-center sm:text-left tracking-tight !m-0">Lộ trình & Tracker Thông minh</h1>
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isPending}
            className="self-center sm:self-auto px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            Huỷ lộ trình
          </button>
        </div>

        {/* Calendar Slider */}
        <CalendarSlider
          weekDays={weekDays}
          selectedDayId={selectedDayId}
          setSelectedDayId={setSelectedDayId}
          todayStr={todayStr}
          weekIdx={weekIdx}
          daysListLength={daysList.length}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_0.95fr] gap-4">

          {/* CỘT TRÁI (BÀI TẬP) */}
          <div>
            <div className="flex justify-between items-end mb-2.5">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-sm font-black flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  {selectedWorkoutTitle}
                </h2>
                <span className="text-[10px] text-[var(--text-muted)] pl-5.5">Dự kiến: 65 phút</span>
              </div>
              
              {activePlan?.programId && 
               Array.isArray(dayDetails?.day?.metadata?.originalExercises) &&
               dayDetails.day.metadata.originalExercises.length > 0 &&
               dayDetails?.day?.status !== "completed" && 
               dayDetails?.day?.metadata?.customized === true && (
                <button
                  onClick={() => setShowRestoreModal(true)}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  title="Khôi phục lại danh sách bài tập ban đầu của giáo án"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục lịch gốc</span>
                </button>
              )}
            </div>

            {dayDetails?.day?.status === "completed" && (
              <>
                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-xs font-extrabold flex items-center justify-between mb-3">
                  <span>🎉 Bạn đã hoàn thành buổi tập này!</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  {isSelectedDayToday ? (
                    <button
                      onClick={() => navigate(`/today-workout?dayId=${selectedDayId}`)}
                      className="h-11 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-[var(--border-color)] active:scale-[0.99] transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Tập thêm buổi này
                    </button>
                  ) : (
                    <button
                      onClick={handleSwapToToday}
                      disabled={isPending}
                      className="h-11 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-500/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      {isTodayCompleted
                        ? "Tập thêm buổi này hôm nay"
                        : "Tập buổi này hôm nay"}
                    </button>
                  )}

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="h-11 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    {showHistory ? "Ẩn lịch sử" : "Xem lịch sử"}
                    {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </>
            )}

            {dayDetails?.day?.status === "completed" && showHistory && (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 mb-3 flex flex-col gap-3.5">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                  <History className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-primary">
                    Lịch sử tập luyện ({completedSessions.length} buổi)
                  </h3>
                </div>

                {completedSessions.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {completedSessions.map((session, sIdx) => {
                      const isExpanded = !!expandedSessionIds[session.id];
                      const formattedDate = new Date(session.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      });

                      return (
                        <div key={session.id} className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-color)] overflow-hidden">
                          {/* Session Header Card */}
                          <div
                            onClick={() => {
                              setExpandedSessionIds(prev => ({
                                ...prev,
                                [session.id]: !prev[session.id]
                              }));
                            }}
                            className="p-3 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)]/50 transition-colors"
                          >
	                            <div className="flex flex-col gap-1">
	                              <span className="text-xs font-black text-[var(--text-color)]">
	                                Lần {sIdx + 1} - {formattedDate}
	                              </span>
                              <div className="flex items-center gap-3 text-[10px] text-[var(--text-muted)]">
                                <span>Thời lượng: {session.durationSeconds ? `${Math.round(session.durationSeconds / 60)} phút` : "N/A"}</span>
                                <span>•</span>
                                <span>RPE: {session.perceivedEffort ? `${session.perceivedEffort}/10` : "Chưa đánh giá"}</span>
                              </div>
                            </div>

                            {completedSessions.length > 1 && (
                              <div className="p-1 border-0 bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)] text-[10px] font-bold flex items-center gap-1">
                                {isExpanded ? "Ẩn" : "Xem chi tiết"}
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </div>
                            )}
                          </div>

                          {/* Session Expanded Details */}
                          {isExpanded && (
                            <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/20 flex flex-col gap-3">
                              {session.notes && (
                                <div className="bg-[var(--bg-color)] p-2.5 rounded-xl border border-[var(--border-color)] text-xs">
                                  <span className="text-[10px] text-[var(--text-muted)] block mb-0.5">Ghi chú buổi tập:</span>
                                  <p className="m-0 italic text-[var(--text-color)]">{session.notes}</p>
                                </div>
                              )}

                              <div className="flex flex-col gap-2.5">
                                {session.exercises?.map((se, idx) => (
                                  <div key={se.id} className="bg-[var(--bg-color)] p-2.5 rounded-xl border border-[var(--border-color)] flex flex-col gap-1.5">
                                    <span className="text-xs font-black block text-primary">{idx + 1}. {se.exercise?.name || "Bài tập"}</span>
                                    {se.sets && se.sets.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {se.sets.map((set, setIdx) => (
                                          <div key={set.id} className="flex items-center justify-between text-[11px] text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-1 rounded">
                                            <span>Set {setIdx + 1} ({set.setType === "warmup" ? "Khởi động" : set.setType === "drop" ? "Dropset" : "Set chính"})</span>
                                            <span className="font-semibold text-[var(--text-color)]">
                                              {set.weightKg} kg × {set.reps} reps {set.rpe ? `(RPE: ${set.rpe})` : ""}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-[var(--text-muted)] italic">Không có set tập nào được ghi nhận.</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-[var(--text-muted)]">
                    Đang tải thông tin lịch sử tập...
                  </div>
                )}
              </div>
            )}

            {dayDetails?.day?.status !== "completed" && dayDetails?.day?.status !== "rest" && dayDetails?.day && (
              <>
                {isSelectedDayToday ? (
                  <button
                    onClick={() => navigate(`/today-workout?dayId=${selectedDayId}`)}
                    className="w-full h-11 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-md shadow-primary/5 mb-3 border-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Bắt đầu buổi tập hôm nay (Theo dõi Set & Reps)
                  </button>
                ) : (
                  <button
                    onClick={handleSwapToToday}
                    disabled={isPending}
                    className="w-full h-11 bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-emerald-600 active:scale-[0.99] transition cursor-pointer shadow-md shadow-emerald-500/15 mb-3 border-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {isTodayCompleted
                      ? "Tập thêm buổi này hôm nay (Thay thế bài tập hôm nay)"
                      : "Tập buổi này hôm nay (Thay thế buổi tập hiện tại)"}
                  </button>
                )}
              </>
            )}

            <ExerciseList
              dayDetails={dayDetails}
              exercises={exercises}
              isLoadingDetails={isLoadingDetails}
              isPending={isPending}
              onOpenSwapModal={openSwapModal}
              onRemoveExercise={handleRemoveExercise}
              onUpdateExerciseList={handleUpdateExerciseList}
              onShowAIModal={() => setShowAIModal(true)}
            />
          </div>

          {/* CỘT PHẢI (SIDEBAR PHÂN TÍCH) */}
          <AnalysisSidebar
            stats={stats}
            dayDetails={dayDetails}
            weekDays={weekDays}
            selectedDayId={selectedDayId}
            exercises={exercises}
            isCompleting={isCompleting}
            isPending={isPending}
            onCompleteWorkout={handleCompleteWorkout}
            showToast={showToast}
          />
        </div>

        {/* Ghi chú buổi tập */}
        {dayDetails?.day?.status !== "rest" && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary" />
                Ghi chú buổi tập (Session Notes)
              </span>
              {isEditingNotes ? (
                <button
                  onClick={async () => {
                    try {
                      await updateDayDetails({
                        dayId: selectedDayId,
                        data: { notes: sessionNotes }
                      }).unwrap();
                      setIsEditingNotes(false);
                      showToast("📝 Đã lưu ghi chú thành công!");
                    } catch {
                      showToast("Lỗi khi lưu ghi chú.");
                    }
                  }}
                  className="px-3.5 py-1.5 bg-primary text-black rounded-xl text-[10px] font-black hover:bg-primary-hover transition border-0 cursor-pointer shadow-sm shadow-primary/5"
                >
                  Lưu ghi chú
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  disabled={isPending}
                  className="px-3.5 py-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary hover:text-primary rounded-xl text-[10px] font-black transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                >
                  {dayDetails?.day?.notes ? "Sửa ghi chú" : "Thêm ghi chú"}
                </button>
              )}
            </div>
            <textarea
              rows={3}
              placeholder={isEditingNotes ? "Ghi lại cảm nhận, chấn thương hoặc lưu ý cho buổi tập này..." : "Không có ghi chú nào cho buổi tập này. Click để thêm..."}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              readOnly={!isEditingNotes || isPending}
              onClick={() => {
                if (!isEditingNotes && !isPending) {
                  setIsEditingNotes(true);
                }
              }}
              className={`w-full border rounded-xl p-2 text-xs text-[var(--text-color)] outline-none resize-none transition-all duration-200 ${
                isEditingNotes
                  ? "bg-[var(--bg-color)] border-primary focus:border-primary"
                  : "bg-[var(--bg-color)]/30 border-[var(--border-color)] cursor-pointer hover:border-primary/50 opacity-80"
              }`}
            />
          </div>
        )}

      </div>

      {toast.show && (
        <div className="fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] bg-[var(--bg-secondary)]/90 backdrop-blur-sm border border-primary/30 text-[var(--text-color)] rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-lg animate-slide-down">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}

      {/* MODAL HUỶ LỘ TRÌNH */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSuccess={handleCancelPlanSuccess}
      />

      {/* MODAL KHÔI PHỤC LỊCH */}
      <RestoreModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        onConfirm={handleRestoreOriginalExercises}
        isPending={isPending}
      />

      {/* Modal AI Form Analysis */}
      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onDemoClick={() => {
          setShowAIModal(false);
          showToast("🚀 Tính năng đang được phát triển nâng cao!");
        }}
      />

      {/* Modal Swap */}
      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        swapTargetIndex={swapTargetIndex}
        dayDetails={dayDetails}
        onSelectExercise={handleSelectExercise}
        isPending={isPending}
      />
    </div>
  );
}
