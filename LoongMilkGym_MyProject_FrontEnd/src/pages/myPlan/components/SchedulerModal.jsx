import { useCallback, useState, useEffect, useRef } from "react";
import { GripVertical, Info, X } from "lucide-react";
import { useGetWorkoutProgramQuery, useStartProgramPlanMutation } from "@/services/roadmap/roadmapApi";

const hasWorkoutSession = (programDay) => Array.isArray(programDay?.templates) && programDay.templates.length > 0;

const getSortedProgramDays = (program) => {
  return [...(Array.isArray(program?.days) ? program.days : [])].sort((a, b) => {
    return (a?.cycleDay || 0) - (b?.cycleDay || 0);
  });
};

const buildInitialSchedulerDays = (program) => {
  const programDays = getSortedProgramDays(program);
  return programDays.map((programDay, index) => ({
    label: `Buổi ${index + 1}`,
    originalIndex: index,
    programDayId: programDay.id,
    cycleDay: programDay.cycleDay,
  }));
};

const moveItem = (items, fromIndex, toIndex) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);

  return nextItems.map((nextItem, index) => ({
    ...nextItem,
    label: `Buổi ${index + 1}`,
  }));
};

const getDropIndexFromPoint = (clientX, clientY) => {
  const element = document.elementFromPoint(clientX, clientY);
  const dropTarget = element?.closest?.("[data-scheduler-index]");
  const index = Number(dropTarget?.getAttribute("data-scheduler-index"));

  return Number.isInteger(index) ? index : null;
};

const getWeeklyPositionLabel = (index) => {
  const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  return labels[index % labels.length];
};

const getTodayWeekIndex = () => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
};

