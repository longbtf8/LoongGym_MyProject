import React from "react";
import { 
  X, AlertTriangle, ShieldAlert, Heart, MessageSquare, Flag, 
  User, Calendar, Clock, AlertCircle, EyeOff, Trash2, Shield,
  CheckCircle2, Ban, Eye, Loader2
} from "lucide-react";
import { useGetReportDetailQuery, useModeratePostMutation } from "@/services/admin/adminApi";
import StatusBadge from "@/components/common/StatusBadge";

export default function ReportDetailDrawer({ reportId, isOpen, onClose, onResolveClick, showToast }) {
  const { data, isLoading, isError, refetch } = useGetReportDetailQuery(reportId, {
    skip: !reportId || !isOpen,
  });
  const [moderatePost, { isLoading: isRestoring }] = useModeratePostMutation();

  const handleRestorePost = async () => {
    if (!report?.post?.id) return;
    try {
      await moderatePost({ id: report.post.id, action: "RESTORE" }).unwrap();
      if (showToast) {
        showToast("Khôi phục bài viết thành công!", "success");
      }
      refetch();
    } catch (err) {
      console.error("Lỗi khôi phục bài viết:", err);
      if (showToast) {
        showToast(err?.data?.message || "Đã xảy ra lỗi khi khôi phục bài viết.", "error");
      }
    }
  };
  if (!isOpen) return null;

  const report = data?.data;

  // Build a unified list of all reports for this post
  const allReports = [];
  if (report) {
    // Current report first
    allReports.push({
      id: report.id,
      reporterName: report.reporter?.fullName || report.reporter?.email || "Người dùng",
      reporterAvatarUrl: report.reporter?.avatarUrl,
      reason: report.reason,
      createdAt: report.createdAt
    });
    // Secondary reports
    if (report.otherReportsOfThisPost) {
      report.otherReportsOfThisPost.forEach(or => {
        allReports.push({
          id: or.id,
          reporterName: or.reporterName,
          reporterAvatarUrl: or.reporterAvatarUrl,
          reason: or.reason,
          createdAt: or.createdAt
        });
      });
    }
  }

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status mappings
  const getReportStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ";
      case "REVIEWING":
        return "Đang xem xét";
      case "RESOLVED":
        return "Đã xử lý";
      case "DISMISSED":
        return "Đã bỏ qua";
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-[var(--bg-secondary)] border-l border-[var(--border-color)]/60 shadow-2xl flex flex-col h-full z-10 animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]/60 bg-[var(--bg-color)]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl border border-[var(--color-primary)]/20">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)]">
                Chi tiết báo cáo vi phạm
              </h2>
              <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5">
                ID: {reportId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--border-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider">Đang tải thông tin báo cáo...</p>
          </div>
        ) : isError || !report ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <h3 className="text-sm font-black text-[var(--text-color)]">Lỗi tải dữ liệu</h3>
            <p className="text-xs font-bold text-[var(--text-muted)] max-w-xs">
              Báo cáo này không tồn tại hoặc đã có lỗi kết nối xảy ra. Vui lòng đóng drawer và thử lại.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 flex">
            {/* LEFT COLUMN: The reported Post */}
            <div className="flex-1 border-r border-[var(--border-color)]/40 p-6 overflow-y-auto no-scrollbar space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/40">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Nội dung bị báo cáo
                </span>
                <div className="flex gap-2">
                  {report.post?.moderationStatus === 'HIDDEN' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-extrabold uppercase">
                      ĐÃ ẨN BỞI ADMIN
                    </span>
                  )}
                  {report.post?.moderationStatus === 'REMOVED' && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-extrabold uppercase">
                      ĐÃ XÓA BỞI ADMIN
                    </span>
                  )}
                  {report.post?.moderationStatus === 'VISIBLE' && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-extrabold uppercase">
                      ĐANG HIỂN THỊ
                    </span>
                  )}
                </div>
              </div>

              {/* Author Header */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/80 shadow-sm">
                {report.postAuthor?.avatarUrl ? (
                  <img 
                    src={report.postAuthor.avatarUrl} 
                    alt={report.postAuthor.fullName || "User Avatar"} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--border-color)]/60 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--border-color)] flex items-center justify-center text-sm font-black text-[var(--text-color)] ring-2 ring-[var(--border-color)]/60 flex-shrink-0">
                    {report.postAuthor?.fullName?.charAt(0).toUpperCase() || report.postAuthor?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-[var(--text-color)] truncate">
                    {report.postAuthor?.fullName}
                  </h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">
                    {report.postAuthor?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Đăng lúc
                  </p>
                  <p className="text-[10px] font-bold text-[var(--text-color)] mt-0.5">
                    {formatDate(report.post?.createdAt)}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                <div className="p-4.5 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/85 text-xs font-semibold text-[var(--text-color)] whitespace-pre-wrap leading-relaxed shadow-inner">
                  {report.post?.content || <span className="text-[var(--text-muted)] italic">Không có nội dung văn bản</span>}
                </div>

                {/* Media grid */}
                {report.post?.media && report.post.media.length > 0 && (
                  <div className={`grid gap-3 ${report.post.media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {report.post.media.map((m, idx) => (
                      <div key={m.id || idx} className="relative rounded-2xl overflow-hidden border border-[var(--border-color)]/40 group aspect-video bg-black">
                        <img 
                          src={m.mediaUrl} 
                          alt="Media bài viết" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactions Summary */}
              <div className="flex items-center gap-4 py-3 px-4.5 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/60 shadow-sm">
                <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[11px]">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                  <span>{report.post?.likesCount} Thích</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5 fill-blue-500/20" />
                  <span>{report.post?.commentsCount} Bình luận</span>
                </div>
              </div>

              {/* Recent Comments */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Bình luận gần đây (Tối đa 5)
                </p>
                {report.post?.recentComments && report.post.recentComments.length > 0 ? (
                  <div className="space-y-2">
                    {report.post.recentComments.map(c => (
                      <div key={c.id} className="p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/40 text-[11px]">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-[var(--text-color)]">{c.authorName}</span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)]">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="font-medium text-[var(--text-muted)]">{c.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] italic">
                    Chưa có bình luận nào trên bài viết này.
                  </p>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Report context & discipline log */}
            <div className="w-[380px] p-6 overflow-y-auto no-scrollbar space-y-5 bg-[var(--bg-secondary)]/80">
              
              {/* Report Information */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Chi tiết báo cáo
                </p>
                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/85 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-muted)]">Trạng thái:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                      report.status?.toUpperCase() === "PENDING" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      report.status?.toUpperCase() === "REVIEWING" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      report.status?.toUpperCase() === "RESOLVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}>
                      {getReportStatusText(report.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-muted)]">Độ ưu tiên:</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase border ${
                      (report.stats?.totalReportsOfThisPost || 1) > 3 ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      (report.stats?.totalReportsOfThisPost || 1) > 1 ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {(report.stats?.totalReportsOfThisPost || 1) > 3 ? "Khẩn cấp" :
                       (report.stats?.totalReportsOfThisPost || 1) > 1 ? "Cao" : "Trung bình"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)] text-left pr-2">Lý do chính:</span>
                    <span className="font-extrabold text-[var(--text-color)] text-right">{report.reason || "Khác"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)]">Ngày gửi:</span>
                    <span className="font-bold text-[var(--text-color)]">{formatDate(report.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* List of all reporters */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Người báo cáo ({report.stats?.totalReportsOfThisPost || 1})
                  </p>
                </div>
                <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                  {allReports.map((r, idx) => (
                    <div key={r.id || idx} className="p-3 rounded-2xl bg-[var(--bg-color)]/40 border border-[var(--border-color)]/20 text-[10px] flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--border-color)]/50 flex items-center justify-center font-bold text-[9px] text-[var(--text-color)] shrink-0 overflow-hidden">
                        {r.reporterAvatarUrl ? (
                          <img src={r.reporterAvatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          r.reporterName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between font-bold text-[var(--text-color)]">
                          <span className="truncate pr-1">{r.reporterName}</span>
                          <span className="text-[8px] text-[var(--text-muted)] shrink-0">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <p className="font-semibold text-rose-400 italic">"{r.reason || "Lý do khác"}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics & Post Author Violation Record */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Lịch sử vi phạm của người đăng
                </p>
                <div className="p-4 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)]">Trạng thái tài khoản:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      report.postAuthor?.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      report.postAuthor?.status === "SUSPENDED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}>
                      {report.postAuthor?.status === "ACTIVE" ? "Hoạt động" : report.postAuthor?.status === "SUSPENDED" ? "Khóa tạm thời" : "Bị cấm"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)]">Tổng số báo cáo bài viết:</span>
                    <span className="font-extrabold text-amber-400">{report.stats?.totalReportsOfPostAuthor} lần</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)]">Số bài viết đã bị ẩn/xóa:</span>
                    <span className="font-extrabold text-rose-500">{report.stats?.totalHiddenPostsOfPostAuthor} bài</span>
                  </div>
                  
                  {/* Past log history detail */}
                  {report.authorViolationHistory && report.authorViolationHistory.length > 0 && (
                    <div className="border-t border-[var(--border-color)]/30 pt-2.5 space-y-2">
                      <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider">Các vi phạm gần đây:</p>
                      <div className="space-y-1.5">
                        {report.authorViolationHistory.map(h => (
                          <div key={h.id} className="text-[10px] p-2 rounded-xl bg-red-500/5 border border-red-500/10">
                            <div className="flex justify-between font-bold text-red-400 mb-0.5">
                              <span>{h.action === 'SUSPEND_USER' ? 'KHÓA TÀI KHOẢN' : 'CẢNH CÁO'}</span>
                              <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[9px] font-bold text-[var(--text-muted)]">{h.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution details if already processed */}
              {(report.status === "RESOLVED" || report.status === "DISMISSED") && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Kết quả xử lý từ Admin
                  </p>
                  <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/80 space-y-2.5 text-xs">
                    <div className="flex justify-between font-bold text-emerald-400">
                      <span>Hành động:</span>
                      <span>{report.resolutionAction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Admin xử lý:</span>
                      <span className="font-bold text-[var(--text-color)]">{report.resolvedBy?.fullName || "Quản trị viên"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Thời gian:</span>
                      <span className="font-bold text-[var(--text-color)]">{formatDate(report.resolvedAt)}</span>
                    </div>
                    <div className="border-t border-[var(--border-color)]/50 pt-2 text-[10px] font-medium text-[var(--text-color)] italic bg-[var(--bg-color)] p-2 rounded-xl">
                      "{report.resolutionNotes || "Không có ghi chú nội bộ"}"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTTOM ACTIONS BAR */}
        {report && report.post?.moderationStatus !== 'VISIBLE' ? (
          <div className="p-4 border-t border-[var(--border-color)]/60 bg-[var(--bg-secondary)] flex justify-end shrink-0">
            <button
              onClick={handleRestorePost}
              disabled={isRestoring}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/10"
            >
              {isRestoring && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Khôi phục bài viết
            </button>
          </div>
        ) : (
          report && report.status?.toUpperCase() === "PENDING" && (
            <div className="p-4 border-t border-[var(--border-color)]/60 bg-[var(--bg-secondary)] flex justify-between gap-3 shrink-0">
              {/* Dismiss report */}
              <button
                onClick={() => onResolveClick("DISMISS", report)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)]/60 hover:bg-[var(--border-color)]/20 text-[var(--text-muted)] hover:text-[var(--text-color)] text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                Bỏ qua báo cáo
              </button>

              <div className="flex gap-2">
                {/* Hide Post */}
                <button
                  onClick={() => onResolveClick("HIDE_POST", report)}
                  className="px-4 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Ẩn bài
                </button>

                {/* Remove Post */}
                <button
                  onClick={() => onResolveClick("REMOVE_POST", report)}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Xóa bài
                </button>

                {/* Suspend User */}
                <button
                  onClick={() => onResolveClick("SUSPEND_USER", report)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Khóa user (3d)
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
