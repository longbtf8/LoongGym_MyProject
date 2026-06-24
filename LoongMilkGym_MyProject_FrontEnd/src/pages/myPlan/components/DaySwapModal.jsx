import React, { useEffect } from "react";
import { RefreshCw, Calendar, CheckCircle2 } from "lucide-react";

const getLocalDateString = (dateInput = new Date()) => {
  if (typeof dateInput === "string" && dateInput.includes("T")) {
    return dateInput.split("T")[0];
  }
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekdayLabel = (dateInput) => {
  const dateKey = getLocalDateString(dateInput);
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const labels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return labels[date.getDay()];
};

const formatDateOnly = (dateInput) => {
  const dateKey = getLocalDateString(dateInput);
  const [, month, day] = dateKey.split("-");
  return `${day}/${month}`;
};

export default function DaySwapModal({ 
  isOpen, 
  onClose, 
  daysList, 
  selectedDayId, 
  onSwap, 
  isPending 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDay = daysList.find(d => d.id === selectedDayId);
  
  // Filter candidates: must not be the selected day, and must not be completed
  const candidates = daysList.filter(
    (d) => d.id !== selectedDayId && d.status !== "completed"
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4 animate-fade-in">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-4 w-full max-w-[380px] max-h-[75vh] flex flex-col gap-3 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 text-primary">
            <RefreshCw className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider m-0">Hoán đổi ngày tập</h3>
          </div>
          <button 
            onClick={onClose}
            disabled={isPending}
            className="text-[var(--text-muted)] hover:text-[var(--text-color)] text-sm font-bold border-0 bg-transparent cursor-pointer disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Current Day Info Box */}
        {currentDay && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-2.5 text-xs">
            <div className="text-[9px] text-primary font-bold uppercase tracking-wider">Ngày đang chọn:</div>
            <div className="font-extrabold text-[var(--text-color)] mt-0.5 flex justify-between items-center">
              <span>{getWeekdayLabel(currentDay.scheduledDate)} {formatDateOnly(currentDay.scheduledDate)} - {currentDay.title}</span>
              <span className={`px-2 py-0.5 text-[8px] font-black rounded-full ${
                currentDay.status === "rest" 
                  ? "bg-blue-500/25 text-blue-400 border border-blue-500/25" 
                  : "bg-amber-500/25 text-amber-400 border border-amber-500/25"
              }`}>
                {currentDay.status === "rest" ? "Ngày nghỉ" : "Ngày tập"}
              </span>
            </div>
          </div>
        )}

        <div className="text-[10px] text-[var(--text-muted)] leading-relaxed px-1">
          Chọn một ngày khác dưới đây để đổi chỗ lịch tập/ngày nghỉ. <b>Ngày đã hoàn thành sẽ không thể đổi.</b>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5 no-scrollbar">
          {candidates.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--text-muted)]">
              Không có ngày nào khả dụng để hoán đổi.
            </div>
          ) : (
            candidates.map((day, index) => {
              const dateStr = formatDateOnly(day.scheduledDate);
              const weekday = getWeekdayLabel(day.scheduledDate);
              const isRest = day.status === "rest";

              return (
                <div 
                  key={day.id}
                  className="flex justify-between items-center p-2.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl hover:border-primary/50 transition duration-150"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex flex-col items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg w-10 h-10 shrink-0">
                      <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">{weekday}</span>
                      <span className="text-[11px] font-black text-[var(--text-color)]">{dateStr}</span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="text-2xs font-extrabold text-[var(--text-color)] truncate m-0">{day.title}</h4>
                      <span className={`inline-block px-1.5 py-0.2 mt-1 text-[7px] font-bold rounded-full ${
                        isRest 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {isRest ? "Nghỉ phục hồi" : "Ngày tập"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSwap(day.id)}
                    disabled={isPending}
                    className="px-2.5 py-1 bg-primary text-black rounded-lg text-[10px] font-black hover:bg-primary-hover transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    Chọn
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
