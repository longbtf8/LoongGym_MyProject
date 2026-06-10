import {
  Award,
  ChevronDown,
  ChevronRight,
  Clock,
  Dumbbell,
  Plus,
  Check,
} from "lucide-react";

const getWorkoutDisplayTitle = (title = "Buổi tập") => {
  return title.replace(/^Ngày\s+\d+\s*:\s*/i, "").trim() || "Buổi tập";
};

export default function WorkoutTracker({
  activeSession,
  timerSeconds,
  formatTime,
  onCompleteClick,
  onBack,
  onAddSet,
  onUpdateSet,
  onShowGuide,
  openRpeDropdownSetId,
  setOpenRpeDropdownSetId,
}) {
  const sessionExercises = activeSession.exercises || [];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full flex justify-center">
      <div className="max-w-[750px] w-full flex flex-col gap-5">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)] hover:text-primary self-start transition cursor-pointer bg-transparent border-0 p-0"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Quay lại Lịch tập
        </button>

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
              <h2 className="text-base font-extrabold tracking-tight mt-0.5">
                {getWorkoutDisplayTitle(activeSession.title)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
            <button
              onClick={onCompleteClick}
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
              const exercise = se.exercise || {};
              const hasGuideVideo = !!exercise.videoUrl;

              return (
                <div
                  key={se.id}
                  className={`bg-[var(--bg-secondary)] border p-4 rounded-2xl flex flex-col gap-3 shadow-sm transition-all ${
                    allSetsCompleted ? "border-green-500/20 bg-green-500/[0.01]" : "border-[var(--border-color)]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="relative w-full sm:w-28 aspect-video sm:h-20 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-color)] flex items-center justify-center shrink-0">
                      {exercise.thumbnailUrl ? (
                        <img
                          src={exercise.thumbnailUrl}
                          alt={exercise.name || "Bài tập"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Dumbbell className="w-6 h-6 text-[var(--text-muted)]" />
                      )}
                    </div>

                    <div className="flex-1 w-full min-w-0 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-[10px] font-black text-primary shrink-0 mt-0.5">
                            {seIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-sm text-[var(--text-color)] truncate">
                              {exercise.name || "Bài tập"}
                            </h3>
                            {hasGuideVideo && (
                              <button
                                type="button"
                                onClick={() => onShowGuide(exercise)}
                                className="mt-1 text-[10px] font-black text-primary hover:text-primary-hover bg-transparent border-0 p-0 cursor-pointer"
                              >
                                Xem video hướng dẫn
                              </button>
                            )}
                          </div>
                          {allSetsCompleted && (
                            <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-wider shrink-0 mt-0.5">
                              Đã xong
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => onAddSet(se)}
                          className="h-7 px-2.5 rounded-lg bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary text-[10px] font-bold text-[var(--text-color)] flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        >
                          <Plus className="w-3 h-3" /> Add Set
                        </button>
                      </div>

                      {/* Sets table */}
                      {sets.length === 0 ? (
                        <span className="text-[10px] text-[var(--text-muted)] font-bold italic">
                          Chưa có set tập nào. Bấm nút "Add Set" để thêm.
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1.5">
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
                                onChange={(e) => onUpdateSet(set.id, "weightKg", e.target.value)}
                                className="h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 text-xs outline-none focus:border-primary text-center font-bold"
                              />

                              <input
                                type="number"
                                value={set.reps ?? ""}
                                onChange={(e) => onUpdateSet(set.id, "reps", e.target.value)}
                                className="h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] px-2 text-xs outline-none focus:border-primary text-center font-bold"
                              />

                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setOpenRpeDropdownSetId(openRpeDropdownSetId === set.id ? null : set.id)
                                  }
                                  className="h-7 w-full rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] px-1 text-[11px] outline-none focus:border-primary text-center font-bold cursor-pointer hover:border-primary transition-colors flex items-center justify-between gap-0.5"
                                >
                                  <span className="truncate">
                                    {set.rpe ? `${set.rpe} RPE` : "RPE..."}
                                  </span>
                                  <ChevronDown className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                                </button>

                                {openRpeDropdownSetId === set.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-[150]"
                                      onClick={() => setOpenRpeDropdownSetId(null)}
                                    />

                                    <div className="absolute right-0 top-8 z-[160] w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 max-h-60 overflow-y-auto animate-slide-down">
                                      <button
                                        onClick={() => {
                                          onUpdateSet(set.id, "rpe", null);
                                          setOpenRpeDropdownSetId(null);
                                        }}
                                        className="w-full px-2 py-1 text-left text-[10px] font-bold rounded-lg hover:bg-[var(--bg-color)] border-0 bg-transparent text-[var(--text-muted)] transition cursor-pointer"
                                      >
                                        Bỏ chọn RPE
                                      </button>
                                      {[
                                        { val: 10, label: "10 RPE - Hết sức (Không thể thêm rep)" },
                                        { val: 9, label: "9 RPE - Rất nặng (Có thể cố 1 rep)" },
                                        { val: 8, label: "8 RPE - Nặng (Có thể cố 2 reps)" },
                                        { val: 7, label: "7 RPE - Vừa phải (Có thể cố 3 reps)" },
                                        { val: 6, label: "6 RPE - Nhẹ vừa (Có thể thêm 4 reps)" },
                                        { val: 5, label: "5 RPE - Nhẹ (Khởi động / hồi sức)" },
                                        { val: 4, label: "4 RPE - Rất nhẹ" },
                                        { val: 3, label: "3 RPE - Vô cùng nhẹ" },
                                        { val: 2, label: "2 RPE - Rất phục hồi" },
                                        { val: 1, label: "1 RPE - Nhẹ nhàng thư giãn" },
                                      ].map((item) => (
                                        <button
                                          key={item.val}
                                          onClick={() => {
                                            onUpdateSet(set.id, "rpe", item.val);
                                            setOpenRpeDropdownSetId(null);
                                          }}
                                          className={`w-full px-2 py-1.5 text-left text-[10px] rounded-lg transition border-0 cursor-pointer flex justify-between items-center ${
                                            set.rpe === item.val
                                              ? "bg-primary text-black font-extrabold"
                                              : "bg-transparent text-[var(--text-color)] hover:bg-[var(--bg-color)]"
                                          }`}
                                        >
                                          <span>{item.label}</span>
                                          {set.rpe === item.val && (
                                            <Check className="w-3 h-3 text-black stroke-[3px]" />
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="flex justify-center">
                                <button
                                  onClick={() => onUpdateSet(set.id, "isCompleted", !set.isCompleted)}
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
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating bottom actions */}
        <button
          onClick={onCompleteClick}
          className="w-full h-12 bg-primary text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-lg shadow-primary/10 mt-2"
        >
          <Award className="w-4 h-4 fill-black" />
          Hoàn thành và lưu kết quả buổi tập
        </button>
      </div>
    </div>
  );
}
