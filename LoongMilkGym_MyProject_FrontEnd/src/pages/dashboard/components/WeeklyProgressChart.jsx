import React from "react";

function WeeklyProgressChart() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
      <h3 className="text-xs sm:text-sm font-black text-[var(--text-color)] tracking-wider uppercase mb-5">Tiến độ tuần này</h3>
      
      {/* Biểu đồ cột */}
      <div className="flex items-end justify-between h-36 pt-2 px-1">
        {[
          { label: "T2", val: 35, active: false },
          { label: "T3", val: 55, active: false },
          { label: "T4", val: 85, active: true }, // Ngày hiện tại active như mockup
          { label: "T5", val: 15, active: false },
          { label: "T6", val: 8, active: false },
          { label: "T7", val: 0, active: false },
          { label: "CN", val: 0, active: false },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-4.5 sm:w-6 bg-[var(--bg-color)] rounded-full border border-[var(--border-color)] h-24 flex items-end overflow-hidden">
              <div 
                style={{ height: `${item.val}%` }}
                className={`w-full rounded-full transition-all duration-500 ${
                  item.active 
                    ? "bg-primary shadow-[0_0_12px_rgba(204,255,0,0.5)]" 
                    : "bg-neutral-300 dark:bg-neutral-800"
                }`}
              />
            </div>
            <span className={`text-[10px] font-bold ${item.active ? "text-primary font-black" : "text-[var(--text-muted)]"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyProgressChart;
