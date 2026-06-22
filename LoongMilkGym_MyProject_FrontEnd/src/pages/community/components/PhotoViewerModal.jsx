import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MessageSquare,
  Minimize2,
  Send,
  ThumbsUp,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  useAddMediaCommentMutation,
  useDeleteMediaCommentReactionMutation,
  useDeleteMediaReactionMutation,
  useGetMediaByIdQuery,
  useToggleMediaCommentReactionMutation,
  useToggleMediaReactionMutation,
} from "@/services/community/communityApi";
import { DEFAULT_AVATAR_URL } from "../constants/community.constants";
import useComposing from "../hooks/useComposing";
import { capitalizeName, formatTime } from "../utils/communityFormat";

export default function PhotoViewerModal({
  media = [],
  initialIndex = 0,
  onClose,
  post,
  userInfo,
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(true);
  const [commentText, setCommentText] = useState("");
  const commentComposing = useComposing();
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });
  const activeMedia = media[activeIndex];
  const activeMediaId = activeMedia?.id;

  const { data: mediaResponse, isFetching } = useGetMediaByIdQuery(activeMediaId, {
    skip: !activeMediaId,
    refetchOnMountOrArgChange: true,
  });
  const [addMediaComment, { isLoading: isSendingComment }] = useAddMediaCommentMutation();
  const [toggleMediaReaction] = useToggleMediaReactionMutation();
  const [deleteMediaReaction] = useDeleteMediaReactionMutation();
  const [toggleMediaCommentReaction] = useToggleMediaCommentReactionMutation();
  const [deleteMediaCommentReaction] = useDeleteMediaCommentReactionMutation();

  const mediaDetail = mediaResponse?.data || mediaResponse || activeMedia;
  const author = mediaDetail?.post?.user || post?.user;
  const authorName = capitalizeName(author?.profile?.fullName || "Thành viên LoongMilkGym");
  const authorAvatar = author?.profile?.avatarUrl;
  const postInfo = mediaDetail?.post || post;
  const caption = mediaDetail?.caption || "";

  const comments = useMemo(() => mediaDetail?.comments || [], [mediaDetail?.comments]);

  const goTo = (nextIndex) => {
    if (!media.length) return;
    const normalizedIndex = (nextIndex + media.length) % media.length;
    setActiveIndex(normalizedIndex);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCommentText("");
  };

  const updateZoom = (nextZoom) => {
    setZoom(nextZoom);
    if (nextZoom <= 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "ArrowRight") goTo(activeIndex + 1);
      if (event.key === "ArrowLeft") goTo(activeIndex - 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, onClose]);

  const handleToggleReaction = async () => {
    if (!activeMediaId) return;
    try {
      if (mediaDetail?.hasReacted) {
        await deleteMediaReaction({
          mediaId: activeMediaId,
          postId: postInfo?.id,
          reactionType: mediaDetail.userReaction || "like",
        }).unwrap();
      } else {
        await toggleMediaReaction({
          mediaId: activeMediaId,
          postId: postInfo?.id,
          reactionType: "like",
        }).unwrap();
      }
    } catch (error) {
      console.error("Lỗi tương tác ảnh:", error);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !activeMediaId) return;
    try {
      await addMediaComment({
        mediaId: activeMediaId,
        postId: postInfo?.id,
        content: commentText.trim(),
      }).unwrap();
      setCommentText("");
    } catch (error) {
      console.error("Lỗi bình luận ảnh:", error);
    }
  };

  const handleMediaCommentReaction = async (comment) => {
    try {
      if (comment.hasReacted) {
        await deleteMediaCommentReaction({
          commentId: comment.id,
          mediaId: activeMediaId,
          postId: postInfo?.id,
        }).unwrap();
      } else {
        await toggleMediaCommentReaction({
          commentId: comment.id,
          mediaId: activeMediaId,
          postId: postInfo?.id,
          reactionType: "like",
        }).unwrap();
      }
    } catch (error) {
      console.error("Lỗi tương tác bình luận ảnh:", error);
    }
  };

  const handlePointerDown = (event) => {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (event) => {
    if (!isDragging || zoom <= 1) return;
    const nextX = dragStartRef.current.panX + event.clientX - dragStartRef.current.pointerX;
    const nextY = dragStartRef.current.panY + event.clientY - dragStartRef.current.pointerY;
    setPan({ x: nextX, y: nextY });
  };

  const handlePointerEnd = (event) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setIsDragging(false);
  };

  if (!activeMedia) return null;

  return createPortal(
    <div id="photo-viewer-root" className="fixed inset-0 z-[999999] bg-black text-white">
      <div className="flex h-full flex-col lg:flex-row">
        <div className="relative flex min-h-[46dvh] flex-1 items-center justify-center overflow-hidden bg-black lg:min-h-0">
          <div className="absolute left-3 top-3 z-30 flex items-center">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition hover:bg-white"
              title="Đóng"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="absolute right-5 top-3 z-30 flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateZoom(Math.min(zoom + 0.2, 2.4))}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition hover:bg-white"
              title="Phóng to"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => updateZoom(Math.max(zoom - 0.2, 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition hover:bg-white disabled:opacity-50"
              title="Thu nhỏ"
              disabled={zoom <= 1}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsInfoOpen((value) => !value)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition hover:bg-white"
              title={isInfoOpen ? "Ẩn thông tin" : "Hiện thông tin"}
            >
              {isInfoOpen ? <Maximize2 className="h-5 w-5" /> : <Minimize2 className="h-5 w-5" />}
            </button>
          </div>

          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition hover:bg-white"
                title="Ảnh trước"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black shadow-lg transition hover:bg-white"
                title="Ảnh sau"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <div
            className={`flex h-full w-full touch-none items-center justify-center ${
              zoom > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
          >
            <img
              src={activeMedia.mediaUrl}
              alt={caption || "Ảnh bài viết"}
              draggable={false}
              className="max-h-full max-w-full select-none object-contain transition-transform duration-150"
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
            />
          </div>
        </div>

        {isInfoOpen && (
        <aside className="flex max-h-[54dvh] w-full flex-col bg-[var(--bg-secondary)] text-[var(--text-color)] lg:max-h-none lg:w-[380px] xl:w-[430px]">
          <div className="border-b border-[var(--border-color)] px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[var(--border-color)]">
                  {authorAvatar && authorAvatar !== DEFAULT_AVATAR_URL ? (
                    <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-black text-primary">
                      {authorName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{authorName}</p>
                  <p className="text-xs font-bold text-[var(--text-muted)]">
                    {formatTime(postInfo?.createdAt)}
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-black text-[var(--text-muted)]">
                {activeIndex + 1}/{media.length}
              </span>
            </div>

            {caption ? (
              <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-relaxed">{caption}</p>
            ) : postInfo?.content ? (
              <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-relaxed">{postInfo.content}</p>
            ) : (
              <p className="mt-4 text-sm font-semibold text-[var(--text-muted)]">
                Ảnh này nằm trong một bài viết.
              </p>
            )}
          </div>

          <div className="flex items-center gap-5 border-b border-[var(--border-color)] px-5 py-3">
            <button
              type="button"
              onClick={handleToggleReaction}
              className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-black transition ${
                mediaDetail?.hasReacted
                  ? "text-primary"
                  : "text-[var(--text-muted)] hover:text-[var(--text-color)]"
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${mediaDetail?.hasReacted ? "fill-primary" : ""}`} />
              <span>{mediaDetail?.reactionsCount || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-sm font-black text-[var(--text-muted)]">
              <MessageSquare className="h-5 w-5" />
              <span>{mediaDetail?.commentsCount || 0}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {isFetching && comments.length === 0 ? (
              <p className="text-sm font-bold text-[var(--text-muted)]">Đang tải bình luận...</p>
            ) : comments.length === 0 ? (
              <div className="flex h-full min-h-44 flex-col items-center justify-center text-center">
                <MessageSquare className="mb-3 h-12 w-12 text-[var(--text-muted)]/60" />
                <p className="text-base font-black">Chưa có bình luận nào</p>
                <p className="mt-1 text-sm font-semibold text-[var(--text-muted)]">
                  Hãy là người đầu tiên bình luận.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map((comment) => {
                  const commentName = capitalizeName(comment.user?.profile?.fullName || "Thành viên");
                  return (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[var(--border-color)]">
                        {comment.user?.profile?.avatarUrl ? (
                          <img
                            src={comment.user.profile.avatarUrl}
                            alt={commentName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-black text-primary">
                            {commentName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="rounded-2xl bg-[var(--bg-color)] px-3 py-2">
                          <p className="text-sm font-black">{commentName}</p>
                          <p className="whitespace-pre-wrap text-sm font-semibold">{comment.content}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-3 pl-2 text-xs font-bold text-[var(--text-muted)]">
                          <span>{formatTime(comment.createdAt)}</span>
                          <button
                            type="button"
                            onClick={() => handleMediaCommentReaction(comment)}
                            className={`hover:underline ${
                              comment.hasReacted ? "text-primary" : "hover:text-[var(--text-color)]"
                            }`}
                          >
                            Thích
                          </button>
                          {comment.reactionsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-primary">
                              <ThumbsUp className="h-3.5 w-3.5 fill-primary" />
                              {comment.reactionsCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border-color)] p-4">
            <div className="flex items-end gap-2">
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[var(--border-color)]">
                {userInfo?.profile?.avatarUrl ? (
                  <img
                    src={userInfo.profile.avatarUrl}
                    alt={userInfo?.profile?.fullName || "Bạn"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-black text-primary">
                    {(userInfo?.profile?.fullName || "B").charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex min-h-11 flex-1 items-center gap-2 rounded-2xl bg-[var(--bg-color)] px-4 py-2">
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  onCompositionStart={commentComposing.onCompositionStart}
                  onCompositionEnd={commentComposing.onCompositionEnd}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !commentComposing.isComposingRef.current
                    ) {
                      event.preventDefault();
                      handleSendComment();
                    }
                  }}
                  placeholder={`Bình luận dưới tên ${userInfo?.profile?.fullName || "bạn"}`}
                  className="max-h-24 min-h-6 flex-1 resize-none bg-transparent text-sm font-semibold text-[var(--text-color)] outline-none placeholder:text-[var(--text-muted)]"
                  rows={1}
                />
                <button
                  type="button"
                  onClick={handleSendComment}
                  disabled={isSendingComment || !commentText.trim()}
                  className="rounded-full p-1.5 text-primary transition hover:bg-primary/10 disabled:text-[var(--text-muted)]"
                  title="Gửi"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </aside>
        )}
      </div>
    </div>,
    document.body
  );
}
