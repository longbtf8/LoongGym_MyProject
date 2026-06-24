import React, { useState } from "react";

export default function PostCommentsSection({ comments = [] }) {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

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

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
        Bình luận trên bài đăng {comments.length ? `(${comments.length})` : ''}
      </p>
      {comments.length > 0 ? (() => {
        const displayComments = isCommentsExpanded ? comments : comments.slice(0, 3);
        return (
          <>
            <div className={`space-y-3 ${isCommentsExpanded ? 'max-h-[350px] overflow-y-auto pr-1' : ''}`}>
              {displayComments.map(c => {
                const parentName = c.user?.profile?.fullName || 'Gymmer';
                return (
                  <div key={c.id} className="space-y-2">
                    {/* Parent Comment */}
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden bg-[var(--border-color)]/80 flex items-center justify-center border border-[var(--border-color)]/60">
                        {c.user?.profile?.avatarUrl ? (
                          <img src={c.user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-black text-[var(--text-color)] capitalize">
                            {parentName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 bg-[var(--bg-color)]/40 border border-[var(--border-color)]/20 rounded-2xl px-3 py-2 text-[11px] hover:border-[var(--border-color)]/40 transition-colors">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-[var(--text-color)]">{parentName}</span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)]">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="font-medium text-[var(--text-muted)]">{c.content}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {c.replies && c.replies.length > 0 && (
                      <div className="pl-9 space-y-2 border-l-2 border-[var(--border-color)]/20 ml-3.5">
                        {c.replies.map(r => {
                          const replyName = r.user?.profile?.fullName || 'Gymmer';
                          return (
                            <div key={r.id} className="flex gap-2 items-start">
                              <div className="w-6 h-6 rounded-full shrink-0 overflow-hidden bg-[var(--border-color)]/60 flex items-center justify-center border border-[var(--border-color)]/40">
                                {r.user?.profile?.avatarUrl ? (
                                  <img src={r.user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-black text-[var(--text-color)] capitalize">
                                    {replyName.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 bg-[var(--bg-color)]/25 border border-[var(--border-color)]/10 rounded-xl px-2.5 py-1.5 text-[11px]">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="font-extrabold text-[var(--text-color)]/90">{replyName}</span>
                                  <span className="text-[9px] font-bold text-[var(--text-muted)]">{formatDate(r.createdAt)}</span>
                                </div>
                                <p className="font-medium text-[var(--text-muted)]">{r.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {comments.length > 3 && (
              <button
                type="button"
                onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                className="w-full py-2.5 rounded-xl border border-[var(--border-color)]/60 text-[10px] font-black uppercase text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer mt-1"
              >
                {isCommentsExpanded ? "Thu gọn bình luận" : `Xem thêm ${comments.length - 3} bình luận khác`}
              </button>
            )}
          </>
        );
      })() : (
        <p className="text-[11px] font-semibold text-[var(--text-muted)] italic">
          Chưa có bình luận nào trên bài viết này.
        </p>
      )}
    </div>
  );
}
