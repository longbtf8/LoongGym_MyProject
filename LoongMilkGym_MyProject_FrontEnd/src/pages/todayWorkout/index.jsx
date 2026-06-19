import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Check } from "lucide-react";
import {
  roadmapApi,
  useGetCurrentPlanQuery,
  useGetDayDetailsQuery,
} from "@/services/roadmap/roadmapApi";
import {
  useStartSessionMutation,
  useGetSessionQuery,
  useAddSetMutation,
  useUpdateSetMutation,
  useCompleteSessionMutation,
} from "@/services/workoutSession/workoutSessionApi";
import LoadingScreen from "@/components/LoadingScreen";
import paths from "@/config/path";

// Subcomponents
import WorkoutOverview from "./components/WorkoutOverview";
import WorkoutTracker from "./components/WorkoutTracker";
import CompleteWorkoutModal from "./components/CompleteWorkoutModal";
import VideoGuideModal from "./components/VideoGuideModal";

const getLocalDateString = (dateInput = new Date()) => {
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

export default function TodayWorkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const paramDayId = searchParams.get("dayId");

  const [activeSessionId, setActiveSessionId] = useState(
    localStorage.getItem("active_workout_session_id") || null
  );

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [guideExercise, setGuideExercise] = useState(null);
  const [perceivedEffort, setPerceivedEffort] = useState(7);
  const [sessionNotes, setSessionNotes] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [openRpeDropdownSetId, setOpenRpeDropdownSetId] = useState(null);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Get current plan & selected day ID
  const { data: currentPlanRes, isLoading: isLoadingPlan } = useGetCurrentPlanQuery();
  const activePlan = currentPlanRes?.data;
  const planDays = activePlan?.days;
  const todayStr = getLocalDateString();

  // Fallback to today's day if no dayId in URL
  const resolvedDayId = useMemo(() => {
    if (paramDayId) return paramDayId;
    if (!planDays) return null;

    const todayDay = planDays.find((d) => isSameLocalDate(d.scheduledDate, todayStr));
    const pendingDay = planDays.find((d) => d.status === "pending");
    const targetDay = todayDay || pendingDay || planDays[0];
    return targetDay?.id || null;
  }, [paramDayId, planDays, todayStr]);

  // Queries for day details and active session
  const { data: dayDetailsRes, isLoading: isLoadingDay } = useGetDayDetailsQuery(resolvedDayId, {
    skip: !resolvedDayId,
  });
  const dayDetails = dayDetailsRes?.data;

  const { data: sessionRes, isLoading: isLoadingSession, error: sessionError } = useGetSessionQuery(
    activeSessionId,
    { skip: !activeSessionId }
  );
  const activeSession = sessionRes?.data;

  // Mutations
  const [startSession] = useStartSessionMutation();
  const [addSet] = useAddSetMutation();
  const [updateSet] = useUpdateSetMutation();
  const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation();

  // Clear active session if it returns error (e.g. not found, deleted) or is completed
  useEffect(() => {
    if (sessionError || (activeSession && activeSession.status !== "in_progress")) {
      const timer = setTimeout(() => {
        localStorage.removeItem("active_workout_session_id");
        setActiveSessionId(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [sessionError, activeSession]);

  // Session duration timer logic
  useEffect(() => {
    let interval = null;
    if (activeSession && activeSession.status === "in_progress") {
      const startTime = new Date(activeSession.startedAt || activeSession.createdAt).getTime();
      const updateTimer = () => {
        const diff = Math.max(Math.round((Date.now() - startTime) / 1000), 0);
        setTimerSeconds(diff);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      const resetTimer = setTimeout(() => setTimerSeconds(0), 0);
      return () => clearTimeout(resetTimer);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  if (isLoadingPlan || isLoadingDay || (activeSessionId && isLoadingSession)) {
    return <LoadingScreen message="Đang tải dữ liệu buổi tập..." />;
  }

  // Format timer
  const formatTime = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  // Start a new workout session
  const handleStartWorkout = async () => {
    try {
      const res = await startSession({
        planDayId: resolvedDayId,
      }).unwrap();
      const newSession = res?.data;
      if (newSession?.id) {
        localStorage.setItem("active_workout_session_id", newSession.id);
        setActiveSessionId(newSession.id);
        showToast("🔥 Buổi tập đã bắt đầu! Chúc bạn tập tốt!");
      }
    } catch (error) {
      showToast(error?.data?.message || "Không thể bắt đầu buổi tập lúc này.");
    }
  };

  // Start a free workout session
  const handleStartFreeWorkout = async () => {
    try {
      const res = await startSession({
        planDayId: resolvedDayId || null,
        title: "Tập tự do " + new Date().toLocaleDateString("vi-VN"),
        isFreeWorkout: true,
      }).unwrap();
      const newSession = res?.data;
      if (newSession?.id) {
        localStorage.setItem("active_workout_session_id", newSession.id);
        setActiveSessionId(newSession.id);
        showToast("🔥 Bắt đầu buổi tập tự do!");
      }
    } catch (error) {
      showToast(error?.data?.message || "Không thể bắt đầu buổi tập lúc này.");
    }
  };

  // Add a new set to a session exercise
  const handleAddSet = async (sessionExercise) => {
    const nextSetNumber = (sessionExercise.sets || []).length + 1;
    try {
      await addSet({
        sessionId: activeSession.id,
        sessionExerciseId: sessionExercise.id,
        data: {
          setNumber: nextSetNumber,
          setType: "working",
          reps: 10,
          weightKg: 20,
          isCompleted: false,
        },
      }).unwrap();
    } catch {
      showToast("Không thể thêm set tập mới.");
    }
  };

  // Update set inline details (Weight, Reps, RPE, IsCompleted)
  const handleUpdateSet = async (setId, field, val) => {
    let parsedVal = val;
    if (field === "weightKg" || field === "reps" || field === "rpe") {
      parsedVal = (val === "" || val === null || val === undefined) ? null : Number(val);
    }
    try {
      await updateSet({
        setId,
        sessionId: activeSession.id,
        data: {
          [field]: parsedVal,
        },
      }).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  const markPlanDayCompletedInCache = () => {
    if (!resolvedDayId) return;

    const updatePlanDay = (draft) => {
      const day = draft?.data?.days?.find((item) => item.id === resolvedDayId);
      if (day) {
        day.status = "completed";
        day.notes = sessionNotes || null;
      }
    };

    dispatch(roadmapApi.util.updateQueryData("getCurrentPlan", undefined, updatePlanDay));
    dispatch(roadmapApi.util.updateQueryData("getActivePlan", undefined, updatePlanDay));
    dispatch(
      roadmapApi.util.updateQueryData("getDayDetails", resolvedDayId, (draft) => {
        if (draft?.data?.day) {
          draft.data.day.status = "completed";
          draft.data.day.notes = sessionNotes || null;
        }
      })
    );
    dispatch(roadmapApi.util.invalidateTags(["Roadmap", "RoadmapStats", { type: "DayDetails", id: resolvedDayId }]));
  };

  // Complete session handler
  const handleCompleteSession = async () => {
    try {
      await completeSession({
        sessionId: activeSession.id,
        data: {
          perceivedEffort,
          notes: sessionNotes,
        },
      }).unwrap();
      markPlanDayCompletedInCache();
      localStorage.removeItem("active_workout_session_id");
      setActiveSessionId(null);
      setShowCompleteModal(false);
      showToast("🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc buổi tập!");
      setTimeout(() => navigate(paths.myPlan), 1500);
    } catch {
      showToast("Không thể hoàn thành buổi tập lúc này.");
    }
  };

  return (
    <>
      {!activeSession ? (
        <WorkoutOverview
          dayDetails={dayDetails}
          onStartWorkout={handleStartWorkout}
          onStartFreeWorkout={handleStartFreeWorkout}
          onBack={() => navigate(paths.myPlan)}
        />
      ) : (
        <WorkoutTracker
          activeSession={activeSession}
          timerSeconds={timerSeconds}
          formatTime={formatTime}
          onCompleteClick={() => setShowCompleteModal(true)}
          onBack={() => navigate(paths.myPlan)}
          onAddSet={handleAddSet}
          onUpdateSet={handleUpdateSet}
          onShowGuide={setGuideExercise}
          openRpeDropdownSetId={openRpeDropdownSetId}
          setOpenRpeDropdownSetId={setOpenRpeDropdownSetId}
        />
      )}

      {showCompleteModal && (
        <CompleteWorkoutModal
          timerSeconds={timerSeconds}
          perceivedEffort={perceivedEffort}
          setPerceivedEffort={setPerceivedEffort}
          sessionNotes={sessionNotes}
          setSessionNotes={setSessionNotes}
          onComplete={handleCompleteSession}
          onClose={() => setShowCompleteModal(false)}
          isCompleting={isCompleting}
          formatTime={formatTime}
        />
      )}

      {guideExercise && (
        <VideoGuideModal
          exercise={guideExercise}
          onClose={() => setGuideExercise(null)}
        />
      )}

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[160] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-slide-down">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </>
  );
}
