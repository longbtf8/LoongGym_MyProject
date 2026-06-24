import React from "react";
import { useGetDashboardSummaryQuery } from "@/services/dashboard/dashboardApi";

function WeeklyProgressChart() {
  const { data: responseData } = useGetDashboardSummaryQuery();
  const apiStats = responseData?.data?.stats;

  const weeklyWorkoutMinutes = apiStats?.weeklyWorkoutMinutesMap || [0, 0, 0, 0, 0, 0, 0];
  const weeklyWorkoutDays = apiStats?.weeklyWorkoutDaysMap || [0, 0, 0, 0, 0, 0, 0];

  const vietnamWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
  });
  const weekdayMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const todayIdx = weekdayMap[vietnamWeekdayFormatter.format(new Date())] ?? 0;
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  const items = labels.map((label, idx) => {
    const mins = weeklyWorkoutMinutes[idx] || 0;
    const isCompleted = weeklyWorkoutDays[idx] === 1;
    // Map height based on minutes (e.g. max is 60 mins)
    const val = mins > 0 ? Math.min(100, Math.max(15, (mins / 60) * 100)) : (isCompleted ? 25 : 0);
    return {
      label,
      val,
      mins,
      isCompleted,
      active: idx === todayIdx,
    };
  });

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-5">Tiến độ tuần này</h3>
      
      {/* Biểu đồ cột */}
      <div className="flex items-end justify-between h-36 pt-2 px-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative">
            <div className="w-4.5 sm:w-6 bg-[var(--bg-color)] rounded-full border border-[var(--border-color)] h-24 flex items-end overflow-hidden relative">
              <div 
                style={{ height: `${item.val}%` }}
                className={`w-full rounded-full transition-all duration-500 ${
                  item.active 
                    ? "bg-primary shadow-[0_0_12px_rgba(204,255,0,0.5)]" 
                    : item.isCompleted
                      ? "bg-primary/60"
                      : "bg-neutral-300 dark:bg-neutral-800"
                }`}
              />
            </div>
            
            {/* Tooltip khi hover xem số phút cụ thể */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 shadow-md">
              {item.isCompleted
                ? (item.mins > 0 ? `${item.mins} phút` : "Đã tập")
                : "Chưa tập"}
            </div>

            <span className={`text-[10px] font-bold ${item.active ? "text-primary font-black scale-105" : "text-[var(--text-muted)]"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyProgressChart;
