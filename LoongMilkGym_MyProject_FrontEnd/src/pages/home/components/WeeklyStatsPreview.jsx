import React from "react";
import { Clock, Flame, Award, ShieldAlert } from "lucide-react";

function WeeklyStatsPreview() {
  // Mock data for weekly stats graphs
  const stats = [
    {
      title: "Tổng số phút tập luyện",
      value: "180 phút",
      icon: Clock,
      color: "bg-primary text-primary",
      bars: [30, 45, 60, 20, 0, 50, 40], // Mon-Sun
      label: "Tuần này",
    },
    {
      title: "Lượng Calo đã đốt",
      value: "12,450 Kcal",
      icon: Flame,
      color: "bg-orange-500 text-orange-500",
      bars: [200, 350, 450, 150, 0, 400, 300], // Mon-Sun
      label: "Đạt 92% mục tiêu",
    },
    {
      title: "Số buổi đã hoàn thành",
      value: "4 buổi",
      icon: Award,
      color: "bg-indigo-500 text-indigo-500",
      bars: [1, 1, 1, 0, 0, 1, 0], // Mon-Sun
      label: "Đều đặn",
    },
    {
      title: "Thời gian ngủ trung bình",
      value: "7.2 giờ/ngày",
      icon: ShieldAlert,
      color: "bg-green-500 text-green-500",
      bars: [7, 6.5, 8, 7, 7.5, 6.8, 8.2], // Mon-Sun
      label: "Chất lượng tốt",
    },
  ];

  const days = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];

  return (
    <section className="w-full py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const maxVal = Math.max(...stat.bars) || 1;
          
          return (
            <div 
              key={index}
              className="flex flex-col p-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Header của Card */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-xl bg-gray-500/10 ${stat.color.split(" ")[1]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              
              {/* Giá trị chính */}
              <div className="mb-4">
                <h3 className="text-2xl font-black text-[var(--text-color)] m-0 leading-tight">
                  {stat.value}
                </h3>
                <span className="text-[11px] font-bold text-[var(--text-muted)]">
                  {stat.label}
                </span>
              </div>
              
              {/* Đồ thị cột Mini (CSS pure) */}
              <div className="flex items-end justify-between gap-1.5 h-12 mt-auto pt-2">
                {stat.bars.map((bar, barIdx) => {
                  const heightPercent = (bar / maxVal) * 100;
                  return (
                    <div 
                      key={barIdx} 
                      className="flex-1 flex flex-col items-center gap-1 group/bar relative"
                    >
                      {/* Cột đồ thị */}
                      <div 
                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                        className={`w-full rounded-t-sm transition-all duration-500 ${stat.color.split(" ")[0]} opacity-80 group-hover/bar:opacity-100`}
                      />
                      
                      {/* Tooltip khi hover */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 pointer-events-none group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-md">
                        {bar}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Labels thứ trong tuần */}
              <div className="flex items-center justify-between gap-1.5 mt-2">
                {days.map((day, idx) => (
                  <span key={idx} className="flex-1 text-center text-[9px] font-bold text-[var(--text-muted)]">
                    {day}
                  </span>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklyStatsPreview;
