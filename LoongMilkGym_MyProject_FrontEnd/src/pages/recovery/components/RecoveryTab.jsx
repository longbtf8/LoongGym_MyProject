import React from "react";
import { Sparkles, Moon, HelpCircle, Info, Clock, Activity, Zap, Smile, Heart } from "lucide-react";

function RecoveryTab({
  sleepHours,
  setSleepHours,
  sorenessLevel,
  setSorenessLevel,
  energyLevel,
  setEnergyLevel,
  stressLevel,
  setStressLevel,
  hrvMs,
  setHrvMs,
  restingHeartRate,
  setRestingHeartRate,
  recoveryNotes,
  setRecoveryNotes,
  bedtime,
  setBedtime,
  wakeTime,
  setWakeTime,
  showSleepCalc,
  setShowSleepCalc,
  activeInfo,
  toggleInfo,
  handleCalculateSleep,
  handleSubmitRecovery,
  isLoggingRecovery,
}) {
  return (
    <form
      onSubmit={handleSubmitRecovery}
      className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-6"
    >
      <div>
        <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Đánh Giá Cơ Thể Hômcopy Nay
        </h3>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
          Hệ thống sẽ tự động tổng hợp chỉ số phục hồi dựa trên dữ liệu bạn cung cấp.
        </p>
      </div>

      {/* SLEEP INPUT */}
      <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
        <div className="flex justify-between items-center">
          <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
            <Moon className="w-4.5 h-4.5 text-purple-400" />
            Thời gian ngủ thực tế
            <button
              type="button"
              onClick={() => toggleInfo("sleep")}
              className="p-0.5 hover:bg-primary/20 text-primary rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          <span className="text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
            {sleepHours} tiếng
          </span>
        </div>

        {activeInfo === "sleep" && (
          <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-primary/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-primary flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
              </span>
              <button
                type="button"
                onClick={() => toggleInfo("sleep")}
                className="text-[var(--text-muted)] hover:text-primary border-0 bg-transparent cursor-pointer font-bold text-xs"
              >
                Đóng
              </button>
            </div>
            👉 <strong>Giấc ngủ lý tưởng:</strong> Từ 7.5 - 9 tiếng là lý tưởng nhất (đạt 100 điểm ngủ). Thiếu ngủ cực độ (dưới 5 tiếng) làm chậm tốc độ tổng hợp cơ bắp.
          </div>
        )}

        <input
          type="range"
          min="2"
          max="14"
          step="0.5"
          value={sleepHours}
          onChange={(e) => setSleepHours(Number(e.target.value))}
          className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <span>Thiếu ngủ (2h)</span>
          <span>Tối ưu (7.5 - 9h)</span>
          <span>Quá nhiều (14h)</span>
        </div>

        <button
          type="button"
          onClick={() => setShowSleepCalc(!showSleepCalc)}
          className="self-start text-[10px] text-primary hover:underline font-bold flex items-center gap-1 border-0 bg-transparent cursor-pointer p-0"
        >
          <Clock className="w-3 h-3" />
          {showSleepCalc ? "Ẩn công cụ tính" : "Tính từ giờ ngủ & giờ dậy"}
        </button>

        {showSleepCalc && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3.5 rounded-xl flex flex-col sm:flex-row items-center gap-4 mt-2 animate-slide-up">
            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Giờ đi ngủ</span>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Giờ thức dậy</span>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-color)] outline-none focus:border-primary w-full"
              />
            </div>
            <button
              type="button"
              onClick={handleCalculateSleep}
              className="bg-primary text-black hover:bg-primary-hover px-4 py-2 rounded-xl text-xs font-black mt-4 sm:mt-5 w-full sm:w-auto border-0 cursor-pointer transition-all"
            >
              Áp Dụng
            </button>
          </div>
        )}
      </div>

      {/* SORENESS */}
      <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
        <div className="flex justify-between items-center">
          <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
            <Activity className="w-4.5 h-4.5 text-emerald-400" />
            Độ đau mỏi cơ bắp
            <button
              type="button"
              onClick={() => toggleInfo("soreness")}
              className="p-0.5 hover:bg-emerald-500/20 text-emerald-400 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          <span className="text-sm font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg">
            Mức {sorenessLevel}/10
          </span>
        </div>

        {activeInfo === "soreness" && (
          <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-emerald-500/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
              </span>
              <button
                type="button"
                onClick={() => toggleInfo("soreness")}
                className="text-[var(--text-muted)] hover:text-emerald-400 border-0 bg-transparent cursor-pointer font-bold text-xs"
              >
                Đóng
              </button>
            </div>
            👉 <strong>Đau mỏi cơ:</strong> Nhẹ (1-3) bình thường. Vừa (4-7) giảm 20% tạ. Nặng (8-10) là cơ bắp bị quá tải nặng, nên nghỉ ngơi.
          </div>
        )}

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSorenessLevel(num)}
              className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                sorenessLevel === num
                  ? "bg-emerald-500 text-black border-emerald-500 shadow-md scale-105"
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-emerald-500 hover:text-[var(--text-color)]"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* ENERGY LEVEL */}
      <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
        <div className="flex justify-between items-center">
          <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
            <Zap className="w-4.5 h-4.5 text-primary" />
            Mức năng lượng cơ thể
            <button
              type="button"
              onClick={() => toggleInfo("energy")}
              className="p-0.5 hover:bg-primary/20 text-primary rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          <span className="text-sm font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
            Mức {energyLevel}/10
          </span>
        </div>

        {activeInfo === "energy" && (
          <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-primary/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-primary flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
              </span>
              <button
                type="button"
                onClick={() => toggleInfo("energy")}
                className="text-[var(--text-muted)] hover:text-primary border-0 bg-transparent cursor-pointer font-bold text-xs"
              >
                Đóng
              </button>
            </div>
            👉 <strong>Năng lượng:</strong> Thể hiện độ phục hồi của hệ thần kinh (CNS). Mức (8-10) thích hợp tăng cường độ; (1-3) cần giảm bài tập.
          </div>
        )}

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setEnergyLevel(num)}
              className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                energyLevel === num
                  ? "bg-primary text-black border-primary shadow-md scale-105"
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-primary hover:text-[var(--text-color)]"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* STRESS LEVEL */}
      <div className="flex flex-col gap-3 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
        <div className="flex justify-between items-center">
          <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
            <Smile className="w-4.5 h-4.5 text-orange-400" />
            Mức độ căng thẳng (Stress)
            <button
              type="button"
              onClick={() => toggleInfo("stress")}
              className="p-0.5 hover:bg-orange-500/20 text-orange-400 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          <span className="text-sm font-black text-orange-400 bg-orange-400/10 px-2.5 py-0.5 rounded-lg">
            Mức {stressLevel}/10
          </span>
        </div>

        {activeInfo === "stress" && (
          <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-orange-500/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
            <div className="flex justify-between items-center mb-1">
              <span className="font-extrabold text-orange-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Giải thích thuật ngữ
              </span>
              <button
                type="button"
                onClick={() => toggleInfo("stress")}
                className="text-[var(--text-muted)] hover:text-orange-400 border-0 bg-transparent cursor-pointer font-bold text-xs"
              >
                Đóng
              </button>
            </div>
            👉 <strong>Stress:</strong> Stress tâm lý làm gia tăng Cortisol, ức chế quá trình tổng hợp cơ.
          </div>
        )}

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setStressLevel(num)}
              className={`h-9 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                stressLevel === num
                  ? "bg-orange-400 text-black border-orange-400 shadow-md scale-105"
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-orange-400 hover:text-[var(--text-color)]"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* CARDIO METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
          <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
            <Heart className="w-4.5 h-4.5 text-red-500" />
            Resting Heart Rate (RHR)
            <button
              type="button"
              onClick={() => toggleInfo("rhr")}
              className="p-0.5 hover:bg-red-500/20 text-red-500 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>
          
          {activeInfo === "rhr" && (
            <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-red-500/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
              👉 <strong>Nhịp tim nghỉ ngơi:</strong> Thường dao động từ 50-80 BPM ở vận động viên. Nhịp tim tăng đột biến (&gt;7 BPM so với trung bình) là dấu hiệu quá sức.
            </div>
          )}

          <input
            type="number"
            placeholder="Ví dụ: 65 (BPM)"
            value={restingHeartRate}
            onChange={(e) => setRestingHeartRate(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] w-full"
          />
        </div>

        <div className="flex flex-col gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl relative">
          <label className="text-xs sm:text-sm font-extrabold flex items-center gap-2 text-[var(--text-color)]">
            <Activity className="w-4.5 h-4.5 text-blue-400" />
            HRV (Heart Rate Variability)
            <button
              type="button"
              onClick={() => toggleInfo("hrv")}
              className="p-0.5 hover:bg-blue-500/20 text-blue-400 rounded-full border-0 bg-transparent cursor-pointer flex items-center justify-center"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </label>

          {activeInfo === "hrv" && (
            <div className="absolute top-12 left-4 right-4 z-20 bg-[var(--bg-secondary)] border border-blue-500/30 p-3.5 rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed shadow-xl backdrop-blur-md animate-slide-up">
              👉 <strong>HRV (ms):</strong> Đo độ dao động nhịp tim. Chỉ số cao cho thấy cơ thể sẵn sàng tập, chỉ số tụt dốc báo hiệu mệt mỏi.
            </div>
          )}

          <input
            type="number"
            placeholder="Ví dụ: 70 (ms)"
            value={hrvMs}
            onChange={(e) => setHrvMs(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] w-full"
          />
        </div>
      </div>

      {/* NOTES */}
      <div className="flex flex-col gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] p-4 rounded-2xl">
        <label className="text-xs sm:text-sm font-extrabold text-[var(--text-color)]">Ghi chú phục hồi hôm nay</label>
        <textarea
          rows="3"
          placeholder="Hôm nay cơ thể cảm thấy thế nào, có bị đau mỏi đặc biệt ở đâu không..."
          value={recoveryNotes}
          onChange={(e) => setRecoveryNotes(e.target.value)}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] focus:border-primary/65 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold outline-none text-[var(--text-color)] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isLoggingRecovery}
        className="w-full py-3 bg-primary hover:bg-primary-hover text-black font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm border-0 cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        Lưu Nhật Ký Phục Hồi
      </button>
    </form>
  );
}

export default RecoveryTab;
