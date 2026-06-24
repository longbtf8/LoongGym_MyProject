import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Play, CalendarPlus, CheckCircle2 } from "lucide-react";
import paths from "@/config/path";

function GreetingBanner({ userInfo, userName, userInitial, displayGoal, workout }) {
  const navigate = useNavigate();
  const isRest = workout?.status === "rest";
  const isCompleted = workout?.status === "completed";
  const hasWorkout = workout && workout.title && !isRest;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-sm transition-all duration-200">
      <div className="flex items-center gap-4">
        {userInfo?.profile?.avatarUrl ? (
          <img 
            src={userInfo.profile.avatarUrl} 
            alt={userName} 
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/40 shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-black text-primary border border-primary/20 shadow-sm">
            {userInitial}
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-color)] m-0">
            Xin chào, {userName || "Alex"}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30 rounded-full">
              <Zap className="w-3 h-3 fill-current" />
              {displayGoal}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Đã tập hôm nay
              </span>
            )}
          </div>
        </div>
      </div>
      
      {isCompleted ? (
        <button 
          onClick={() => navigate(`${paths.todayWorkout}?dayId=${workout.id}`)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/40 text-[var(--text-color)] font-extrabold text-sm rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <Play className="w-4 h-4 text-primary fill-primary" />
          Tập thêm
        </button>
      ) : hasWorkout ? (
        <button 
          onClick={() => navigate(`${paths.todayWorkout}?dayId=${workout.id}`)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-black font-extrabold text-sm rounded-2xl hover:bg-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-md shadow-primary/10 cursor-pointer w-full sm:w-auto border-0"
        >
          <Play className="w-4 h-4 fill-current" />
          Bắt đầu tập hôm nay
        </button>
      ) : (
        <button 
          onClick={() => navigate(paths.myPlan)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--bg-color)] border border-[var(--border-color)] hover:border-primary/40 text-[var(--text-color)] font-extrabold text-sm rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <CalendarPlus className="w-4 h-4 text-primary" />
          {isRest ? "Xem lộ trình" : "Tạo lịch tập"}
        </button>
      )}
    </div>
  );
}

export default GreetingBanner;