// SchedulerModal: Modal thiết lập phân bổ các ngày tập trong chu kỳ trước khi bắt đầu giáo án
export default function SchedulerModal({
  programId,
  onClose,
  onSuccess
}) {
  const { data: programRes, isLoading: isLoadingProgram } = useGetWorkoutProgramQuery(programId, {
    skip: !programId
  });
  const program = programRes?.data;
  const programDays = getSortedProgramDays(program);

  const [schedulerDays, setSchedulerDays] = useState([]);
  const schedulerDaysRef = useRef([]);
  const dragStateRef = useRef({
    activeOriginalIndex: null,
    fromIndex: null,
    overIndex: null,
    startY: 0,
    offsetY: 0,
  });
  const [dragState, setDragState] = useState({
    activeOriginalIndex: null,
    fromIndex: null,
    overIndex: null,
    startY: 0,
    offsetY: 0,
  });
  const [startProgramPlan, { isLoading: isStarting }] = useStartProgramPlanMutation();
  const todayWeekIndex = getTodayWeekIndex();

  const commitSchedulerDays = (updater) => {
    const nextDays = typeof updater === "function" ? updater(schedulerDaysRef.current) : updater;
    schedulerDaysRef.current = nextDays;
    setSchedulerDays(nextDays);
    return nextDays;
  };

  const commitDragState = (updater) => {
    const nextState = typeof updater === "function" ? updater(dragStateRef.current) : updater;
    dragStateRef.current = nextState;
    setDragState(nextState);
    return nextState;
  };

  const resetSchedulerDays = useCallback(() => {
    if (!program) {
      schedulerDaysRef.current = [];
      setSchedulerDays([]);
      return [];
    }

    const initialDays = buildInitialSchedulerDays(program);
    schedulerDaysRef.current = initialDays;
    setSchedulerDays(initialDays);
    return initialDays;
  }, [program]);

  // Initialize scheduler days order when program loaded
  useEffect(() => {
    const timer = window.setTimeout(() => {
      resetSchedulerDays();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [resetSchedulerDays]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!programId) return null;

  const resetDragState = () => {
    commitDragState({
      activeOriginalIndex: null,
      fromIndex: null,
      overIndex: null,
      startY: 0,
      offsetY: 0,
    });
  };

  const handleClose = () => {
    resetSchedulerDays();
    resetDragState();
    onClose();
  };

  const handlePointerDown = (event, index) => {
    if (isStarting) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    commitDragState({
      activeOriginalIndex: schedulerDaysRef.current[index]?.originalIndex ?? null,
      fromIndex: index,
      overIndex: index,
      startY: event.clientY,
      offsetY: 0,
    });
  };

  const handlePointerMove = (event) => {
    if (dragStateRef.current.activeOriginalIndex === null) return;

    event.preventDefault();
    const targetIndex = getDropIndexFromPoint(event.clientX, event.clientY);
    commitDragState((prev) => ({
      ...prev,
      overIndex: targetIndex ?? prev.overIndex,
      offsetY: event.clientY - prev.startY,
    }));
  };

  const handlePointerUp = (event) => {
    const currentDragState = dragStateRef.current;
    if (currentDragState.activeOriginalIndex === null) return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (
      currentDragState.overIndex !== null
      && currentDragState.fromIndex !== null
      && currentDragState.overIndex !== currentDragState.fromIndex
    ) {
      commitSchedulerDays((currentDays) => {
        const currentIndex = currentDays.findIndex((item) => item.originalIndex === currentDragState.activeOriginalIndex);
        if (currentIndex === -1) return currentDays;
        return moveItem(currentDays, currentIndex, currentDragState.overIndex);
      });
    }

    resetDragState();
  };

  // handleConfirm: Xác nhận việc lập lịch phân bổ ngày tập và kích hoạt giáo án đã chọn
  const handleConfirm = async () => {
    if (!program) return;
    try {
      const currentDays = schedulerDaysRef.current.length === programDays.length
        ? schedulerDaysRef.current
        : resetSchedulerDays();
      const dayMapping = currentDays.map((day) => day.programDayId);
      await startProgramPlan({
        programId: program.id,
        dayMapping,
      }).unwrap();
      onSuccess("Đã bắt đầu lộ trình.");
    } catch {
      onSuccess("Không thể bắt đầu lộ trình này.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 w-full max-w-[420px] max-h-[85vh] flex flex-col gap-2.5 shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <h3 className="font-extrabold text-base text-[var(--text-color)]">Cơ cấu chu kỳ tập</h3>
          <button 
            onClick={handleClose}
            className="p-1 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isLoadingProgram || !program ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
            <span className="text-xs text-[var(--text-muted)]">Đang tải cấu trúc giáo án...</span>
          </div>
        ) : (
          <>
            <div className="py-2">
              <h4 className="font-bold text-sm text-[var(--text-color)]">Bạn muốn sắp xếp lại lịch tập không?</h4>
              <div className="mt-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-[var(--text-color)] flex gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="m-0 leading-relaxed">
                  Lịch tập sẽ tính từ Thứ 2 hàng tuần, nên hôm nay có thể là ngày nghỉ. Nếu chưa phù hợp, hãy kéo thả các buổi bên dưới để điều chỉnh.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 no-scrollbar">
              {schedulerDays.map((day, index) => {
                const programDay = programDays[day.originalIndex];
                const sessionTitle = programDay?.title || "Ngày nghỉ";
                const isRest = !hasWorkoutSession(programDay);
                const isDragging = dragState.activeOriginalIndex === day.originalIndex;
                const isTodayPosition = index === todayWeekIndex;
                const isDraggingDown = dragState.fromIndex !== null
                  && dragState.overIndex !== null
                  && dragState.overIndex > dragState.fromIndex;
                const isDraggingUp = dragState.fromIndex !== null
                  && dragState.overIndex !== null
                  && dragState.overIndex < dragState.fromIndex;
                const isInDragPath = dragState.activeOriginalIndex !== null
                  && !isDragging
                  && dragState.fromIndex !== null
                  && dragState.overIndex !== null
                  && (
                    (isDraggingDown && index > dragState.fromIndex && index <= dragState.overIndex)
                    || (isDraggingUp && index < dragState.fromIndex && index >= dragState.overIndex)
                  );
                
                return (
                  <div 
                    key={day.originalIndex}
                    data-scheduler-index={index}
                    onPointerDown={(event) => handlePointerDown(event, index)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={resetDragState}
                    style={isDragging ? {
                      transform: `translate3d(0, ${dragState.offsetY}px, 0) scale(1.035)`,
                    } : undefined}
                    className={`relative flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-color)] border select-none touch-none cursor-grab active:cursor-grabbing transition-[transform,box-shadow,border-color,background-color,opacity] duration-200 ease-out ${
                      isDragging
                        ? "z-30 pointer-events-none border-primary bg-primary/10 shadow-[0_22px_55px_rgba(0,0,0,0.26)] ring-2 ring-primary/25"
                        : isInDragPath
                          ? `z-10 scale-[1.01] border-primary/70 bg-primary/10 shadow-[0_16px_36px_rgba(0,0,0,0.16)] ${isDraggingDown ? "-translate-y-[calc(100%+0.375rem)]" : "translate-y-[calc(100%+0.375rem)]"}`
                          : isTodayPosition
                            ? "z-0 border-primary/60 bg-primary/5 shadow-[0_10px_28px_rgba(204,255,0,0.10)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(204,255,0,0.14)]"
                            : "z-0 border-[var(--border-color)] hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        aria-hidden="true"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                          isDragging
                            ? "border-primary bg-primary text-black shadow-[0_8px_18px_rgba(204,255,0,0.28)]"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                        }`}
                      >
                        <GripVertical className="w-4 h-4" strokeWidth={2.4} />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-primary">{day.label}</span>
                          <span className="text-[10px] font-bold text-[var(--text-muted)]">{getWeeklyPositionLabel(index)}</span>
                          {isTodayPosition && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-primary text-black">
                              Hôm nay
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-extrabold truncate ${isRest ? "text-[var(--text-muted)]" : "text-[var(--text-color)]"}`}>
                          {sessionTitle}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full shrink-0 ${
                      isRest
                        ? "bg-[var(--border-color)] text-[var(--text-muted)]"
                        : "bg-primary/15 text-primary"
                    }`}>
                      {isRest ? "Nghỉ" : "Tập"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={handleClose}
                className="flex-1 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--bg-color)]"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={isStarting}
                className="flex-1 h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
              >
                {isStarting ? "Đang xử lý..." : "Kích hoạt lộ trình"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
