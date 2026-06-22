import { useEffect } from "react";
import { Trophy, X } from "lucide-react";

export default function CompleteWorkoutModal({
  timerSeconds,
  perceivedEffort,
  setPerceivedEffort,
  sessionNotes,
  setSessionNotes,
  onComplete,
  onClose,
  isCompleting,
  formatTime,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-5 w-full max-w-[420px] flex flex-col gap-4 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base flex items-center gap-2 text-[var(--text-color)]">
            <Trophy className="w-5 h-5 text-primary" />
            Tổng kết buổi tập
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] border-0 bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-center py-2">
            <span className="text-xs text-[var(--text-muted)] font-bold">Thời gian tập luyện</span>
            <div className="text-2xl font-black text-primary mt-1">{formatTime(timerSeconds)}</div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              Độ mệt mỏi cảm nhận (RPE)
            </label>
            <div className="grid grid-cols-10 gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => setPerceivedEffort(num)}
                  className={`h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    perceivedEffort === num
                      ? "bg-primary text-black"
                      : "bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-primary"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] text-right">
              {perceivedEffort <= 4
                ? "Khá nhẹ nhàng"
                : perceivedEffort <= 7
                ? "Vừa sức / Hiệu quả"
                : "Cực kỳ mệt mỏi"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
              Ghi chú buổi tập
            </label>
            <textarea
              rows={3}
              placeholder="Ghi nhận cảm xúc, chấn thương hoặc lưu ý cho buổi sau..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl p-2 text-xs text-[var(--text-color)] outline-none resize-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-xs font-bold hover:bg-[var(--bg-color)] cursor-pointer"
          >
            Quay lại
          </button>
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="flex-1 h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover disabled:opacity-60 cursor-pointer"
          >
            {isCompleting ? "Đang lưu..." : "Xác nhận & Hoàn thành"}
          </button>
        </div>
      </div>
    </div>
  );
}
