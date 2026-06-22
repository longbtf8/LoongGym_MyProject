import React from "react";
import { createPortal } from "react-dom";
import { Lock, AlertCircle } from "lucide-react";

export default function AuthConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = "Yêu cầu đăng nhập",
  message = "Vui lòng đăng nhập để thực hiện hành động này. Đi đến trang đăng nhập?",
  confirmText = "Đăng nhập ngay",
  cancelText = "Để sau",
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-[2px] z-[9999999] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/80 max-w-sm w-full rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "reactionsIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Glowy Icon Container */}
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/35 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(204,255,0,0.15)] mb-4 animate-pulse">
          <Lock className="w-6 h-6" />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-black text-[var(--text-color)] tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] font-semibold mt-2.5 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/25 transition-all active:scale-95 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-black hover:bg-primary-hover text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-md shadow-primary/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
