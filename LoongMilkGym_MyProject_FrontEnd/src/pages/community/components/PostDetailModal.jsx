import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Heart, MessageSquare, ThumbsUp, Globe, Lock } from "lucide-react";
import {
  useGetPostByIdQuery,
  useAddCommentMutation,
} from "@/services/community/communityApi";
import { DEFAULT_AVATAR_URL, REACTION_EMOJIS } from "../constants/community.constants";
import { capitalizeName, formatTime } from "../utils/communityFormat";
import PostContent from "./PostContent";
import PostMediaGrid from "./PostMediaGrid";
import CommentsSection from "./CommentsSection";
import ReactionsPicker from "./ReactionsPicker";
import PhotoViewerModal from "./PhotoViewerModal";

export default function PostDetailModal({
  postId,
  onClose,
  userInfo,
  onProfileClick,
  onRespectClick,
  initialScrollToCommentId,
  initialAutoReplyComment,
}) {
  const { data: response, isLoading } = useGetPostByIdQuery(postId, {
    skip: !postId,
    refetchOnMountOrArgChange: true,
  });
  const [addComment] = useAddCommentMutation();

  const post = response?.data || response;

  const [commentInput, setCommentInput] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(null);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const hoverTimeout = useRef(null);
  const touchTimeout = useRef(null);
  const lastClickTimeRef = useRef(0);

  const handleLikeClick = (e) => {
    e?.stopPropagation();
    const now = Date.now();
    if (now - lastClickTimeRef.current < 400) return;
    lastClickTimeRef.current = now;
    if (post.hasReacted) {
      onRespectClick(post, post.userReaction);
    } else {
      onRespectClick(post, "like");
    }
  };

  const handleCommentButtonClick = () => {
    const inputEl = document.getElementById(`comment-input-${post?.id}`);
    if (inputEl) {
      inputEl.focus();
    }
  };

  // Block body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Scroll to comment if requested
  useEffect(() => {
    if (initialScrollToCommentId && post && !isLoading) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`comment-${initialScrollToCommentId}`);
        if (el) {
          const container = el.closest(".overflow-y-auto");
          if (container) {
            let parentContainer = container.parentElement?.closest(".overflow-y-auto");
            if (parentContainer) {
              const parentOffset = container.offsetTop - parentContainer.offsetTop;
              parentContainer.scrollTo({ top: parentOffset, behavior: "smooth" });
            }
            const offset = el.offsetTop - container.offsetTop - (container.clientHeight / 2) + (el.clientHeight / 2);
            container.scrollTo({ top: offset, behavior: "smooth" });
          } else {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          el.classList.add("bg-primary/10", "p-2", "rounded-2xl", "transition-all", "duration-500");
          setTimeout(() => {
            el.classList.remove("bg-primary/10");
          }, 3000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialScrollToCommentId, post, isLoading]);


  if (isLoading || !post) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-8 py-6 rounded-3xl shadow-2xl">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-black text-[var(--text-color)]">Đang tải chi tiết bài viết...</span>
        </div>
      </div>
    );
  }

  const handleCloseAttempt = () => {
    if (commentInput.trim().length > 0) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSendComment = async () => {
    if (!commentInput.trim()) return;
    try {
      await addComment({
        postId: post.id,
        content: commentInput,
      }).unwrap();
      setCommentInput("");
    } catch (err) {
      console.error("Lỗi khi thêm bình luận:", err);
    }
  };

  // Reactions logic
  const handleMouseEnter = () => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    clearTimeout(hoverTimeout.current);
    setShowLikeTooltip(true);
    hoverTimeout.current = setTimeout(() => {
      setShowReactions(true);
      setShowLikeTooltip(false);
    }, 450);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setShowLikeTooltip(false);
    hoverTimeout.current = setTimeout(() => {
      setShowReactions(false);
    }, 150);
  };

  const handleTouchStart = () => {
    clearTimeout(touchTimeout.current);
    touchTimeout.current = setTimeout(() => {
      setShowReactions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimeout.current);
  };

  const currentReaction = REACTION_EMOJIS.find((r) => r.type === post.userReaction);
  const authorProfileId = post.userId || post.user?.id;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Background Overlay */}
      <div
        onClick={handleCloseAttempt}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm p-4 cursor-pointer"
      />
      {/* Modal Card */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up z-10 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-[var(--border-color)]/45">
          <h3 className="text-base font-black text-[var(--text-color)]">
            Bài viết của {capitalizeName(post.user?.profile?.fullName || "GymLife Member")}
          </h3>
          <button
            onClick={handleCloseAttempt}
            className="p-1.5 hover:bg-[var(--border-color)]/30 text-[var(--text-muted)] hover:text-[var(--text-color)] rounded-full transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Author Header */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onProfileClick(authorProfileId)}
              className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 cursor-pointer flex items-center justify-center"
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
            <div className="text-left">
              <h4
                onClick={() => onProfileClick(authorProfileId)}
                className="text-sm font-black text-[var(--text-color)] hover:text-primary transition-all cursor-pointer"
              >
                {capitalizeName(post.user?.profile?.fullName || "GymLife Member")}
              </h4>
              <p className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-bold">
                {formatTime(post.createdAt)}
                <span>·</span>
                {post.visibility === "private" ? (
                  <Lock className="w-2.5 h-2.5" />
                ) : (
                  <Globe className="w-2.5 h-2.5 text-primary" />
                )}
              </p>
            </div>
          </div>

          {/* Post Content & Media */}
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
                            onRespectClick(post, type);
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
                      onClick={handleCommentButtonClick}
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

            {/* Comments list inside modal */}
            <CommentsSection
              postId={post.id}
              commentInput={commentInput}
              comments={post.comments}
              commentsCount={post.commentsCount}
              onCommentChange={setCommentInput}
              onProfileClick={onProfileClick}
              onSendComment={handleSendComment}
              userInfo={userInfo}
              isModal={true}
              initialAutoReplyComment={initialAutoReplyComment}
              postOwnerId={post.userId || post.user?.id}
            />
          </div>
        </div>
      </div>

      {/* Unsaved draft Exit Confirm Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-scale-up">
            <h4 className="text-base font-black text-[var(--text-color)] mb-2">Bạn muốn rời khỏi bài viết?</h4>
            <p className="text-xs text-[var(--text-muted)] font-semibold mb-6">
              Bạn đang viết dở bình luận. Nếu rời đi bây giờ, bình luận này sẽ bị hủy.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 bg-[var(--border-color)]/20 hover:bg-[var(--border-color)]/35 text-[var(--text-color)] text-xs font-black rounded-xl cursor-pointer transition-all"
              >
                Tiếp tục viết
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md"
              >
                Rời đi
              </button>
            </div>
          </div>
        </div>
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
    </div>,
    document.body
  );
}
