import { useEffect, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Flag,
  Globe,
  Heart,
  Lock,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
  X,
  Bookmark,
  ThumbsUp,
} from "lucide-react";
import {
  useArchivePostOnProfileMutation,
  useHidePostForMeMutation,
  useReportPostMutation,
  useRestorePostToProfileMutation,
  useUpdatePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
} from "@/services/community/communityApi";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/services/auth/authApi";
import { DEFAULT_AVATAR_URL, REACTION_EMOJIS } from "../constants/community.constants";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  capitalizeName,
  formatTime,
  formatWorkoutDate,
} from "../utils/communityFormat";
import CommentsSection from "./CommentsSection";
import PostContent from "./PostContent";
import PostMediaGrid from "./PostMediaGrid";
import ReactionsPicker from "./ReactionsPicker";
import PostDetailModal from "./PostDetailModal";
import CreatePostModal from "./CreatePostModal";
import PhotoViewerModal from "./PhotoViewerModal";

const getMetadata = (post) =>
  typeof post.metadata === "string" ? JSON.parse(post.metadata) : post.metadata;

function AudienceOption({ active, icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-2xl p-4 text-left transition-all ${
        active ? "bg-primary/10" : "hover:bg-[var(--border-color)]/25"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--border-color)]/35 text-[var(--text-color)]">
          {icon}
        </span>
        <span>
          <span className="block text-sm font-black text-[var(--text-color)]">
            {title}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-[var(--text-muted)]">
            {description}
          </span>
        </span>
      </div>
      <span
        className={`h-5 w-5 rounded-full border-2 ${
          active ? "border-primary bg-primary shadow-[inset_0_0_0_4px_var(--bg-secondary)]" : "border-[var(--text-muted)]"
        }`}
      />
    </button>
  );
}

