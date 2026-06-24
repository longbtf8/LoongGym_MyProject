import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Clock, Flame, CalendarPlus, CheckCircle2, Play } from "lucide-react";
import paths from "@/config/path";

function TodayWorkoutCard({ workout }) {
  const navigate = useNavigate();
  const isRest = workout?.status === "rest";
  const isCompleted = workout?.status === "completed";
  const hasWorkout = workout && workout.title && !isRest;
  const title = isRest
    ? "Ngày nghỉ phục hồi"
    : workout?.title || "Chưa có lịch tập";
  const exercisesCount = workout?.exercisesCount || 0;
  const duration = workout?.duration || 0;
  const difficulty = workout?.difficulty || "--";

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">Bài tập hôm nay</span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Đã hoàn thành
            </span>
          )}
        </div>
        <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)] mt-1.5 mb-5 tracking-tight">{title}</h2>
        
        {!isRest && (
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
              <Dumbbell className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-xs font-black text-[var(--text-color)]">{exercisesCount} Bài</span>
              <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Số lượng</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
              <Clock className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-xs font-black text-[var(--text-color)]">{duration} Phút</span>
              <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Thời gian</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl text-center">
              <Flame className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-xs font-black text-[var(--text-color)]">{difficulty}</span>
              <span className="text-[9px] text-[var(--text-muted)] font-medium mt-0.5">Mức độ</span>
            </div>
          </div>
        )}

        {isRest && (
          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
            Hôm nay là ngày nghỉ. Bạn có thể chọn buổi tập khác trong Lộ trình và chuyển về hôm nay nếu muốn tập.
          </p>
        )}
      </div>

      {isCompleted ? (
        <button
          onClick={() => navigate(`${paths.todayWorkout}?dayId=${workout.id}`)}
          className="w-full py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/40 text-[var(--text-color)] font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 text-primary fill-primary" />
          Tập thêm buổi này
        </button>
      ) : hasWorkout ? (
        <button
          onClick={() => navigate(`${paths.todayWorkout}?dayId=${workout.id}`)}
          className="w-full py-3.5 bg-primary border border-primary text-black hover:bg-primary-hover font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4 shadow-md shadow-primary/10 border-0"
        >
          Bắt đầu tập
        </button>
      ) : isRest ? (
        <button
          onClick={() => navigate(paths.myPlan)}
          className="w-full py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/40 text-[var(--text-color)] font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4 flex items-center justify-center gap-2"
        >
          <CalendarPlus className="w-4 h-4 text-primary" />
          Xem lộ trình
        </button>
      ) : (
        <button
          onClick={() => navigate(paths.myPlan)}
          className="w-full py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/40 text-[var(--text-color)] font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4 flex items-center justify-center gap-2"
        >
          <CalendarPlus className="w-4 h-4 text-primary" />
          Tạo lịch tập
        </button>
      )}
    </div>
  );
}

export default TodayWorkoutCard;
