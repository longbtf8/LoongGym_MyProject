import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Activity, Check, Play } from "lucide-react";
import { 
  useGetActivePlanQuery, 
  useGetStatsQuery,
  useGetDayDetailsQuery, 
  useUpdateDayDetailsMutation, 
  useCompleteDayMutation 
} from "@/services/roadmap/roadmapApi";
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

export default function MyPlan() {
  const navigate = useNavigate();
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapTargetIndex, setSwapTargetIndex] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [toast, setToast] = useState({ show: false, message: "" });
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const [sessionNotes, setSessionNotes] = useState("");

  const { data: activePlanRes, isLoading: isLoadingPlan, isError: isPlanError } = useGetActivePlanQuery();
  const { data: statsRes } = useGetStatsQuery();

  const activePlan = isPlanError ? null : activePlanRes?.data;
  const stats = statsRes?.data || { totalWorkoutDays: 0, totalCaloriesBurned: 0 };
  const daysList = activePlan?.days || [];

  const selectedIndex = daysList.findIndex(d => d.id === selectedDayId);
  const weekIdx = selectedIndex !== -1 ? Math.floor(selectedIndex / 7) : 0;
  
  const { data: dayDetailsRes, isLoading: isLoadingDetails } = useGetDayDetailsQuery(selectedDayId, {
    skip: !selectedDayId
  });
  const dayDetails = dayDetailsRes?.data;
  const exercises = dayDetails?.exercises || [];

  const [updateDayDetails] = useUpdateDayDetailsMutation();
  const [completeDay, { isLoading: isCompleting }] = useCompleteDayMutation();

  useEffect(() => {
    if (daysList.length > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayDay = daysList.find(d => d.scheduledDate.startsWith(todayStr));
      const pendingDay = daysList.find(d => d.status === "pending");
      const targetDay = todayDay || pendingDay || daysList[0];
      
      const exists = daysList.some(d => d.id === selectedDayId);
      if (!selectedDayId || !exists) {
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
  }, [daysList, selectedDayId, setSelectedDayId]);

  useEffect(() => {
    if (dayDetails?.day) {
      const timer = setTimeout(() => {
        setSessionNotes(dayDetails.day.notes || "");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [dayDetails]);

  if (isLoadingPlan) {
    return <LoadingScreen message="Đang tải lộ trình tập luyện của bạn..." />;
  }

  const handlePlanSelectorSuccess = (message) => {
    showToast(message);
  };

  const handleSchedulerSuccess = (message) => {
    setSelectedProgramId(null);
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

        <SchedulerModal
          programId={selectedProgramId}
          onClose={() => setSelectedProgramId(null)}
          onSuccess={handleSchedulerSuccess}
        />

        {toast.show && (
          <div className="fixed top-24 right-4 z-[160] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2 shadow-2xl animate-slide-down">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  const weekDays = daysList.slice(weekIdx * 7, (weekIdx + 1) * 7);
  const todayStr = new Date().toISOString().split("T")[0];

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
    try {
      await updateDayDetails({
        dayId: selectedDayId,
        data: { metadata: { customExercises: updatedExercises } }
      }).unwrap();
      showToast("Đã lưu thay đổi bài tập.");
    } catch {
      showToast("Lỗi khi lưu bài tập.");
    }
  };

  // handleRemoveExercise: Xóa một bài tập ra khỏi danh sách của ngày
  const handleRemoveExercise = async (exerciseIndex) => {
    const updatedExercises = exercises
      .filter((_, index) => index !== exerciseIndex)
      .map((ex, index) => toSavedExercise(ex, index));

    try {
      await updateDayDetails({
        dayId: selectedDayId,
        data: { metadata: { customExercises: updatedExercises } }
      }).unwrap();
      showToast("Đã xoá bài tập khỏi ngày này.");
    } catch {
      showToast("Không thể xoá bài tập lúc này.");
    }
  };

  // openSwapModal: Mở modal để chọn bài tập thay thế hoặc thêm bài mới
  const openSwapModal = (index = null) => {
    setSwapTargetIndex(index);
    setShowSwapModal(true);
  };

  // handleSelectExercise: Thay thế bài tập tại vị trí chỉ định hoặc thêm bài tập mới vào cuối danh sách
  const handleSelectExercise = async (newExercise) => {
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
        data: { metadata: { customExercises: updatedExercises } }
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

  // handleCancelPlanSuccess: Xử lý sau khi huỷ lộ trình thành công bên trong Modal
  const handleCancelPlanSuccess = (message) => {
    setSelectedDayId(null);
    setShowCancelModal(false);
    showToast(message);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-6 px-4 flex justify-center transition-colors duration-300 w-full">
      <div className="max-w-[1000px] w-full flex flex-col gap-4">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl font-black text-center sm:text-left tracking-tight !m-0">Lộ trình & Tracker Thông minh</h1>
          <button
            onClick={() => setShowCancelModal(true)}
            className="self-center sm:self-auto px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-black transition cursor-pointer"
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
            <div className="flex justify-between items-center mb-2.5">
              <h2 className="text-sm font-black flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-primary" />
                {dayDetails?.day?.title || "Buổi tập"}
              </h2>
              <span className="text-[10px] text-[var(--text-muted)]">Dự kiến: 65 phút</span>
            </div>

            {dayDetails?.day?.status !== "rest" && dayDetails?.day && (
              <button
                onClick={() => navigate(`/today-workout?dayId=${selectedDayId}`)}
                className="w-full h-11 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-md shadow-primary/5 mb-3 border-0"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Bắt đầu buổi tập hôm nay (Theo dõi Set & Reps)
              </button>
            )}

            <ExerciseList
              dayDetails={dayDetails}
              exercises={exercises}
              isLoadingDetails={isLoadingDetails}
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
            onCompleteWorkout={handleCompleteWorkout}
            showToast={showToast}
          />
        </div>

        {/* Session Notes */}
        {dayDetails?.day?.status !== "rest" && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-3">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Session Notes
            </span>
            <textarea
              rows={3}
              placeholder="Ghi lại cảm nhận buổi tập..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-2 text-xs text-[var(--text-color)] outline-none resize-none"
            />
          </div>
        )}

      </div>

      {toast.show && (
        <div className="fixed top-24 right-4 z-[160] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2 shadow-2xl animate-slide-down">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* MODAL HUỶ LỘ TRÌNH */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSuccess={handleCancelPlanSuccess}
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
      />
    </div>
  );
}
