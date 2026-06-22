
import { useEffect } from "react";
import { Sparkles, X, Info, Plus } from "lucide-react";

export default function AIModal({ isOpen, onClose, onDemoClick }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4 animate-fade-in">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[25px] p-6 w-full max-w-[440px] flex flex-col gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-extrabold text-sm text-[var(--text-color)]">AI Form Analyzer (Bản thử nghiệm)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--bg-color)] rounded-lg text-[var(--text-muted)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3.5 py-2">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <Info className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5" />
            <div className="text-[10px] text-[var(--text-color)] leading-relaxed">
              Tính năng này cho phép bạn **tải lên hoặc quay video** buổi tập. Hệ thống AI Vision của chúng tôi sẽ phân tích quỹ đạo chuyển động, góc xương khớp và chỉ ra điểm sai form (ví dụ: lưng cong khi Deadlift, xuống chưa đủ sâu khi Squat).
            </div>
          </div>

          <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2 bg-[var(--bg-color)]/50 hover:bg-[var(--bg-color)] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black">Tải lên video tập luyện (.mp4, .mov)</span>
            <span className="text-[8px] text-[var(--text-muted)]">Dung lượng tối đa 50MB</span>
          </div>
        </div>

        <button 
          onClick={onDemoClick}
          className="w-full h-10 rounded-xl bg-primary text-black text-xs font-black hover:bg-primary-hover flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Trải nghiệm thử / Demo</span>
        </button>
      </div>
    </div>
  );
}
