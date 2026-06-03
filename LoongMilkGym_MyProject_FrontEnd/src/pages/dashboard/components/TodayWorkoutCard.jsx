import React from "react";
import { Dumbbell, Clock, Flame } from "lucide-react";

function TodayWorkoutCard({ workout }) {
  const title = workout?.title || "Ngực & Tay sau";
  const exercisesCount = workout?.exercisesCount || 8;
  const duration = workout?.duration || 60;
  const difficulty = workout?.difficulty || "Khó";

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

      <button className="w-full py-3.5 bg-primary border border-primary text-black hover:bg-primary-hover font-extrabold text-sm rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer mt-4 shadow-md shadow-primary/10">
        Bắt đầu tập
      </button>
    </div>
  );
}

export default TodayWorkoutCard;
