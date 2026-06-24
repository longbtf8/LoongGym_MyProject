import React from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Flame, FileText, Activity } from "lucide-react";

export default function UserActivityTab({ detail, user, onPostClick, onClose }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0 phút";
    const minutes = Math.round(seconds / 60);
    return `${minutes} phút`;
  };

  return (
    <div className="space-y-6 animate-reactions-in">
      {/* Workout Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Tổng phiên tập</p>
            <p className="text-base font-black text-[var(--text-color)] mt-0.5">
              {user.profile?.totalWorkoutDays || 0} buổi
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">Lượng calo đốt</p>
            <p className="text-base font-black text-[var(--text-color)] mt-0.5">
              {Math.round(user.profile?.totalCaloriesBurned || 0).toLocaleString()} kcal
            </p>
          </div>
        </div>
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2.5 rounded-xl bg-[var(--border-color)]/30 border border-[var(--border-color)]/40">
          <p className="text-xs font-black text-[var(--text-color)]">{user._count?.communityPosts || 0}</p>
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Bài viết</p>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--border-color)]/30 border border-[var(--border-color)]/40">
          <p className="text-xs font-black text-[var(--text-color)]">{user._count?.trainingPlans || 0}</p>
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Lịch tập</p>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--border-color)]/30 border border-[var(--border-color)]/40">
          <p className="text-xs font-black text-[var(--text-color)]">{user._count?.postComments || 0}</p>
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">Bình luận</p>
        </div>
      </div>

      {/* Recent posts */}
      <div className="space-y-3">
        <div className="flex justify-between items-center border-b border-[var(--border-color)]/30 pb-2">
          <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider flex items-center gap-2 border-none pb-0">
            <FileText className="w-4 h-4 text-[var(--color-primary)]" />
            Bài viết gần đây
          </h4>
          <Link 
            to={`/posts?search=${user.email}`}
            onClick={onClose}
            className="text-[10px] font-black text-[var(--color-primary)] hover:underline uppercase tracking-wider"
          >
            Xem tất cả
          </Link>
        </div>
        {(!detail.recentPosts || detail.recentPosts.length === 0) ? (
          <p className="text-xs font-semibold text-[var(--text-muted)] italic py-2">Chưa đăng tải bài viết nào.</p>
        ) : (
          <div className="space-y-3">
            {detail.recentPosts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => onPostClick && onPostClick(post.id)}
                className="p-3.5 rounded-2xl bg-[var(--bg-color)]/60 hover:bg-[var(--bg-color)] border border-[var(--border-color)]/30 space-y-1.5 cursor-pointer hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center text-[10px] font-black text-[var(--text-muted)]">
                  <span>{formatDate(post.createdAt)}</span>
                  <span className="uppercase">{post.visibility}</span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-color)] line-clamp-2 leading-relaxed">
                  {post.content || "[Không có nội dung chữ]"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent workout sessions */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-[var(--text-color)] uppercase tracking-wider flex items-center gap-2 border-b border-[var(--border-color)]/30 pb-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Lịch sử tập luyện gần đây
        </h4>
        {(!detail.recentWorkouts || detail.recentWorkouts.length === 0) ? (
          <p className="text-xs font-semibold text-[var(--text-muted)] italic py-2">Chưa thực hiện phiên tập nào.</p>
        ) : (
          <div className="space-y-3">
            {detail.recentWorkouts.map((session) => (
              <div key={session.id} className="p-3.5 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/30 flex justify-between items-center">
                <div>
                  <p className="text-xs font-extrabold text-[var(--text-color)]">
                    {session.title || "Phiên tập không tên"}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[var(--text-muted)] mt-1">
                    <span>{formatDate(session.createdAt)}</span>
                    <span>•</span>
                    <span>Thời gian: {formatDuration(session.durationSeconds)}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                  session.status === "completed" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {session.status === "completed" ? "Hoàn thành" : "Đang tập"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
