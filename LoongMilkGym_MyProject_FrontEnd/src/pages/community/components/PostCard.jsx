import { Globe, Heart, Lock, MessageSquare, Trash2 } from "lucide-react";
import { DEFAULT_AVATAR_URL } from "../constants/community.constants";
import {
  capitalizeName,
  formatTime,
  formatWorkoutDate,
} from "../utils/communityFormat";
import CommentsSection from "./CommentsSection";
import PostContent from "./PostContent";
import PostMediaGrid from "./PostMediaGrid";

export default function PostCard({
  commentInput,
  isAuthor,
  isCommentsOpen,
  onCommentChange,
  onDeletePost,
  onProfileClick,
  onRespectClick,
  onSendComment,
  onToggleComments,
  post,
  userInfo,
}) {
  const metadata =
    typeof post.metadata === "string" ? JSON.parse(post.metadata) : post.metadata;
  const feeling = metadata?.feeling;

  return (
    <article className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onProfileClick(post.userId)}
            className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm cursor-pointer shrink-0"
          >
            <img
              src={post.user?.profile?.avatarUrl || DEFAULT_AVATAR_URL}
              alt="author avatar"
              className="w-full h-full rounded-full object-cover bg-black"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                onClick={() => onProfileClick(post.userId)}
                className="text-sm font-black text-[var(--text-color)] hover:text-primary cursor-pointer transition-all"
              >
                {capitalizeName(post.user?.profile?.fullName || "Thành viên LoongMilkGym")}
              </span>
              {feeling && (
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  đang cảm thấy {feeling.emoji}{" "}
                  <span className="font-bold text-[var(--text-color)] capitalize">
                    {feeling.text}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-[var(--text-muted)] flex-wrap">
              <span>{formatTime(post.createdAt)}</span>
              <span>•</span>
              {post.visibility === "public" ? (
                <Globe className="w-3 h-3 text-primary" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {post.postType === "workout_share" && post.relatedWorkoutSession && (
                <>
                  <span>•</span>
                  <span className="text-primary font-black">
                    (Buổi tập {post.relatedWorkoutSession.title} ngày{" "}
                    {formatWorkoutDate(
                      post.relatedWorkoutSession.endedAt ||
                        post.relatedWorkoutSession.createdAt,
                    )}
                    )
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={() => onDeletePost(post.id)}
            className="p-2 text-rose-500/75 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all cursor-pointer"
            title="Xóa bài viết"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {post.content && <PostContent text={post.content} />}

      <PostMediaGrid media={post.media} />

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-bold px-1 mt-1">
        <div className="flex items-center gap-1">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary">
            👍
          </span>
          <span>{post.reactionsCount || 0} lượt thích</span>
        </div>
        <button
          onClick={onToggleComments}
          className="hover:text-[var(--text-color)] transition-all cursor-pointer"
        >
          {post.commentsCount || 0} bình luận
        </button>
      </div>

      <div className="h-[1.5px] bg-[var(--border-color)]/30" />

      <div className="grid grid-cols-2 gap-2 text-xs font-black">
        <button
          onClick={() => onRespectClick(post)}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl hover:bg-[var(--border-color)]/25 transition-all cursor-pointer uppercase tracking-wider ${
            post.hasReacted
              ? "text-primary bg-primary/5"
              : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
          }`}
        >
          <Heart className={`w-4.5 h-4.5 ${post.hasReacted ? "fill-primary text-primary" : ""}`} />
          <span>Thích</span>
        </button>

        <button
          onClick={onToggleComments}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl hover:bg-[var(--border-color)]/25 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer uppercase tracking-wider"
        >
          <MessageSquare className="w-4.5 h-4.5" />
          <span>Bình luận</span>
        </button>
      </div>

      {isCommentsOpen && (
        <CommentsSection
          commentInput={commentInput}
          comments={post.comments}
          onCommentChange={onCommentChange}
          onProfileClick={onProfileClick}
          onSendComment={onSendComment}
          userInfo={userInfo}
        />
      )}
    </article>
  );
}

