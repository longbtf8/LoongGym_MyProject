import { ChevronLeft, ChevronRight, Check } from "lucide-react";

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
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 w-full select-none">
      <button 
        onClick={onPrevWeek} 
        disabled={weekIdx === 0}
        className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-color)] flex items-center justify-center cursor-pointer transition-all hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      <div className="flex gap-1 sm:gap-1.5 min-w-0">
        {weekDays.map((wd) => {
          const dateKey = getLocalDateString(wd.scheduledDate);
          const [, , dayPart] = dateKey.split("-");
          const dayNum = Number(dayPart);
          const isSelected = wd.id === selectedDayId;
          const isToday = dateKey === todayStr;
          const weekdayLabel = getWeekdayLabel(wd.scheduledDate);
          let statusDot = null;
          if (wd.status === "completed") {
            statusDot = <Check className="w-2 h-2" />;
          } else if (wd.status === "rest") {
            statusDot = <span style={{ fontSize: "6px", fontWeight: "900" }}>R</span>;
          } else if (wd.status === "skipped") {
            statusDot = <span style={{ fontSize: "6px", fontWeight: "900" }} className="text-rose-400">S</span>;
          }

          return (
            <div 
              key={wd.id}
              onClick={() => setSelectedDayId(wd.id)}
              className={`w-8.5 xs:w-9.5 sm:w-12 md:w-[50px] h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer relative transition-all p-1 shrink-0 ${
                isSelected 
                  ? "bg-primary text-black border-primary font-extrabold shadow-[0_3px_8px_rgba(204,255,0,0.2)]" 
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-color)]"
              }`}
            >
              <span className="text-[7px] sm:text-[8px] font-bold opacity-75 uppercase">{weekdayLabel}</span>
              <span className="text-2xs sm:text-xs font-black">{dayNum}</span>
              {isToday && <span className="text-[6px] font-black mt-0.5 hidden sm:block">Hôm nay</span>}
              {isToday && <span className="w-1 h-1 rounded-full bg-current mt-0.5 sm:hidden" />}
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
        className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-color)] flex items-center justify-center cursor-pointer transition-all hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
