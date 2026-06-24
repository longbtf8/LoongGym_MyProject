import React, { useState, useEffect } from "react";
import { AlertTriangle, X, ShieldAlert, Loader2 } from "lucide-react";

export default function ResolveReportModal({ isOpen, onClose, onConfirm, action, report, isLoading }) {
  if (!isOpen || !report) return null;

  const getActionDetails = () => {
    switch (action) {
      case "DISMISS":
        return {
          title: "Bỏ qua báo cáo",
          target: `Bài viết của: ${report.postAuthor?.fullName || report.postAuthor?.email}`,
          consequence: "Báo cáo sẽ được đánh dấu là Đã bỏ qua. Bài viết và tài khoản người đăng không bị ảnh hưởng.",
          colorClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          confirmColor: "bg-slate-600 hover:bg-slate-700 text-white",
          confirmText: "Bỏ qua báo cáo",
        };

      case "HIDE_POST":
        return {
          title: "Ẩn bài viết",
          target: `Bài viết ID: ${report.post?.id}`,
          consequence: "Bài viết này sẽ bị chuyển sang trạng thái ẨN (hidden). Bài viết sẽ không còn hiển thị với cộng đồng trên Feed nhưng vẫn được giữ lại trong cơ sở dữ liệu hệ thống.",
          colorClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          confirmColor: "bg-orange-500 hover:bg-orange-600 text-black",
          confirmText: "Ẩn bài viết",
        };
      case "REMOVE_POST":
        return {
          title: "Xóa mềm bài viết",
          target: `Bài viết ID: ${report.post?.id}`,
          consequence: "Bài viết sẽ bị chuyển sang trạng thái XÓA MỀM (removed). Tất cả bình luận, ảnh và lượt tương tác sẽ ẩn đi, giúp Admin có thể khôi phục lại sau này nếu cần.",
          colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          confirmColor: "bg-rose-500 hover:bg-rose-600 text-white",
          confirmText: "Xóa bài viết",
        };
      case "SUSPEND_USER":
        return {
          title: "Khóa người đăng (3 ngày)",
          target: `Thành viên: ${report.postAuthor?.fullName || report.postAuthor?.email}`,
          consequence: "Khóa tài khoản tạm thời trong 3 ngày. Người đăng sẽ bị đăng xuất khỏi toàn bộ thiết bị ngay lập tức (thu hồi Token) và bài viết vi phạm này sẽ tự động bị ẩn.",
          colorClass: "bg-red-500/10 text-red-400 border-red-500/20",
          confirmColor: "bg-red-600 hover:bg-red-700 text-white",
          confirmText: "Khóa tài khoản",
        };
      default:
        return {
          title: "Xử lý báo cáo",
          target: "",
          consequence: "",
          colorClass: "bg-[var(--border-color)]/20 text-[var(--text-color)]",
          confirmColor: "bg-[var(--color-primary)] text-black",
          confirmText: "Xác nhận",
        };
    }
  };

  const details = getActionDetails();

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ action });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl p-6 shadow-2xl z-10 animate-scale-up">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--border-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border-color)]/60 pb-4 mb-4">
          <div className={`p-2.5 rounded-2xl ${details.colorClass} border`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)]">
              {details.title}
            </h3>
            <p className="text-[11px] font-bold text-[var(--text-muted)] mt-0.5">
              Đối tượng: {details.target}
            </p>
          </div>
        </div>

        {/* Content & Warning */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-black/30 border border-[var(--border-color)]/40 space-y-2">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Bài viết bị báo cáo:</p>
            <p className="text-xs text-[var(--text-color)] font-medium italic line-clamp-2 bg-[var(--bg-color)]/40 p-2.5 rounded-xl">
              "{report.post?.content || "Không có nội dung văn bản"}"
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3 text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold leading-normal">
              {details.consequence}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[var(--border-color)]/50 hover:bg-[var(--border-color)] text-[var(--text-color)] text-xs font-extrabold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${details.confirmColor} disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {details.confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
