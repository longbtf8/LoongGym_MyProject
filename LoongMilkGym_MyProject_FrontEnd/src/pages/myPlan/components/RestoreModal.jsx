import React, { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function RestoreModal({ isOpen, onClose, onConfirm, isPending }) {
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
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-5 w-full max-w-[340px] flex flex-col gap-3 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 self-center">
          <RotateCcw className="w-5 h-5" />
        </div>
        <div className="text-center">
          <h3 className="font-extrabold text-sm text-[var(--text-color)]">Xác nhận khôi phục lịch</h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
            Mọi bài tập bạn đã chỉnh sửa, thêm hoặc xoá trên lịch tập ngày hôm nay sẽ bị mất và quay về danh sách bài tập ban đầu của giáo án. Bạn có chắc chắn muốn khôi phục?
          </p>
        </div>
        <div className="flex gap-2.5 pt-1.5">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-9 rounded-xl border border-[var(--border-color)] text-[var(--text-color)] text-[10px] font-bold hover:bg-[var(--bg-color)] cursor-pointer disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-9 rounded-xl bg-rose-600 text-white text-[10px] font-black hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
          >
            {isPending ? "Đang khôi phục..." : "Khôi phục"}
          </button>
        </div>
      </div>
    </div>
  );
}