export default function PostCard({
  commentInput,
  context = "community",
  isAuthor,
  isCommentsOpen,
  isFollowingAuthor = false,
  isOwnProfile = false,
  onArchiveProfilePost,
  onCommentChange,
  onDeletePost,
  onFollowChanged,
  onProfileClick,
  onRespectClick,
  onSendComment,
  onShowToast,
  onToggleComments,
  post,
  userInfo,
}) {
  const menuRef = useRef(null);
  const { requireAuth } = useRequireAuth();
  const metadata = getMetadata(post);
  const feeling = metadata?.feeling;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editVisibility, setEditVisibility] = useState(post.visibility || "public");
  const [reportText, setReportText] = useState("");
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [targetCommentId, setTargetCommentId] = useState(null);
  const [autoReplyComment, setAutoReplyComment] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(null);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const lastClickTimeRef = useRef(0);

  const [updatePost, { isLoading: isUpdatingPost }] = useUpdatePostMutation();
  const [archivePostOnProfile] = useArchivePostOnProfileMutation();
  const [restorePostToProfile] = useRestorePostToProfileMutation();
  const [hidePostForMe] = useHidePostForMeMutation();
  const [reportPost, { isLoading: isReporting }] = useReportPostMutation();
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  const canHideFromProfile = context === "profile" && isOwnProfile && isAuthor;
  const canHideFromCommunity = context === "community" && !isAuthor;
  const isArchiveView = context === "archive";

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    setEditVisibility(post.visibility || "public");
  }, [post.id, post.visibility]);

  const handleMouseEnter = () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    clearTimeout(hoverTimeoutRef.current);
    setShowLikeTooltip(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactions(true);
      setShowLikeTooltip(false);
    }, 450);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setShowLikeTooltip(false);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
    }, 150);
  };

  const handleTouchStart = () => {
    clearTimeout(touchTimeoutRef.current);
    touchTimeoutRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimeoutRef.current);
  };

  const handleLikeClick = (e) => {
    e?.stopPropagation();
    if (!requireAuth()) return;
    const now = Date.now();
    if (now - lastClickTimeRef.current < 400) return;
    lastClickTimeRef.current = now;
    if (post.hasReacted) {
      onRespectClick(post, post.userReaction);
    } else {
      onRespectClick(post, "like");
    }
  };

  const handleOpenDetail = () => {
    setTargetCommentId(null);
    setAutoReplyComment(null);
    setDetailModalOpen(true);
  };

  const handleCommentClick = (commentId, replyComment = null) => {
    setTargetCommentId(commentId);
    setAutoReplyComment(replyComment);
    setDetailModalOpen(true);
  };

  const closeMenuAndRun = async (handler) => {
    setMenuOpen(false);
    await handler?.();
  };

  const handleEditFileChange = (event) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length === 0) return;
    setNewMediaFiles((prev) => [...prev, ...files]);
    setNewMediaPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    event.target.value = "";
  };

  const removeNewMedia = (index) => {
    URL.revokeObjectURL(newMediaPreviews[index]);
    setNewMediaFiles((prev) => prev.filter((_, idx) => idx !== index));
    setNewMediaPreviews((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePost = async () => {
    const formData = new FormData();
    formData.append("content", editContent);
    formData.append("visibility", editVisibility);
    formData.append("removeMediaIds", JSON.stringify(removeMediaIds));
    newMediaFiles.forEach((file) => formData.append("images", file));
    await updatePost({ postId: post.id, formData }).unwrap();
    setShowEditModal(false);
  };

  const handleSaveAudience = async () => {
    const formData = new FormData();
    formData.append("content", post.content || "");
    formData.append("visibility", editVisibility);
    formData.append("removeMediaIds", JSON.stringify([]));
    await updatePost({ postId: post.id, formData }).unwrap();
    setShowAudienceModal(false);
  };

  const handleFollowToggle = async () => {
    if (!requireAuth()) return;
    try {
      if (isFollowingAuthor) {
        await unfollowUser(post.userId).unwrap();
        onFollowChanged?.(post.userId, false);
        onShowToast?.("Đã hủy theo dõi.");
      } else {
        await followUser(post.userId).unwrap();
        onFollowChanged?.(post.userId, true);
        onShowToast?.("Theo dõi thành công.");
      }
    } catch (err) {
      console.error("Lỗi theo dõi:", err);
      onShowToast?.("Thao tác theo dõi thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
      throw err;
    }
  };

  const handleArchiveProfile = async () => {
    try {
      await archivePostOnProfile(post.id).unwrap();
      onArchiveProfilePost?.("Bài viết này có thể sẽ vẫn hiện ở nơi khác!");
      onShowToast?.("Đã ẩn bài viết khỏi trang cá nhân.");
    } catch (err) {
      onShowToast?.("Ẩn bài viết thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
      throw err;
    }
  };

  const handleRestoreProfile = async () => {
    try {
      await restorePostToProfile(post.id).unwrap();
      onShowToast?.("Đã khôi phục bài viết lên trang cá nhân.");
    } catch (err) {
      onShowToast?.("Khôi phục bài viết thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
      throw err;
    }
  };

  const handleSaveToggle = async () => {
    if (!requireAuth()) return;
    try {
      if (post.hasSaved) {
        await unsavePost(post.id).unwrap();
        onShowToast?.("Đã hủy lưu bài viết.");
      } else {
        await savePost(post.id).unwrap();
        onShowToast?.("Lưu bài viết thành công.");
      }
    } catch (err) {
      console.error("Lỗi thay đổi trạng thái lưu bài viết:", err);
      onShowToast?.("Lưu bài viết thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
    }
  };

  const handleHideForMe = async () => {
    if (!requireAuth()) return;
    try {
      await hidePostForMe(post.id).unwrap();
      onShowToast?.("Bạn sẽ ít thấy các bài viết như này hơn.");
    } catch (err) {
      onShowToast?.("Ẩn bài viết thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
      throw err;
    }
  };

  const handleSubmitReport = async () => {
    try {
      await reportPost({ postId: post.id, reason: reportText }).unwrap();
      setReportText("");
      setShowReportModal(false);
      onShowToast?.("Báo cáo đã được gửi.");
    } catch (err) {
      onShowToast?.("Gửi báo cáo thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
    }
  };

  const renderActionMenu = () => (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setMenuOpen((value) => !value)}
        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 rounded-full transition-all cursor-pointer"
        title="Tùy chọn bài viết"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-45 mt-1.5 w-[220px] sm:w-[260px] md:w-[280px] overflow-visible rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1.5 shadow-2xl">
          <span className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 border-l border-t border-[var(--border-color)] bg-[var(--bg-secondary)]" />
          <div className="relative flex flex-col gap-0.5">
            {isAuthor ? (
              <>
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(handleSaveToggle)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                >
                  <Bookmark className={`w-4.5 h-4.5 ${post.hasSaved ? "fill-primary text-primary" : "text-primary"}`} />
                  <span>{post.hasSaved ? "Hủy lưu bài" : "Lưu bài viết"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(() => setShowEditModal(true))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                >
                  <Pencil className="w-4.5 h-4.5 text-primary" />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(() => setShowAudienceModal(true))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                >
                  {post.visibility === "public" ? (
                    <Globe className="w-4.5 h-4.5 text-primary" />
                  ) : (
                    <Lock className="w-4.5 h-4.5 text-primary" />
                  )}
                  <span>Chỉnh sửa đối tượng</span>
                </button>
                {canHideFromProfile && !isArchiveView && (
                  <button
                    type="button"
                    onClick={() => closeMenuAndRun(handleArchiveProfile)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    <EyeOff className="w-4.5 h-4.5 text-primary" />
                    <span>Ẩn khỏi trang cá nhân</span>
                  </button>
                )}
                {isArchiveView && (
                  <button
                    type="button"
                    onClick={() => closeMenuAndRun(handleRestoreProfile)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    <Eye className="w-4.5 h-4.5 text-primary" />
                    <span>Khôi phục lên trang cá nhân</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(() => onDeletePost(post.id))}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-rose-500 transition-all hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  <span>Xóa</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(handleSaveToggle)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                >
                  <Bookmark className={`w-4.5 h-4.5 ${post.hasSaved ? "fill-primary text-primary" : "text-primary"}`} />
                  <span>{post.hasSaved ? "Hủy lưu bài" : "Lưu bài viết"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(handleFollowToggle)}
                  disabled={isFollowing || isUnfollowing}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30 disabled:opacity-60"
                >
                  {isFollowingAuthor ? (
                    <UserMinus className="w-4.5 h-4.5 text-primary" />
                  ) : (
                    <UserPlus className="w-4.5 h-4.5 text-primary" />
                  )}
                  <span>{isFollowingAuthor ? "Hủy theo dõi" : "Theo dõi"}</span>
                </button>
                {canHideFromCommunity && (
                  <button
                    type="button"
                    onClick={() => closeMenuAndRun(handleHideForMe)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    <EyeOff className="w-4.5 h-4.5 text-primary" />
                    <span className="truncate">Tôi không muốn thấy bài viết như này</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => closeMenuAndRun(() => {
                    if (requireAuth()) {
                      setShowReportModal(true);
                    }
                  })}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-bold text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                >
                  <Flag className="w-4.5 h-4.5 text-rose-500" />
                  <span>Báo cáo</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <article className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-4 sm:p-5 lg:p-6 shadow-sm flex flex-col gap-3 sm:gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            onClick={() => onProfileClick(post.userId)}
            className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm cursor-pointer shrink-0 flex items-center justify-center"
          >
            {post.user?.profile?.avatarUrl && post.user.profile.avatarUrl !== DEFAULT_AVATAR_URL ? (
              <img
                src={post.user.profile.avatarUrl}
                alt="author avatar"
                className="w-full h-full rounded-full object-cover bg-black"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-sm font-black text-primary capitalize select-none">
                {post.user?.profile?.fullName ? post.user.profile.fullName.trim().charAt(0).toUpperCase() : "?"}
              </div>
            )}
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
              <span>·</span>
              {post.visibility === "private" ? (
                <Lock className="w-2.5 h-2.5" />
              ) : (
                <Globe className="w-2.5 h-2.5 text-primary" />
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

        {renderActionMenu()}
      </div>

      {post.content && <PostContent text={post.content} />}

      <PostMediaGrid media={post.media} onMediaClick={setPhotoViewerIndex} />

      <div className="flex flex-col">
        {(() => {
          const currentReaction = REACTION_EMOJIS.find((r) => r.type === post.userReaction);
          return (
            <div className="flex items-center justify-between py-2 border-t border-[var(--border-color)]/20 mt-1 select-none">
              <div className="flex items-center gap-8">
                {/* Like Button */}
                <div
                  className="relative flex items-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {showReactions && (
                    <ReactionsPicker
                      onSelect={(type) => {
                        if (requireAuth()) {
                          onRespectClick(post, type);
                        }
                        setShowReactions(false);
                      }}
                      onClose={() => setShowReactions(false)}
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleLikeClick}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`flex items-center gap-2 cursor-pointer transition-all duration-200 py-1.5 px-2 rounded-lg hover:bg-[var(--border-color)]/25 ${
                      post.hasReacted
                        ? currentReaction?.color || "text-primary"
                        : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
                    }`}
                    aria-label="Thích bài viết"
                  >
                    {post.hasReacted ? (
                      currentReaction?.type === "like" ? (
                        <ThumbsUp className="w-5 h-5 text-[#4d7c0f] dark:text-[#ccff00] fill-[#ccff00] animate-like-bounce" />
                      ) : (
                        <span className="text-lg leading-none">{currentReaction?.emoji}</span>
                      )
                    ) : (
                      <ThumbsUp className="w-5 h-5" />
                    )}
                    <span className="text-sm font-semibold">{post.reactionsCount || 0}</span>
                  </button>

                  {showLikeTooltip && !showReactions && (
                    <div className="absolute bottom-[calc(100%+8px)] left-1/2 bg-neutral-900/90 text-white text-[13px] font-bold px-2.5 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap animate-tooltip-in z-30">
                      Thích
                    </div>
                  )}
                </div>

                {/* Comment Button */}
                <button
                  type="button"
                  onClick={() => requireAuth(() => handleOpenDetail())}
                  className="flex items-center gap-2 cursor-pointer transition-all duration-200 py-1.5 px-2 rounded-lg hover:bg-[var(--border-color)]/25 text-[var(--text-muted)] hover:text-[var(--text-color)]"
                  aria-label="Bình luận bài viết"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-semibold">{post.commentsCount || 0}</span>
                </button>
              </div>

              {/* Right side: stacked reaction emojis */}
              {post.activeReactions && post.activeReactions.length > 0 && (
                <div className="flex items-center -space-x-1.5">
                  {post.activeReactions.map((reactType) => (
                    <span
                      key={reactType}
                      className="flex items-center justify-center w-5 h-5 rounded-full border border-[var(--bg-secondary)] bg-[var(--bg-secondary)] text-[11px]"
                      title={reactType}
                    >
                      {reactType === "like" && (
                        <ThumbsUp className="w-2.5 h-2.5 text-[#4d7c0f] dark:text-[#ccff00] fill-[#ccff00]" />
                      )}
                      {reactType === "love" && "❤️"}
                      {reactType === "care" && "🥰"}
                      {reactType === "haha" && "😆"}
                      {reactType === "wow" && "😮"}
                      {reactType === "sad" && "😢"}
                      {reactType === "angry" && "😡"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        <CommentsSection
          postId={post.id}
          commentInput={commentInput}
          comments={post.comments}
          commentsCount={post.commentsCount}
          onCommentChange={onCommentChange}
          onProfileClick={onProfileClick}
          onSendComment={onSendComment}
          userInfo={userInfo}
          onCommentClick={(commentId, comment) => handleCommentClick(commentId, comment)}
          onViewMoreComments={() => requireAuth(() => handleOpenDetail())}
          isModal={false}
          postOwnerId={post.userId || post.user?.id}
        />
      </div>

      {isDetailModalOpen && (
        <PostDetailModal
          postId={post.id}
          onClose={() => {
            setDetailModalOpen(false);
            setAutoReplyComment(null);
          }}
          userInfo={userInfo}
          onProfileClick={onProfileClick}
          onRespectClick={onRespectClick}
          initialScrollToCommentId={targetCommentId}
          initialAutoReplyComment={autoReplyComment}
        />
      )}

      {photoViewerIndex !== null && (
        <PhotoViewerModal
          media={post.media}
          initialIndex={photoViewerIndex}
          onClose={() => setPhotoViewerIndex(null)}
          post={post}
          userInfo={userInfo}
        />
      )}

      {showEditModal && (
        <CreatePostModal
          postToEdit={post}
          onClose={() => setShowEditModal(false)}
          onRequestStarted={(message) => onShowToast?.(message, "loading")}
          onRequestSuccess={(message) => onShowToast?.(message)}
          onRequestError={(message) => onShowToast?.(message, "error")}
        />
      )}

      {showAudienceModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-[min(520px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl">
            <div className="relative border-b border-[var(--border-color)] px-5 py-4 text-center">
              <h3 className="m-0 text-lg font-black text-[var(--text-color)]">Chọn đối tượng</h3>
              <button
                type="button"
                onClick={() => setShowAudienceModal(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[var(--border-color)]/40 p-2 text-[var(--text-muted)] hover:text-[var(--text-color)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <AudienceOption
                active={editVisibility === "public"}
                icon={<Globe className="w-6 h-6" />}
                title="Công khai"
                description="Mọi người có thể xem bài viết này."
                onClick={() => setEditVisibility("public")}
              />
              <AudienceOption
                active={editVisibility === "private"}
                icon={<Lock className="w-6 h-6" />}
                title="Riêng tư"
                description="Chỉ bạn có thể xem bài viết này."
                onClick={() => setEditVisibility("private")}
              />
            </div>
            <div className="flex justify-end gap-3 border-t border-[var(--border-color)] p-4">
              <button
                type="button"
                onClick={() => setShowAudienceModal(false)}
                className="rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-color)] hover:bg-[var(--border-color)]/25"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAudience}
                disabled={isUpdatingPost}
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-black disabled:opacity-60"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-[min(480px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl">
            <div className="border-b border-[var(--border-color)] px-5 py-4 text-center">
              <h3 className="m-0 text-lg font-black text-[var(--text-color)]">Báo cáo bài viết</h3>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <textarea
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                placeholder="Nhập nội dung bạn muốn báo cáo..."
                className="min-h-32 w-full resize-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-sm font-semibold text-[var(--text-color)] outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-color)] hover:bg-[var(--border-color)]/35"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReport}
                  disabled={isReporting}
                  className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-black disabled:opacity-60"
                >
                  {isReporting ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
