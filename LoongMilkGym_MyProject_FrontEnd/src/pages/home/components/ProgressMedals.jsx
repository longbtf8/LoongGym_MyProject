import React from "react";
import { Award, CheckCircle, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import paths from "@/config/path";

function ProgressMedals() {
  const navigate = useNavigate();

  const days = [
    { name: "Hai", active: true, value: 80 },
    { name: "Ba", active: true, value: 100 },
    { name: "Tư", active: true, value: 90 },
    { name: "Năm", active: false, value: 0 },
    { name: "Sáu", active: true, value: 70 },
    { name: "Bảy", active: false, value: 0 },
    { name: "CN", active: false, value: 0 },
  ];

  return (
    <section className="w-full py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI: TIẾN ĐỘ HÀNG TUẦN (8/12 cols) */}
        <div className="lg:col-span-7 flex flex-col p-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight">
                Tiến độ hàng tuần
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Lịch trình tập luyện được duy trì đều đặn.
              </p>
            </div>
            
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-500/20 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25 rounded-full">
              Hoàn thành
            </span>
          </div>

          {/* Biểu đồ tiến độ */}
          <div className="flex items-end justify-between gap-4 h-32 pt-4 border-b border-[var(--border-color)] pb-3">
            {days.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Thanh tiến trình */}
                <div className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] h-full rounded-lg overflow-hidden flex items-end">
                  <div 
                    style={{ height: `${day.value}%` }}
                    className={`w-full rounded-md transition-all duration-700 ${
                      day.active ? "bg-primary" : "bg-transparent"
                    }`}
                  />
                </div>
                
                {/* Label ngày */}
                <span className="text-[10px] font-black text-[var(--text-muted)] group-hover:text-[var(--text-color)] transition-colors duration-200">
                  {day.name}
                </span>

                {/* Tooltip */}
                {day.active && (
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-md">
                    {day.value}% Calo
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
              <CheckCircle className="w-4 h-4 text-green-500" />
              4/7 Ngày hoàn thành
            </div>
            <button 
              onClick={() => navigate(paths.dashboard)}
              className="text-xs font-black text-[var(--text-primary)] hover:opacity-85 flex items-center gap-0.5 cursor-pointer bg-transparent border-0"
            >
              Chi tiết lịch tập
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: HUY HIỆU / THÀNH TỰU (5/12 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-color)] border border-[var(--border-color)] rounded-[2rem] shadow-sm">
          <div className="flex flex-col items-center text-center p-2">
            {/* Shiny Medal Icon */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-[var(--bg-secondary)] flex items-center justify-center text-[9px] font-black text-white">
                1
              </div>
            </div>

            <h3 className="text-lg font-black text-[var(--text-color)] m-0 leading-tight mb-2">
              Kỷ lục tập luyện tuần
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[240px]">
              Bạn đã hoàn thành xuất sắc tất cả các mục tiêu đề ra cho tuần tập luyện vừa qua!
            </p>
          </div>

          <button
            onClick={() => navigate(paths.dashboard)}
            className="w-full mt-6 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-primary/45 text-[var(--text-color)] font-extrabold text-xs rounded-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shadow-sm cursor-pointer"
          >
            Xem kho thành tích
          </button>
        </div>

      </div>
    </section>
  );
}

export default ProgressMedals;
