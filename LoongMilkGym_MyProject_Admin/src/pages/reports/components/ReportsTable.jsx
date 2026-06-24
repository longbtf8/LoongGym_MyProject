import React from "react";
import { AlertCircle, FileText } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";

export default function ReportsTable({
  reportsList,
  isLoading,
  onOpenDetail,
  formatDateStr,
  search,
  reason,
  dateFrom,
  dateTo,
  pagination,
  currentPage,
  limit,
  onPageChange
}) {
  const getPriorityInfo = (reportCount) => {
    if (reportCount >= 6) {
      return { label: "Khẩn cấp", color: "bg-red-500/10 text-red-400 border border-red-500/20" };
    } else if (reportCount >= 4) {
      return { label: "Cao", color: "bg-orange-500/10 text-orange-400 border border-orange-500/20" };
    } else if (reportCount >= 2) {
      return { label: "Trung bình", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" };
    } else {
      return { label: "Thấp", color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" };
    }
  };

  const getReportStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return "Chờ xử lý";
      case "REVIEWING": return "Xem xét";
      case "RESOLVED": return "Đã xử lý";
      case "DISMISSED": return "Đã bỏ qua";
      default: return status;
    }
  };

  return (
    <div className="rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-black/10">

              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Nội dung bài viết</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Người đăng</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Người báo cáo</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Lý do</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Báo cáo trùng</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Trạng thái</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Ngày gửi</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]/40">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">

                  <td className="p-4">
                    <div className="flex gap-2">
                      <div className="w-10 h-10 bg-[var(--border-color)]/60 rounded-lg" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-32 bg-[var(--border-color)]/60 rounded" />
                        <div className="h-3 w-16 bg-[var(--border-color)]/40 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><div className="h-8 w-24 bg-[var(--border-color)]/60 rounded-lg" /></td>
                  <td className="p-4"><div className="h-8 w-24 bg-[var(--border-color)]/60 rounded-lg" /></td>
                  <td className="p-4"><div className="h-4 w-28 bg-[var(--border-color)]/60 rounded" /></td>
                  <td className="p-4 text-center"><div className="h-5 w-10 bg-[var(--border-color)]/60 rounded mx-auto" /></td>
                  <td className="p-4"><div className="h-5 w-16 bg-[var(--border-color)]/60 rounded-full" /></td>
                  <td className="p-4"><div className="h-4 w-20 bg-[var(--border-color)]/60 rounded" /></td>
                  <td className="p-4 text-center"><div className="h-8 w-20 bg-[var(--border-color)]/60 rounded-xl mx-auto" /></td>
                </tr>
              ))
            ) : reportsList.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <AlertCircle className="w-12 h-12 text-[var(--text-muted)]/60" />
                    <p className="text-xs font-black uppercase tracking-wider">
                      {search || reason || dateFrom || dateTo
                        ? "Không tìm thấy báo cáo phù hợp với bộ lọc."
                        : "Hiện không có báo cáo nào cần xử lý."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reportsList.map((rep) => {
                const upperStatus = rep.status?.toUpperCase();
                return (
                  <tr 
                    key={rep.id} 
                    className="hover:bg-black/10 transition-colors group cursor-pointer"
                    onClick={() => onOpenDetail(rep.id)}
                  >

                    {/* Content & thumbnail */}
                    <td className="p-4 max-w-[280px]">
                      <div className="flex gap-2.5">
                        {rep.post?.firstImageUrl ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-color)] bg-black">
                            <img 
                              src={rep.post.firstImageUrl} 
                              alt="Post thumbnail" 
                              className="w-full h-full object-cover"
                            />
                            {rep.post.mediaCount > 1 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black text-white">
                                +{rep.post.mediaCount - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[var(--border-color)]/40 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0 border border-[var(--border-color)]/60">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--text-color)] line-clamp-2 leading-relaxed italic">
                            "{rep.post?.content || "Không có nội dung chữ"}"
                          </p>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                            <span>Post ID: {rep.post?.id?.substring(0, 8)}...</span>
                            {rep.post?.moderationStatus === 'HIDDEN' && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-extrabold uppercase">Đã ẩn</span>
                            )}
                            {rep.post?.moderationStatus === 'REMOVED' && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-extrabold uppercase">Đã xóa</span>
                            )}
                            {rep.post?.moderationStatus === 'VISIBLE' && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-extrabold uppercase">Hiển thị</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Post Author */}
                    <td className="p-4">
                      <div className="min-w-0 max-w-[130px]">
                        <p className="text-xs font-bold text-[var(--text-color)] truncate">{rep.postAuthor?.fullName}</p>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] truncate">{rep.postAuthor?.email}</p>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="p-4">
                      <div className="min-w-0 max-w-[130px]">
                        <p className="text-xs font-bold text-[var(--text-color)] truncate">{rep.reporter?.fullName}</p>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] truncate">{rep.reporter?.email}</p>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="p-4 text-xs font-bold text-rose-400 max-w-[120px] truncate">
                      {rep.reason || "Lý do khác"}
                    </td>

                    {/* Duplicate reports count */}
                    <td className="p-4 text-center text-xs font-black text-[var(--text-color)]">
                      {rep.stats?.totalReportsOfThisPost > 1 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-extrabold text-[10px]">
                          +{rep.stats.totalReportsOfThisPost - 1}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">-</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="p-4 text-xs">
                      <StatusBadge 
                        status={upperStatus} 
                        type={
                          upperStatus === "PENDING" ? "warning" :
                          upperStatus === "RESOLVED" ? "success" : "neutral"
                        }
                        customLabel={getReportStatusText(rep.status)}
                      />
                    </td>

                    {/* Date reported */}
                    <td className="p-4 text-xs font-bold text-[var(--text-color)] whitespace-nowrap">
                      {formatDateStr(rep.createdAt)}
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenDetail(rep.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--border-color)]/40 hover:bg-[var(--color-primary)] hover:text-black text-[var(--text-color)] text-xs font-extrabold transition-all cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          pagination={pagination}
          currentPage={currentPage}
          limit={limit}
          onPageChange={onPageChange}
          label="báo cáo"
        />
      )}
    </div>
  );
}
