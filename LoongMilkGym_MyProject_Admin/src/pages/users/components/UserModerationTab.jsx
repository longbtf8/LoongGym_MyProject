import React from "react";
import { Clock, ShieldAlert } from "lucide-react";

export default function UserModerationTab({ detail }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 animate-reactions-in">
      
      {/* Lock/unlock logs */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)]/30 pb-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Lịch sử hoạt động khóa/mở
        </h4>
        {(!detail.auditLogs || detail.auditLogs.length === 0) ? (
          <p className="text-xs font-semibold text-[var(--text-muted)] italic py-2">Chưa có lịch sử kỷ luật.</p>
        ) : (
          <div className="space-y-3">
            {detail.auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/30 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-black text-[var(--text-muted)]">
                  <span className="uppercase text-indigo-400">{log.action}</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
                <p className="text-xs font-bold text-[var(--text-color)]">
                  {log.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reported posts */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)]/30 pb-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Bài viết bị báo cáo
        </h4>
        {(!detail.reportedPosts || detail.reportedPosts.length === 0) ? (
          <p className="text-xs font-semibold text-[var(--text-muted)] italic py-2">Không có bài viết nào bị báo cáo.</p>
        ) : (
          <div className="space-y-3">
            {detail.reportedPosts.map((report) => (
              <div key={report.id} className="p-3.5 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/30 space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    report.status === "pending" 
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    {report.status === "pending" ? "Đang chờ duyệt" : "Đã xử lý"}
                  </span>
                  <span className="text-[9px] font-bold text-[var(--text-muted)]">{formatDate(report.createdAt)}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-[10px] font-extrabold text-[var(--text-muted)]">Bài viết gốc:</p>
                  <p className="font-semibold text-[var(--text-color)] italic bg-[var(--border-color)]/25 p-2 rounded-lg line-clamp-2">
                    {report.post?.content || "[Không có nội dung chữ]"}
                  </p>
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-[var(--text-muted)]">Lý do báo cáo: </span>
                  <span className="font-bold text-rose-400">{report.reason || "Không có lý do chi tiết"}</span>
                </div>
                <div className="text-[10px] font-bold text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]/20">
                  Người báo cáo: {report.reporter?.profile?.fullName || report.reporter?.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
