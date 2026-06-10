import { ChevronRight, Coffee, Play } from "lucide-react";

const getWorkoutDisplayTitle = (title = "Buổi tập") => {
  return title.replace(/^Ngày\s+\d+\s*:\s*/i, "").trim() || "Buổi tập";
};

export default function WorkoutOverview({
  dayDetails,
  onStartWorkout,
  onStartFreeWorkout,
  onBack,
}) {
  const scheduledExercises = dayDetails?.exercises || [];

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] py-8 px-4 w-full flex justify-center">
      <div className="max-w-[700px] w-full flex flex-col gap-5">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-[var(--text-muted)] hover:text-primary self-start transition cursor-pointer bg-transparent border-0 p-0"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Quay lại Lịch tập
        </button>

        <div className="flex flex-col gap-2.5">
          <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
            Thông tin buổi tập hôm nay
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight !m-0">
            {getWorkoutDisplayTitle(dayDetails?.day?.title || "Buổi tập tự do")}
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
              onClick={onStartWorkout}
              className="flex-1 h-11 bg-primary text-black rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer shadow-md shadow-primary/5"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              Bắt đầu tập theo lịch
            </button>
            <button
              onClick={onStartFreeWorkout}
              className="flex-1 h-11 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary/50 rounded-xl text-xs font-black flex items-center justify-center gap-2 active:scale-[0.99] transition cursor-pointer"
            >
              Tập tự do ngoài lịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
