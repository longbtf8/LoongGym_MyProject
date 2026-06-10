import { useState } from "react";
import { Activity, Sparkles } from "lucide-react";

// AnalysisSidebar: Component cột bên phải hiển thị phân tích dinh dưỡng bữa ăn, biểu đồ khối lượng tập luyện tuần, và nút xác nhận hoàn thành buổi tập của ngày
export default function AnalysisSidebar({
  stats,
  dayDetails,
  weekDays,
  selectedDayId,
  exercises,
  isCompleting,
  isPending,
  onCompleteWorkout,
  showToast
}) {
  // nutritionMacro: State lưu dữ liệu dinh dưỡng mô phỏng (Placeholder)
  const [nutritionMacro, setNutritionMacro] = useState({
    protein: 95,
    proteinTarget: 140,
    carbs: 180,
    carbsTarget: 220,
    fat: 48,
    fatTarget: 65
  });
  const [nutritionInput, setNutritionInput] = useState("");

  // handleNutritionSubmit: Phân tích món ăn và cộng dồn dinh dưỡng mô phỏng khi người dùng nhấn Enter
  const handleNutritionSubmit = (e) => {
    if (e.key === "Enter" && nutritionInput.trim()) {
      showToast("Đang phân tích món ăn...");
      setTimeout(() => {
        setNutritionMacro(prev => ({
          ...prev,
          protein: Math.min(prev.proteinTarget, prev.protein + Math.floor(Math.random() * 25) + 5),
          carbs: Math.min(prev.carbsTarget, prev.carbs + Math.floor(Math.random() * 35) + 10),
          fat: Math.min(prev.fatTarget, prev.fat + Math.floor(Math.random() * 10) + 2)
        }));
        setNutritionInput("");
        showToast("Đã cập nhật dinh dưỡng từ bữa ăn!");
      }, 1000);
    }
  };

  // Compute real volume data from metadata.customExercises for completed days
  const volumeData = weekDays.map((wd, index) => {
    const isCurrent = wd.id === selectedDayId;
    let volume = 0;
    
    if (wd.status === "completed") {
      const dayExercises = isCurrent ? exercises : (wd.metadata?.customExercises || []);
      if (dayExercises.length > 0) {
        volume = dayExercises.reduce((acc, ex) => {
          const sets = ex.sets || 3;
          const reps = ex.repsMax || ex.repsMin || 10;
          const weight = ex.weightKg || 0;
          return acc + (sets * reps * weight);
        }, 0);
      }
    }

    return {
      label: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index],
      volume: Math.round(volume),
      isCurrent
    };
  });

  const maxVolume = Math.max(...volumeData.map(v => v.volume), 1);

  const scheduledDateStr = dayDetails?.day?.scheduledDate;
  const todayStr = new Date().toISOString().split("T")[0];
  const datePart = scheduledDateStr ? scheduledDateStr.split("T")[0] : "";
  const isPast = datePart && datePart < todayStr;
  const isFuture = datePart && datePart > todayStr;

  const isCompletedOrPast = dayDetails?.day?.status === "completed" || isPast;
  const isRest = dayDetails?.day?.status === "rest";

  const isButtonDisabled = isCompleting || isCompletedOrPast || isRest || isFuture || isPending;

  let buttonText = "Hoàn tất buổi tập";
  if (isCompletedOrPast) {
    buttonText = "Đã hoàn thành";
  } else if (isRest) {
    buttonText = "Ngày nghỉ";
  } else if (isFuture) {
    buttonText = "Chưa đến ngày tập";
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-3 flex flex-col gap-2.5 self-start w-full">
      <div className="text-[11px] font-black border-b border-[var(--border-color)] pb-1 mb-0.5 uppercase flex items-center gap-1.5">
        <Activity className="w-4 h-4 text-primary" />
        <span>Phân tích Buổi tập</span>
      </div>

      {/* Lifetime Stats */}
      <div className="flex gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-2.5 mb-2 shadow-sm">
        <div className="flex-1 text-center border-r border-[var(--border-color)] pr-1">
          <div className="text-[8px] text-[var(--text-muted)] font-black uppercase">Số buổi đã tập</div>
          <div className="text-xs font-black text-primary mt-0.5">{stats.totalWorkoutDays} ngày</div>
        </div>
        <div className="flex-1 text-center pl-1">
          <div className="text-[8px] text-[var(--text-muted)] font-black uppercase">Lượng Calo đã đốt</div>
          <div className="text-xs font-black text-primary mt-0.5">{stats.totalCaloriesBurned} kcal</div>
        </div>
      </div>

      {/* Muscle Activation */}
      <div>
        <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase mb-1.5">Kích hoạt Cơ bắp</h4>
        {dayDetails?.muscleMapUrl ? (
          <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-color)] p-1 flex justify-center items-center">
            <img src={dayDetails.muscleMapUrl} alt="Bản đồ cơ" className="max-h-[110px] w-auto object-contain" />
          </div>
        ) : (
          <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-color)] p-1 flex justify-center items-center py-4 text-center text-xs text-[var(--text-muted)]">
            Nghỉ ngơi
          </div>
        )}
      </div>

      {/* Volume Load Chart */}
      <div>
        <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase mb-1.5">Tổng Khối lượng Tập (Volume)</h4>
        <div className="flex justify-between items-end h-[75px] p-1.5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl">
          {volumeData.map((v, i) => {
            const barHeight = v.volume > 0 ? (v.volume / maxVolume) * 80 : 8;
            return (
              <div key={i} className="flex flex-col items-center flex-1">
                <div 
                  className={`w-full max-w-[10px] rounded-t transition-all duration-300 ${v.isCurrent ? "bg-primary shadow-[0_0_8px_rgba(204,255,0,0.5)]" : "bg-[var(--border-color)]"}`}
                  style={{ height: `${barHeight}%` }}
                  title={`${v.volume} kg`}
                />
                <span className="text-[7px] font-bold text-[var(--text-muted)] mt-0.5">{v.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nutrition Circular Rings */}
      <div>
        <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase mb-1.5">Dinh dưỡng (Hôm nay)</h4>
        <div className="grid grid-cols-3 gap-0.5 text-center">
          <div className="flex flex-col items-center">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-[var(--bg-color)] stroke-[4px] fill-none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-primary stroke-[4px] stroke-linecap-round fill-none" strokeDasharray={`${(nutritionMacro.protein / nutritionMacro.proteinTarget) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[8px] font-black">{Math.round((nutritionMacro.protein / nutritionMacro.proteinTarget) * 100)}%</span>
            </div>
            <span className="text-[7px] font-bold text-[var(--text-muted)] mt-0.5">Đạm: {nutritionMacro.protein}g</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-[var(--bg-color)] stroke-[4px] fill-none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-primary stroke-[4px] stroke-linecap-round fill-none" style={{ stroke: "#60a5fa" }} strokeDasharray={`${(nutritionMacro.carbs / nutritionMacro.carbsTarget) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[8px] font-black">{Math.round((nutritionMacro.carbs / nutritionMacro.carbsTarget) * 100)}%</span>
            </div>
            <span className="text-[7px] font-bold text-[var(--text-muted)] mt-0.5">Carb: {nutritionMacro.carbs}g</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                <path className="stroke-[var(--bg-color)] stroke-[4px] fill-none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="stroke-primary stroke-[4px] stroke-linecap-round fill-none" style={{ stroke: "#f59e0b" }} strokeDasharray={`${(nutritionMacro.fat / nutritionMacro.fatTarget) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[8px] font-black">{Math.round((nutritionMacro.fat / nutritionMacro.fatTarget) * 100)}%</span>
            </div>
            <span className="text-[7px] font-bold text-[var(--text-muted)] mt-0.5">Béo: {nutritionMacro.fat}g</span>
          </div>
        </div>

        <div className="relative mt-2.5">
          <input
            type="text"
            placeholder="Nhập bữa ăn thêm..."
            value={nutritionInput}
            onChange={(e) => setNutritionInput(e.target.value)}
            onKeyDown={handleNutritionSubmit}
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl py-1.5 pl-2.5 pr-8 text-xs outline-none text-[var(--text-color)] h-8"
          />
          <Sparkles 
            className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>
      </div>

      <button
        onClick={onCompleteWorkout}
        disabled={isButtonDisabled}
        className="w-full py-2 bg-primary text-black rounded-xl text-xs font-black cursor-pointer transition active:scale-95 disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed"
      >
        {buttonText}
      </button>
    </div>
  );
}
