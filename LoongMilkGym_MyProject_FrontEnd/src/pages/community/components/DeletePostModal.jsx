import { Trash2 } from "lucide-react";

export default function DeletePostModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scale-up text-left">
        <div className="flex items-center gap-3 text-rose-500">
          <Trash2 className="w-5 h-5 shrink-0" />
          <h3 className="text-base font-black tracking-tight text-[var(--text-color)]">
            Xóa bài đăng
          </h3>
        </div>

        <p className="text-xs text-[var(--text-muted)] font-semibold leading-relaxed">
          Bạn có chắc chắn muốn xóa bài viết này không? Hành động này sẽ xóa vĩnh viễn bài đăng và không thể hoàn tác.
        </p>

        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/35 transition-all cursor-pointer bg-transparent"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="h-10 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md shadow-rose-500/10 border-0"
          >
            Xóa bài
          </button>
        </div>
      </div>
    </div>
  );
}

