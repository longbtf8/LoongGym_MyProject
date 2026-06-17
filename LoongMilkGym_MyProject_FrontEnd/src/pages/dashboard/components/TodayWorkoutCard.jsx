import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Clock, Flame, CalendarPlus } from "lucide-react";
import paths from "@/config/path";

function TodayWorkoutCard({ workout }) {
  const navigate = useNavigate();
  const hasWorkout = workout && workout.title;
  const title = workout?.title || "Chưa có lịch tập";
  const exercisesCount = workout?.exercisesCount || 0;
  const duration = workout?.duration || 0;
  const difficulty = workout?.difficulty || "--";

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
      <div>
        <span className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">Bài tập hôm nay</span>
        <h2 className="text-lg sm:text-xl font-black text-[var(--text-color)] mt-1.5 mb-5 tracking-tight">{title}</h2>
        
        {/* 3 Stat Chips */}
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
      </div>

      {hasWorkout ? (
        <button
          onClick={() => navigate(paths.todayWorkout)}
          className="w-full py-3.5 bg-primary border border-primary text-black hover:bg-primary-hover font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4 shadow-md shadow-primary/10 border-0"
        >
          Bắt đầu tập
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
