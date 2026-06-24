import React from "react";
import { Link } from "react-router-dom";
import { 
  AlertCircle, FileText, Heart, MessageSquare, Eye, EyeOff, Trash2 
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";

export default function PostsTable({
  postsList,
  isLoading,
  onOpenDetail,
  onOpenModerateModal,
  formatDateStr,
  pagination,
  currentPage,
  limit,
  onPageChange
}) {
  return (
    <div className="rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 shadow-lg">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-black/10">
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Bài đăng</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Người viết</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Loại bài</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Tương tác</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Báo cáo</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Trạng thái</th>
              <th className="p-4 text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Ngày tạo</th>
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
                      <div className="space-y-1.5">
                        <div className="h-4 w-40 bg-[var(--border-color)]/60 rounded" />
                        <div className="h-3 w-20 bg-[var(--border-color)]/40 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><div className="h-8 w-24 bg-[var(--border-color)]/60 rounded-lg" /></td>
                  <td className="p-4"><div className="h-5 w-16 bg-[var(--border-color)]/60 rounded-full" /></td>
                  <td className="p-4"><div className="h-4 w-28 bg-[var(--border-color)]/60 rounded" /></td>
                  <td className="p-4"><div className="h-5 w-14 bg-[var(--border-color)]/60 rounded-full" /></td>
                  <td className="p-4"><div className="h-5 w-16 bg-[var(--border-color)]/60 rounded-full" /></td>
                  <td className="p-4"><div className="h-4 w-20 bg-[var(--border-color)]/60 rounded" /></td>
                  <td className="p-4 text-center"><div className="h-8 w-24 bg-[var(--border-color)]/60 rounded-xl mx-auto" /></td>
                </tr>
              ))
            ) : postsList.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <AlertCircle className="w-12 h-12 text-[var(--text-muted)]/60" />
                    <p className="text-xs font-black uppercase tracking-wider">
                      Không tìm thấy bài viết nào phù hợp với bộ lọc.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              postsList.map((post) => (
                <tr 
                  key={post.id} 
                  className="hover:bg-black/10 transition-colors group cursor-pointer"
                  onClick={() => onOpenDetail(post.id)}
                >
                  {/* Post content preview & thumbnail */}
                  <td className="p-4 max-w-[300px]">
                    <div className="flex gap-2.5">
                      {post.media?.firstImageUrl ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--border-color)] bg-black">
                          <img 
                            src={post.media.firstImageUrl} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover"
                          />
                          {post.media.totalCount > 1 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black text-white">
                              +{post.media.totalCount - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--border-color)]/40 flex items-center justify-center text-[var(--text-muted)] flex-shrink-0 border border-[var(--border-color)]/60">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--text-color)] line-clamp-2 leading-relaxed">
                          {post.content || <span className="text-[var(--text-muted)]/60 italic font-medium">Không có nội dung chữ</span>}
                        </p>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] mt-0.5">Post ID: {post.id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>

                  {/* Author email & profile cross-link */}
                  <td className="p-4">
                    <div 
                      className="min-w-0 max-w-[150px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link 
                        to={`/users?search=${post.author?.email}`}
                        className="text-xs font-bold text-[var(--text-color)] hover:text-[var(--color-primary)] transition-colors block truncate"
                      >
                        {post.author?.fullName}
                      </Link>
                      <p className="text-[9px] font-bold text-[var(--text-muted)] truncate">{post.author?.email}</p>
                    </div>
                  </td>

                  {/* Post type badge */}
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border ${
                      post.postType === "workout_session" 
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {post.postType === "workout_session" ? "Buổi tập" : "Văn bản"}
                    </span>
                  </td>

                  {/* Social stats counters */}
                  <td className="p-4 text-xs">
                    <div className="flex flex-col gap-1 text-[10px]">
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-500/10" /> {post.stats?.reactions}
                      </span>
                      <span className="text-blue-400 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 fill-blue-500/10" /> {post.stats?.comments}
                      </span>
                    </div>
                  </td>

                  {/* Reports log count & link */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {post.stats?.reports > 0 ? (
                      <Link 
                        to={`/reports?postId=${post.id}`}
                        className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/20 text-[10px] font-extrabold text-rose-400 hover:bg-rose-500/25 transition-all block text-center max-w-[80px]"
                      >
                        {post.stats.reports} Báo cáo
                      </Link>
                    ) : (
                      <span className="text-xs font-bold text-[var(--text-muted)] pl-4">-</span>
                    )}
                  </td>

                  {/* Status badge (VISIBLE / HIDDEN / REMOVED) */}
                  <td className="p-4 text-xs">
                    <StatusBadge 
                      status={
                        post.moderationStatus === "VISIBLE" ? "Hiển thị" : 
                        post.moderationStatus === "HIDDEN" ? "Tạm ẩn" : "Đã xóa"
                      }
                      type={
                        post.moderationStatus === "VISIBLE" ? "success" : 
                        post.moderationStatus === "HIDDEN" ? "warning" : "error"
                      }
                    />
                  </td>

                  {/* Date created */}
                  <td className="p-4 text-xs font-bold text-[var(--text-color)] whitespace-nowrap">
                    {formatDateStr(post.createdAt)}
                  </td>

                  {/* Moderation actions toolbar */}
                  <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenDetail(post.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--border-color)]/40 hover:bg-[var(--color-primary)] hover:text-black text-[var(--text-color)] text-[11px] font-extrabold transition-all cursor-pointer"
                      >
                        Chi tiết
                      </button>
                      
                      {post.moderationStatus === "VISIBLE" && (
                        <>
                          <button
                            onClick={() => onOpenModerateModal("HIDE", post)}
                            className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 transition-all cursor-pointer flex items-center justify-center"
                            title="Tạm ẩn"
                          >
                            <EyeOff className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenModerateModal("REMOVE", post)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all cursor-pointer flex items-center justify-center"
                            title="Xóa bài"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {post.moderationStatus === "HIDDEN" && (
                        <>
                          <button
                            onClick={() => onOpenModerateModal("RESTORE", post)}
                            className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all cursor-pointer flex items-center justify-center"
                            title="Khôi phục"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenModerateModal("REMOVE", post)}
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-all cursor-pointer flex items-center justify-center"
                            title="Xóa bài"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {post.moderationStatus === "REMOVED" && (
                        <button
                          onClick={() => onOpenModerateModal("RESTORE", post)}
                          className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition-all cursor-pointer flex items-center justify-center"
                          title="Khôi phục"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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
          label="bài viết"
        />
      )}
    </div>
  );
}
