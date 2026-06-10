import { ChevronLeft, ChevronRight, Check } from "lucide-react";

// CalendarSlider: Thanh trượt lịch hiển thị danh sách các ngày tập theo tuần (7 ngày) trong lộ trình 30 ngày
export default function CalendarSlider({
  weekDays,
  selectedDayId,
  setSelectedDayId,
  todayStr,
  weekIdx,
  daysListLength,
  onPrevWeek,
  onNextWeek
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-2 w-full">
      <button 
        onClick={onPrevWeek} 
        disabled={weekIdx === 0}
        className="w-7 h-7 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-color)] flex items-center justify-center cursor-pointer transition-all hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="flex gap-1.5">
        {weekDays.map((wd, index) => {
          const dateObj = new Date(wd.scheduledDate);
          const dayNum = dateObj.getDate();
          const isSelected = wd.id === selectedDayId;
          const isToday = wd.scheduledDate.startsWith(todayStr);
          const weekdayLabel = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index];
          let statusDot = null;
          if (wd.status === "completed") {
            statusDot = <Check className="w-2 h-2" />;
          } else if (wd.status === "rest") {
            statusDot = <span style={{ fontSize: "6px", fontWeight: "900" }}>R</span>;
          }

          return (
            <div 
              key={wd.id}
              onClick={() => setSelectedDayId(wd.id)}
              className={`w-[50px] h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer relative transition-all p-1 ${
                isSelected 
                  ? "bg-primary text-black border-primary font-extrabold shadow-[0_3px_8px_rgba(204,255,0,0.2)]" 
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-color)]"
              }`}
            >
              <span className="text-[8px] font-bold opacity-75 uppercase">{weekdayLabel}</span>
              <span className="text-xs font-black">{dayNum}</span>
              {isToday && <span className="text-[6px] font-black mt-0.5">Hôm nay</span>}
              {statusDot && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center text-[7px] text-black font-bold">
                  {statusDot}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={onNextWeek} 
        disabled={(weekIdx + 1) * 7 >= daysListLength}
        className="w-7 h-7 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-color)] flex items-center justify-center cursor-pointer transition-all hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
