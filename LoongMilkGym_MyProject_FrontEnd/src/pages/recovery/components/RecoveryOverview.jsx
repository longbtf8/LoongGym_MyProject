import React from "react";
import { Sparkles, Moon, Activity, Zap, Smile } from "lucide-react";

function RecoveryOverview({
  liveScore,
  recovery,
  latestMetrics,
  latestPhotos,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* LIVE RECOVERY SCORE CIRCLE */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl transition-all duration-500 group-hover:bg-primary/10" />
        <h4 className="font-extrabold text-[10px] sm:text-xs uppercase tracking-wider text-[var(--text-muted)] mb-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Điểm Phục Hồi Hôm Nay (Live)
        </h4>

        <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-[var(--border-color)]">
          <div className="absolute inset-2 rounded-full border-4 border-dashed border-primary/20 animate-spin-slow" />
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-primary tracking-tight">
              {liveScore}
            </span>
            <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider mt-0.5">
              trên 100
            </span>
          </div>
        </div>

        <div className="mt-5 w-full bg-[var(--bg-color)] p-3 rounded-2xl border border-[var(--border-color)]">
          <p className="text-xs font-bold text-[var(--text-color)] m-0">
            {liveScore >= 80 
              ? "🟢 Thể trạng xuất sắc! Cơ thể đã phục hồi hoàn toàn. Đây là thời điểm vàng để phá kỷ lục tập luyện (PR) hoặc thực hiện các buổi tập cường độ cực cao."
              : liveScore >= 60 
              ? "🟡 Phục hồi ở mức ổn định. Cơ bắp và hệ thần kinh sẵn sàng cho buổi tập thông thường. Chú ý khởi động kỹ."
              : "🔴 Chỉ số hồi phục quá thấp! Hệ thần kinh hoặc cơ bắp đang quá tải nặng. Khuyến cáo deload (giảm 50% volume) hoặc nghỉ ngơi để bảo vệ cơ thể."}
          </p>
        </div>
      </div>

      {/* LATEST RECORDED CARD */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-extrabold uppercase text-primary tracking-wider m-0">
          Chỉ số ghi nhận gần nhất
        </h3>
        
        {recovery ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-purple-400" /> Ngủ
              </span>
              <span className="text-xs font-black">{recovery.sleepHours} giờ</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" /> Đau cơ
              </span>
              <span className="text-xs font-black">{recovery.sorenessLevel}/10</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" /> Năng lượng
              </span>
              <span className="text-xs font-black">{recovery.energyLevel}/10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-orange-400" /> Căng thẳng
              </span>
              <span className="text-xs font-black">{recovery.stressLevel}/10</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)] font-semibold italic text-center py-4">
            Chưa có nhật ký phục hồi hôm nay.
          </div>
        )}
      </div>

      {/* BODY METRICS SUMMARY */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-extrabold uppercase text-primary tracking-wider m-0">
          Chỉ số cơ thể hiện tại
        </h3>
        
        {latestMetrics ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold text-[var(--text-muted)]">Cân nặng</span>
              <span className="text-xs font-black">{latestMetrics.weightKg || "--"} kg</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold text-[var(--text-muted)]">Tỷ lệ mỡ</span>
              <span className="text-xs font-black">{latestMetrics.bodyFatPercent || "--"} %</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-xs font-bold text-[var(--text-muted)]">Khối lượng cơ</span>
              <span className="text-xs font-black">{latestMetrics.muscleMassKg || "--"} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)]">Vòng eo</span>
              <span className="text-xs font-black">{latestMetrics.waistCm || "--"} cm</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)] font-semibold italic text-center py-4">
            Chưa ghi nhận số đo cơ thể.
          </div>
        )}
      </div>

      {/* LATEST PHOTOS PROGRESS */}
      {latestPhotos && latestPhotos.length > 0 && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[32px] p-6 shadow-xl flex flex-col gap-3">
          <h3 className="text-sm sm:text-base font-extrabold uppercase text-primary tracking-wider m-0">
            Ảnh tiến trình gần đây
          </h3>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {latestPhotos.slice(0, 2).map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--border-color)]">
                <img src={photo.photoUrl} alt={photo.photoType} className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                  {photo.photoType === "front" ? "Trước" : photo.photoType === "back" ? "Sau" : "Nghiêng"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecoveryOverview;
