import React, { useState, useEffect } from "react";
import { X, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";

export default function ModeratePostModal({ isOpen, onClose, onConfirm, action, post, isLoading }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (action !== "RESTORE" && (!reason || !reason.trim())) {
      setError("Vui lòng nhập lý do kiểm duyệt.");
      return;
    }
    onConfirm({ action, reason });
  };

  const getActionConfig = () => {
    switch (action) {
      case "HIDE":
        return {
          title: "Tạm ẩn bài viết",
          desc: `Bạn đang thực hiện ẩn bài viết #${post.id?.substring(0, 8)} của người dùng ${post.author?.fullName || post.author?.email}. Người dùng khác sẽ không thể xem bài viết này nữa.`,
          btnText: "Ẩn bài viết",
          btnClass: "bg-amber-500 hover:bg-amber-600 text-black",
          requireReason: true,
          icon: AlertTriangle,
          iconClass: "text-amber-500 bg-amber-500/10 border border-amber-500/20",
        };
      case "RESTORE":
        return {
          title: "Khôi phục bài viết",
          desc: `Bạn đang thực hiện khôi phục hiển thị bài viết #${post.id?.substring(0, 8)} của người dùng ${post.author?.fullName || post.author?.email}. Bài viết sẽ xuất hiện trở lại trên feed công cộng.`,
          btnText: "Khôi phục",
          btnClass: "bg-emerald-500 hover:bg-emerald-600 text-black",
          requireReason: false,
          icon: ShieldAlert,
          iconClass: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20",
        };
      case "REMOVE":
        return {
          title: "XÓA VĨNH VIỄN BÀI VIẾT",
          desc: `CẢNH BÁO: Bạn đang thực hiện XÓA CỨNG (vĩnh viễn) bài viết #${post.id?.substring(0, 8)} của người dùng ${post.author?.fullName || post.author?.email}. Hành động này sẽ xóa sạch bài viết, toàn bộ bình luận, tương tác, báo cáo, lưu trữ của nó và xóa tất cả ảnh trên Cloudinary. Hành động này KHÔNG THỂ HOÀN TÁC!`,
          btnText: "Xóa vĩnh viễn",
          btnClass: "bg-rose-500 hover:bg-rose-600 text-white font-black",
          requireReason: true,
          icon: AlertTriangle,
          iconClass: "text-rose-500 bg-rose-500/10 border border-rose-500/20 animate-pulse",
        };
      default:
        return {};
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={`p-2 rounded-xl ${config.iconClass} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)]">
              {config.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[var(--border-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-xs font-semibold leading-relaxed text-[var(--text-muted)]">
              {config.desc}
            </p>

            {config.requireReason && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Lý do kiểm duyệt <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setError("");
                  }}
                  placeholder="Nhập lý do chi tiết để gửi cho người dùng hoặc lưu nhật ký nội bộ..."
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 focus:border-[var(--color-primary)] focus:outline-none text-xs font-semibold placeholder-[var(--text-muted)]/50 text-[var(--text-color)] transition-all resize-none"
                />
                {error && <span className="text-[10px] font-extrabold text-rose-400">{error}</span>}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[var(--border-color)]/60 bg-black/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-[var(--border-color)]/60 text-xs font-black text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 disabled:opacity-50 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${config.btnClass}`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {config.btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
