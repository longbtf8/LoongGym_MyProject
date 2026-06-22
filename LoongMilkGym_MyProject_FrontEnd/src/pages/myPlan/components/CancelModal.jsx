import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useCancelActivePlanMutation } from "@/services/roadmap/roadmapApi";

// CancelModal: Component modal để xác nhận huỷ lộ trình luyện tập hiện tại
export default function CancelModal({ isOpen, onClose, onSuccess }) {
  const [cancelActivePlan, { isLoading: isCancelling }] = useCancelActivePlanMutation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // handleCancel: Gọi API để xoá lộ trình đang hoạt động của người dùng khỏi hệ thống
  const handleCancel = async () => {
    try {
      await cancelActivePlan().unwrap();
      onSuccess("Đã huỷ lộ trình. Bạn có thể chọn lộ trình mới.");
    } catch {
      onSuccess("Không thể huỷ lộ trình lúc này.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center z-[999999] p-4 animate-fade-in">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-5 w-full max-w-[340px] flex flex-col gap-3 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 self-center">
          <Trash2 className="w-5 h-5" />
        </div>
        <div className="text-center">
          <h3 className="font-extrabold text-sm text-[var(--text-color)]">Xác nhận huỷ lộ trình</h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
            Lịch tập 30 ngày và các tuỳ chỉnh của bạn sẽ bị xoá vĩnh viễn khỏi hệ thống. Bạn có chắc chắn muốn huỷ?
          </p>
        </div>
        <div className="flex gap-2.5 pt-1.5">
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-[10px] font-bold hover:bg-[var(--bg-color)] cursor-pointer"
          >
            Không, quay lại
          </button>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="flex-1 h-9 rounded-xl bg-rose-600 text-white text-[10px] font-black hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
          >
            {isCancelling ? "Đang huỷ..." : "Có, huỷ lộ trình"}
          </button>
        </div>
      </div>
    </div>
  );
}
