import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Play,
  Check,
  Plus,
  Trash2,
  Clock,
  Award,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
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

export default function TodayWorkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramDayId = searchParams.get("dayId");

  const [activeSessionId, setActiveSessionId] = useState(
    localStorage.getItem("active_workout_session_id") || null
  );

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [perceivedEffort, setPerceivedEffort] = useState(7);
  const [sessionNotes, setSessionNotes] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  // Get current plan & selected day ID
  const { data: currentPlanRes, isLoading: isLoadingPlan } = useGetCurrentPlanQuery();
  const activePlan = currentPlanRes?.data;
  const todayStr = new Date().toISOString().split("T")[0];

  // Fallback to today's day if no dayId in URL
  const [resolvedDayId, setResolvedDayId] = useState(null);
  useEffect(() => {
    if (paramDayId) {
      setResolvedDayId(paramDayId);
    } else if (activePlan?.days) {
      const todayDay = activePlan.days.find((d) => d.scheduledDate.startsWith(todayStr));
      const pendingDay = activePlan.days.find((d) => d.status === "pending");
      const targetDay = todayDay || pendingDay || activePlan.days[0];
      if (targetDay) setResolvedDayId(targetDay.id);
    }
  }, [paramDayId, activePlan, todayStr]);

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
  const [startSession, { isLoading: isStarting }] = useStartSessionMutation();
  const [addSet] = useAddSetMutation();
  const [updateSet] = useUpdateSetMutation();
  const [completeSession, { isLoading: isCompleting }] = useCompleteSessionMutation();

  // Clear active session if it returns error (e.g. not found, deleted) or is completed
  useEffect(() => {
    if (sessionError || (activeSession && activeSession.status !== "in_progress")) {
      localStorage.removeItem("active_workout_session_id");
      setActiveSessionId(null);
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
      setTimerSeconds(0);
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
        planDayId: null,
        title: "Tập tự do " + new Date().toLocaleDateString("vi-VN"),
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
    } catch (error) {
      showToast("Không thể thêm set tập mới.");
    }
  };

  // Update set inline details (Weight, Reps, RPE, IsCompleted)
  const handleUpdateSet = async (setId, field, val) => {
    let parsedVal = val;
    if (field === "weightKg" || field === "reps" || field === "rpe") {
      parsedVal = val === "" ? null : Number(val);
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
      localStorage.removeItem("active_workout_session_id");
      setActiveSessionId(null);
      setShowCompleteModal(false);
      showToast("🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc buổi tập!");
      setTimeout(() => navigate(paths.myPlan), 1500);
    } catch (error) {
      showToast("Không thể hoàn thành buổi tập lúc này.");
    }
  };

  // --- VIEW 1: No active session (Intro/Overview of day) ---
  if (!activeSession) {
    const scheduledExercises = dayDetails?.exercises || [];
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full flex justify-center">
        <div className="max-w-[700px] w-full flex flex-col gap-5">
          
          <div className="flex flex-col gap-2.5">
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
              Thông tin buổi tập hôm nay
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight !m-0">
              {dayDetails?.day?.title || "Buổi tập tự do"}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              {dayDetails?.day?.scheduledDate
                ? new Date(dayDetails.day.scheduledDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Tự do lên lịch & không theo chu kỳ cố định"}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl flex flex-col gap-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <span className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider">
                Bài tập đã xếp lịch
              </span>
              <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-lg font-black uppercase">
                {scheduledExercises.length} Bài tập
              </span>
            </div>

            {scheduledExercises.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] font-extrabold flex flex-col items-center gap-3">
                <Coffee className="w-10 h-10 text-[var(--text-muted)]/50" />
                Hôm nay là ngày nghỉ của bạn theo lịch giáo án.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {scheduledExercises.map((se) => (
                  <div
                    key={se.id}
                    className="flex justify-between items-center p-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl"
                  >
                    <div>
                      <h4 className="font-extrabold text-xs">{se.exercise?.name || "Bài tập"}</h4>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {se.sets} Sets × {se.repsMin}-{se.repsMax} Reps • {se.weightKg} kg
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-primary">Dự kiến</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={handleStartWorkout}
                className="flex-1 h-11 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-md shadow-primary/5"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Bắt đầu tập theo lịch
              </button>
              <button
                onClick={handleStartFreeWorkout}
                className="flex-1 h-11 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary/50 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer"
              >
                Tập tự do ngoài lịch
              </button>
            </div>
          </div>

        </div>

        {toast.show && (
          <div className="fixed bottom-6 right-6 z-[160] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-slide-down">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 2: Workout is in-progress (Interactive tracking screen) ---
  const sessionExercises = activeSession.exercises || [];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full flex justify-center">
      <div className="max-w-[750px] w-full flex flex-col gap-5">
        
        {/* Floating live status header */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Dumbbell className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-primary tracking-widest">
                Đang tập luyện
              </span>
              <h2 className="text-base font-extrabold tracking-tight mt-0.5">{activeSession.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <button
              onClick={() => setShowCompleteModal(true)}
              className="h-9 px-4 bg-primary text-black rounded-lg text-xs font-black hover:bg-primary-hover active:scale-[0.98] transition cursor-pointer shadow-sm shadow-primary/5"
            >
              Hoàn thành
            </button>
          </div>
        </div>

        {/* Exercises tracking checklist */}
        <div className="flex flex-col gap-4">
          {sessionExercises.length === 0 ? (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-8 rounded-2xl text-center text-xs text-[var(--text-muted)] font-extrabold flex flex-col items-center gap-3">
              Chưa có bài tập nào trong buổi tập này. Bạn có thể quay lại hoặc thêm bài tập.
            </div>
          ) : (
            sessionExercises.map((se, seIdx) => {
              const sets = se.sets || [];
              const allSetsCompleted = sets.length > 0 && sets.every((s) => s.isCompleted);

              return (
                <div
                  key={se.id}
                  className={`bg-[var(--bg-secondary)] border p-4 rounded-2xl flex flex-col gap-3 shadow-sm transition-all ${
                    allSetsCompleted ? "border-green-500/20 bg-green-500/[0.01]" : "border-[var(--border-color)]"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-black text-primary">
                        {seIdx + 1}
                      </span>
                      <h3 className="font-extrabold text-sm text-[var(--text-color)]">
                        {se.exercise?.name || "Bài tập"}
                      </h3>
                      {allSetsCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-wider">
                          Đã xong
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddSet(se)}
                      className="h-7 px-2.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary text-[10px] font-bold text-[var(--text-color)] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add Set
                    </button>
                  </div>

                  {/* Sets table */}
                  {sets.length === 0 ? (
                    <span className="text-[10px] text-[var(--text-muted)] font-bold italic pl-7">
                      Chưa có set tập nào. Bấm nút "Add Set" để thêm.
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1.5 pl-7">
                      {/* Table headers */}
                      <div className="grid grid-cols-[0.5fr_1fr_1fr_1.1fr_0.5fr] gap-2 text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider px-2">
                        <span>Set</span>
                        <span>Khối lượng (kg)</span>
                        <span>Số reps</span>
                        <span>Độ khó (RPE)</span>
                        <span className="text-center">Xong</span>
                      </div>

                      {/* Set rows */}
                      {sets.map((set, idx) => (
                        <div
                          key={set.id}
                          className={`grid grid-cols-[0.5fr_1fr_1fr_1.1fr_0.5fr] gap-2 items-center px-2 py-1.5 rounded-xl border transition-all ${
                            set.isCompleted
                              ? "bg-green-500/5 border-green-500/20 text-[var(--text-color)]"
                              : "bg-[var(--bg-color)] border-[var(--border-color)]"
                          }`}
                        >
                          <span className="text-xs font-black">
                            {idx + 1}
                            <span className="text-[9px] text-[var(--text-muted)] ml-0.5 uppercase">
                              {set.setType === "working" ? "W" : "D"}
                            </span>
                          </span>

                          <input
                            type="number"
                            value={set.weightKg ?? ""}
                            onChange={(e) => handleUpdateSet(set.id, "weightKg", e.target.value)}
                            className="h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 text-xs outline-none focus:border-primary text-center font-bold"
                          />

                          <input
                            type="number"
                            value={set.reps ?? ""}
                            onChange={(e) => handleUpdateSet(set.id, "reps", e.target.value)}
                            className="h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 text-xs outline-none focus:border-primary text-center font-bold"
                          />

                          <select
                            value={set.rpe ?? ""}
                            onChange={(e) => handleUpdateSet(set.id, "rpe", e.target.value)}
                            className="h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs outline-none focus:border-primary text-center font-bold cursor-pointer"
                          >
                            <option value="">RPE...</option>
                            {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) => (
                              <option key={r} value={r}>
                                @ {r} RPE
                              </option>
                            ))}
                          </select>

                          <div className="flex justify-center">
                            <button
                              onClick={() => handleUpdateSet(set.id, "isCompleted", !set.isCompleted)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                                set.isCompleted
                                  ? "bg-green-500 border-green-500 text-black"
                                  : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-primary"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Floating bottom actions */}
        <button
          onClick={() => setShowCompleteModal(true)}
          className="w-full h-12 bg-primary text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-lg shadow-primary/10 mt-2"
        >
          <Award className="w-4 h-4 fill-black" />
          Hoàn thành và lưu kết quả buổi tập
        </button>

        {/* COMPLETE WORKOUT MODAL */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-5 w-full max-w-[420px] flex flex-col gap-4 shadow-2xl animate-slide-up">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-base flex items-center gap-2 text-[var(--text-color)]">
                  <Trophy className="w-5 h-5 text-primary" />
                  Tổng kết buổi tập
                </h3>
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="p-1.5 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="text-center py-2">
                  <span className="text-xs text-[var(--text-muted)] font-bold">Thời gian tập luyện</span>
                  <div className="text-2xl font-black text-primary mt-1">{formatTime(timerSeconds)}</div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Độ mệt mỏi cảm nhận (RPE)
                  </label>
                  <div className="grid grid-cols-10 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        onClick={() => setPerceivedEffort(num)}
                        className={`h-8 rounded-lg text-xs font-black transition-all ${
                          perceivedEffort === num
                            ? "bg-primary text-black"
                            : "bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] text-right">
                    {perceivedEffort <= 4
                      ? "Khá nhẹ nhàng"
                      : perceivedEffort <= 7
                      ? "Vừa sức / Hiệu quả"
                      : "Cực kỳ mệt mỏi"}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Ghi chú buổi tập
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ghi nhận cảm xúc, chấn thương hoặc lưu ý cho buổi sau..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-2 text-xs text-[var(--text-color)] outline-none resize-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowCompleteModal(false)}
                  className="flex-1 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--bg-color)]"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCompleteSession}
                  disabled={isCompleting}
                  className="flex-1 h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
                >
                  {isCompleting ? "Đang lưu..." : "Xác nhận & Hoàn thành"}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <div className="fixed bottom-6 right-6 z-[160] bg-[var(--bg-secondary)] border border-primary/30 text-[var(--text-color)] rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-2xl animate-slide-down">
            <Check className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
        )}

      </div>
    </div>
  );
}
