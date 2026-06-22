import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Send, ThumbsUp, MoreHorizontal, Edit2, Trash2, EyeOff } from "lucide-react";
import { DEFAULT_AVATAR_URL, REACTION_EMOJIS } from "../constants/community.constants";
import { capitalizeName, formatTime } from "../utils/communityFormat";
import useComposing from "../hooks/useComposing";
import ReactionsPicker from "./ReactionsPicker";
import {
  useToggleCommentReactionMutation,
  useDeleteCommentReactionMutation,
  useAddCommentMutation,
  useEditCommentMutation,
  useDeleteCommentMutation,
  useHideCommentMutation,
} from "@/services/community/communityApi";
import { useConfirm } from "@/context/ConfirmContext";
import socketClient from "@/utils/socketClient";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const getCommentAuthorName = (comment) =>
  capitalizeName(comment?.user?.profile?.fullName || "GymLife Member");

const getReplyDraft = (comment) => `${getCommentAuthorName(comment)} `;

const renderContentWithMention = (content, mentionNames = []) => {
  const text = content || "";
  const mentionName = mentionNames
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .find((name) => text.toLowerCase().startsWith(`${name.toLowerCase()} `));

  if (!mentionName) return text;

  return (
    <>
      <span className="font-black text-primary">{text.slice(0, mentionName.length)}</span>
      {text.slice(mentionName.length)}
    </>
  );
};

// Component con hiển thị và xử lý phản hồi (Reply)
function ReplyItem({
  reply,
  postId,
  onProfileClick,
  onReplyClick,
  parentComment,
  onCommentClick,
  isModal,
  mentionNames = [],
  postOwnerId,
  userInfo,
}) {
  const { requireAuth } = useRequireAuth();
  const [toggleCommentReaction] = useToggleCommentReactionMutation();
  const [deleteCommentReaction] = useDeleteCommentReactionMutation();
  const [editComment, { isLoading: isEditingLoading }] = useEditCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();
  const [hideCommentMutation] = useHideCommentMutation();
  const confirm = useConfirm();

  const [showReactions, setShowReactions] = useState(false);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const hoverTimeout = useRef(null);
  const touchTimeout = useRef(null);
  const likeButtonRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.content || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await editComment({ commentId: reply.id, content: editText.trim(), postId }).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Lỗi khi chỉnh sửa bình luận:", err);
    }
  };

  const isCommentOwner = reply.userId === userInfo?.id || reply.user?.id === userInfo?.id;
  const isPostOwner = postOwnerId === userInfo?.id;

  const handleReplyRespectClick = async (reactionType) => {
    if (!requireAuth()) return;
    try {
      if (reply.hasReacted && reply.userReaction === reactionType) {
        await deleteCommentReaction({ commentId: reply.id, postId }).unwrap();
      } else {
        await toggleCommentReaction({ commentId: reply.id, reactionType, postId }).unwrap();
      }
    } catch (err) {
      console.error("Lỗi khi tương tác phản hồi:", err);
    }
  };

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

  const handlePickerMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  const handlePickerMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
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

  useEffect(() => {
    if (!showReactions || !likeButtonRef.current) return;
    const updatePosition = () => {
      const rect = likeButtonRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const pickerHeight = 48; // Chiều cao xấp xỉ của comment picker
      const pickerWidth = 260; // Chiều rộng xấp xỉ
      
      let top = rect.top + scrollY - pickerHeight - 8;
      // Collision detection: Lật xuống dưới nếu phía trên không đủ không gian
      if (rect.top - pickerHeight - 8 < 12) {
        top = rect.bottom + scrollY + 8;
      }
      
      // Shift: Giữ popup luôn nằm trong viewport
      let left = rect.left + scrollX;
      const viewportWidth = window.innerWidth;
      if (left + pickerWidth > viewportWidth - 12) {
        left = viewportWidth - pickerWidth - 12;
      }
      if (left < 12) {
        left = 12;
      }
      
      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showReactions]);

  const rProfileId = reply.userId || reply.user?.id;
  const rCurrentReaction = REACTION_EMOJIS.find((r) => r.type === reply.userReaction);

  return (
    <div className="flex flex-col gap-1" id={`comment-${reply.id}`}>
      <div className="flex gap-2.5 items-start">
        <div
          onClick={() => onProfileClick(rProfileId)}
          className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 cursor-pointer hover:opacity-90 flex items-center justify-center"
        >
          {reply.user?.profile?.avatarUrl && reply.user.profile.avatarUrl !== DEFAULT_AVATAR_URL ? (
            <img
              src={reply.user.profile.avatarUrl}
              alt="reply avatar"
              className="w-full h-full rounded-full object-cover bg-black"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-[10px] font-black text-primary capitalize select-none">
              {reply.user?.profile?.fullName ? reply.user.profile.fullName.trim().charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 group w-full">
            {isEditing ? (
              <div className="flex-1 flex flex-col gap-1.5 mt-1">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === "Escape") {
                      setIsEditing(false);
                    }
                  }}
                  className="w-full px-3 py-1.5 text-[13px] sm:text-sm bg-[var(--border-color)]/10 border border-[var(--border-color)]/30 text-[var(--text-color)] rounded-xl focus:outline-none focus:border-primary transition-all font-semibold resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isEditingLoading || !editText.trim()}
                    className="px-2.5 py-1 bg-primary text-black font-extrabold text-[11px] rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isModal && onCommentClick && onCommentClick(parentComment.id, reply)}
                className={`bg-[var(--border-color)]/5 border border-[var(--border-color)]/15 px-3 py-1.5 rounded-2xl text-left flex-1 ${
                  !isModal ? "cursor-pointer hover:bg-[var(--border-color)]/10 transition-all" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfileClick(rProfileId);
                    }}
                    className="text-[13px] sm:text-sm font-black text-[var(--text-color)] hover:text-primary cursor-pointer transition-all"
                  >
                    {getCommentAuthorName(reply)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-bold">
                    {formatTime(reply.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] sm:text-sm font-semibold text-[var(--text-color)] mt-0.5 leading-relaxed">
                  {renderContentWithMention(reply.content, mentionNames)}
                </p>
              </div>
            )}

            {/* 3-dots Menu Button */}
            {!isEditing && (
              <div className="relative shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 hover:bg-[var(--border-color)]/20 rounded-full text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer flex items-center justify-center"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl shadow-xl py-1 w-28 z-[200] animate-fade-in text-left">
                    {isCommentOwner && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/20 transition-all text-left"
                      >
                        <Edit2 className="w-3 h-3 text-primary" />
                        Chỉnh sửa
                      </button>
                    )}

                    {(isCommentOwner || isPostOwner) ? (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          const isConfirmed = await confirm({
                            title: "Xóa phản hồi",
                            message: "Bạn có chắc chắn muốn xóa phản hồi này?",
                            confirmText: "Xóa",
                            cancelText: "Hủy",
                            type: "danger",
                          });
                          if (isConfirmed) {
                            try {
                              await deleteCommentMutation({ commentId: reply.id, postId }).unwrap();
                            } catch (err) {
                              console.error("Lỗi khi xóa bình luận:", err);
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await hideCommentMutation({ commentId: reply.id, postId }).unwrap();
                          } catch (err) {
                            console.error("Lỗi khi ẩn bình luận:", err);
                          }
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--border-color)]/20 transition-all text-left"
                      >
                        <EyeOff className="w-3 h-3" />
                        Ẩn bình luận
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 px-2 mt-0.5 text-xs font-bold text-[var(--text-muted)] select-none">
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                ref={likeButtonRef}
                type="button"
                onClick={() => {
                  if (reply.hasReacted) {
                    handleReplyRespectClick(reply.userReaction);
                  } else {
                    handleReplyRespectClick("like");
                  }
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`hover:underline cursor-pointer ${
                  reply.hasReacted ? rCurrentReaction?.color || "text-primary" : ""
                }`}
              >
                {reply.hasReacted ? rCurrentReaction?.label : "Thích"}
              </button>

              {showLikeTooltip && !showReactions && (
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 bg-neutral-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap animate-tooltip-in z-30">
                  Thích
                </div>
              )}
            </div>

            {showReactions && createPortal(
              <ReactionsPicker
                variant="comment"
                onMouseEnter={handlePickerMouseEnter}
                onMouseLeave={handlePickerMouseLeave}
                onSelect={(type) => {
                  if (requireAuth()) {
                    handleReplyRespectClick(type);
                  }
                  setShowReactions(false);
                }}
                onClose={() => setShowReactions(false)}
                style={{
                  position: "absolute",
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  zIndex: 100000,
                }}
              />,
              document.body
            )}

            <span>·</span>
            <button
              type="button"
              onClick={() => {
                if (requireAuth()) {
                  if (!isModal && onCommentClick) {
                    onCommentClick(parentComment.id, reply);
                  } else {
                    onReplyClick(reply);
                  }
                }
              }}
              className="hover:underline cursor-pointer"
            >
              Trả lời
            </button>

            {reply.reactionsCount > 0 && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1 bg-[var(--border-color)]/10 px-1 py-0.5 rounded-full">
                  <div className="flex items-center -space-x-1">
                    {reply.activeReactions?.map((reactType) => (
                      <span key={reactType} className="text-xs" title={reactType}>
                        {reactType === "like" && (
                          <ThumbsUp className="w-2.5 h-2.5 text-[#4d7c0f] dark:text-[#ccff00] fill-[#ccff00] inline-block" />
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
                  <span className="text-[9px] text-[var(--text-muted)] font-black">
                    {reply.reactionsCount}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị và xử lý bình luận cha (Parent Comment)
function CommentItem({ comment, postId, userInfo, onProfileClick, onCommentClick, isModal, autoFocusReply, mentionNames = [], postOwnerId }) {
  const { requireAuth } = useRequireAuth();
  const [toggleCommentReaction] = useToggleCommentReactionMutation();
  const [deleteCommentReaction] = useDeleteCommentReactionMutation();
  const [editComment, { isLoading: isEditingLoading }] = useEditCommentMutation();
  const [deleteCommentMutation] = useDeleteCommentMutation();
  const [hideCommentMutation] = useHideCommentMutation();
  const confirm = useConfirm();

  const [showReactions, setShowReactions] = useState(false);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const hoverTimeout = useRef(null);
  const touchTimeout = useRef(null);
  const likeButtonRef = useRef(null);
  const replyInputRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || "");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await editComment({ commentId: comment.id, content: editText.trim(), postId }).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error("Lỗi khi chỉnh sửa bình luận:", err);
    }
  };

  const isCommentOwner = comment.userId === userInfo?.id || comment.user?.id === userInfo?.id;
  const isPostOwner = postOwnerId === userInfo?.id;

  // States mới cho Reply ngay bên dưới và Giới hạn comment con
  const [isReplying, setIsReplying] = useState(autoFocusReply || false);
  const [replyText, setReplyText] = useState("");
  const [showAllReplies, setShowAllReplies] = useState(autoFocusReply || false);
  const [addComment, { isLoading: isSubmittingReply }] = useAddCommentMutation();
  const replyComposing = useComposing();

  useEffect(() => {
    if (autoFocusReply) {
      setIsReplying(true);
      setShowAllReplies(true);
      setReplyText((current) => current || getReplyDraft(autoFocusReply));
    }
  }, [autoFocusReply]);

  useEffect(() => {
    if (isReplying && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [isReplying]);

  useEffect(() => {
    if (replyText === "" && replyInputRef.current) {
      replyInputRef.current.style.height = "auto";
      replyInputRef.current.style.overflowY = "hidden";
    }
  }, [replyText]);

  const handleSendReply = async () => {
    if (!requireAuth()) return;
    if (!replyText.trim()) return;
    try {
      await addComment({
        postId,
        content: replyText.trim(),
        parentCommentId: comment.id,
      }).unwrap();
      setReplyText("");
      setIsReplying(false);
    } catch (err) {
      console.error("Lỗi khi thêm phản hồi:", err);
    }
  };

  const handleRespectClick = async (reactionType) => {
    if (!requireAuth()) return;
    try {
      if (comment.hasReacted && comment.userReaction === reactionType) {
        await deleteCommentReaction({ commentId: comment.id, postId }).unwrap();
      } else {
        await toggleCommentReaction({ commentId: comment.id, reactionType, postId }).unwrap();
      }
    } catch (err) {
      console.error("Lỗi khi tương tác bình luận:", err);
    }
  };

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

  const handlePickerMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
  };

  const handlePickerMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
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

  useEffect(() => {
    if (!showReactions || !likeButtonRef.current) return;
    const updatePosition = () => {
      const rect = likeButtonRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;
      const pickerHeight = 48;
      const pickerWidth = 260;
      
      let top = rect.top + scrollY - pickerHeight - 8;
      if (rect.top - pickerHeight - 8 < 12) {
        top = rect.bottom + scrollY + 8;
      }
      
      let left = rect.left + scrollX;
      const viewportWidth = window.innerWidth;
      if (left + pickerWidth > viewportWidth - 12) {
        left = viewportWidth - pickerWidth - 12;
      }
      if (left < 12) {
        left = 12;
      }
      
      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [showReactions]);

  const currentReaction = REACTION_EMOJIS.find((r) => r.type === comment.userReaction);
  const profileId = comment.userId || comment.user?.id;

  // Lọc lấy danh sách reply hiển thị
  const displayedReplies = showAllReplies
    ? comment.replies
    : comment.replies?.slice(0, 1) || [];

  return (
    <div className="flex flex-col gap-1.5" id={`comment-${comment.id}`}>
      <div className="flex gap-2.5 items-start">
        <div
          onClick={() => onProfileClick(profileId)}
          className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 cursor-pointer hover:opacity-90 flex items-center justify-center"
        >
          {comment.user?.profile?.avatarUrl && comment.user.profile.avatarUrl !== DEFAULT_AVATAR_URL ? (
            <img
              src={comment.user.profile.avatarUrl}
              alt="comm avatar"
              className="w-full h-full rounded-full object-cover bg-black"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-xs font-black text-primary capitalize select-none">
              {comment.user?.profile?.fullName ? comment.user.profile.fullName.trim().charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2 group w-full">
            {isEditing ? (
              <div className="flex-1 flex flex-col gap-1.5 mt-1">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === "Escape") {
                      setIsEditing(false);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-[13px] sm:text-sm bg-[var(--border-color)]/10 border border-[var(--border-color)]/30 text-[var(--text-color)] rounded-xl focus:outline-none focus:border-primary transition-all font-semibold resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isEditingLoading || !editText.trim()}
                    className="px-3 py-1 bg-primary text-black font-extrabold text-[11px] rounded-lg hover:bg-primary-hover transition-all disabled:opacity-50"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => onCommentClick && onCommentClick(comment.id, comment)}
                className="bg-[var(--border-color)]/10 border border-[var(--border-color)]/20 px-3.5 py-2 rounded-2xl cursor-pointer hover:bg-[var(--border-color)]/15 transition-all text-left flex-1"
              >
                <div className="flex justify-between items-center">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onProfileClick(profileId);
                    }}
                    className="text-[13px] sm:text-sm font-black text-[var(--text-color)] hover:text-primary cursor-pointer transition-all"
                  >
                    {getCommentAuthorName(comment)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-bold">
                    {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] sm:text-sm font-semibold text-[var(--text-color)] mt-1 leading-relaxed">
                  {renderContentWithMention(comment.content, mentionNames)}
                </p>
              </div>
            )}

            {/* 3-dots Menu Button */}
            {!isEditing && (
              <div className="relative shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 hover:bg-[var(--border-color)]/20 rounded-full text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer flex items-center justify-center"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 bottom-full mb-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 rounded-xl shadow-xl py-1 w-28 z-[200] animate-fade-in text-left">
                    {isCommentOwner && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditing(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-bold text-[var(--text-color)] hover:bg-[var(--border-color)]/20 transition-all text-left"
                      >
                        <Edit2 className="w-3 h-3 text-primary" />
                        Chỉnh sửa
                      </button>
                    )}

                    {(isCommentOwner || isPostOwner) ? (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setIsMenuOpen(false);
                          const isConfirmed = await confirm({
                            title: "Xóa bình luận",
                            message: "Bạn có chắc chắn muốn xóa bình luận này?",
                            confirmText: "Xóa",
                            cancelText: "Hủy",
                            type: "danger",
                          });
                          if (isConfirmed) {
                            try {
                              await deleteCommentMutation({ commentId: comment.id, postId }).unwrap();
                            } catch (err) {
                              console.error("Lỗi khi xóa bình luận:", err);
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await hideCommentMutation({ commentId: comment.id, postId }).unwrap();
                          } catch (err) {
                            console.error("Lỗi khi ẩn bình luận:", err);
                          }
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--border-color)]/20 transition-all text-left"
                      >
                        <EyeOff className="w-3 h-3" />
                        Ẩn bình luận
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions & Reactions Row */}
          <div className="flex items-center gap-3.5 px-2 mt-1 text-xs font-bold text-[var(--text-muted)] select-none">
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                ref={likeButtonRef}
                type="button"
                onClick={() => {
                  if (comment.hasReacted) {
                    handleRespectClick(comment.userReaction);
                  } else {
                    handleRespectClick("like");
                  }
                }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`hover:underline cursor-pointer ${
                  comment.hasReacted ? currentReaction?.color || "text-primary" : ""
                }`}
              >
                {comment.hasReacted ? currentReaction?.label : "Thích"}
              </button>

              {showLikeTooltip && !showReactions && (
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 bg-neutral-900/90 text-white text-[12px] font-bold px-2.5 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap animate-tooltip-in z-30">
                  Thích
                </div>
              )}
            </div>

            {showReactions && createPortal(
              <ReactionsPicker
                variant="comment"
                onMouseEnter={handlePickerMouseEnter}
                onMouseLeave={handlePickerMouseLeave}
                onSelect={(type) => {
                  if (requireAuth()) {
                    handleRespectClick(type);
                  }
                  setShowReactions(false);
                }}
                onClose={() => setShowReactions(false)}
                style={{
                  position: "absolute",
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  zIndex: 100000,
                }}
              />,
              document.body
            )}

            <span>·</span>

            {/* Reply Button */}
            <button
              type="button"
              onClick={() => {
                if (requireAuth()) {
                  if (!isModal && onCommentClick) {
                    onCommentClick(comment.id, comment);
                  } else {
                    setReplyText((current) => current || getReplyDraft(comment));
                    setIsReplying(true);
                  }
                }
              }}
              className="hover:underline cursor-pointer"
            >
              Trả lời
            </button>

            {/* Reactions count & icons */}
            {comment.reactionsCount > 0 && (
              <>
                <span>·</span>
                <div className="flex items-center gap-1 bg-[var(--border-color)]/10 px-1.5 py-0.5 rounded-full">
                  <div className="flex items-center -space-x-1">
                    {comment.activeReactions?.map((reactType) => (
                      <span key={reactType} className="text-xs" title={reactType}>
                        {reactType === "like" && (
                          <ThumbsUp className="w-2.5 h-2.5 text-[#4d7c0f] dark:text-[#ccff00] fill-[#ccff00] inline-block" />
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
                  <span className="text-[10px] text-[var(--text-muted)] font-black">
                    {comment.reactionsCount}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Render child comments/replies & Reply input */}
      {((comment.replies && comment.replies.length > 0) || isReplying) && (
        <div className="mt-1.5 flex flex-col gap-2 pl-10">
          {comment.replies && comment.replies.length > 0 && displayedReplies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              postId={postId}
              onProfileClick={onProfileClick}
              onReplyClick={(targetComment) => {
                setReplyText(getReplyDraft(targetComment));
                setIsReplying(true);
                setShowAllReplies(true);
              }}
              parentComment={comment}
              onCommentClick={onCommentClick}
              isModal={isModal}
              mentionNames={mentionNames}
              postOwnerId={postOwnerId}
              userInfo={userInfo}
            />
          ))}

          {/* Toggle Expand/Collapse replies */}
          {comment.replies && comment.replies.length > 1 && (
            <div className="flex items-center mt-0.5">
              {!showAllReplies ? (
                <button
                  type="button"
                  onClick={() => setShowAllReplies(true)}
                  className="text-xs font-extrabold text-primary hover:text-primary-hover hover:underline flex items-center gap-1 cursor-pointer transition-all"
                >
                  Xem thêm {comment.replies.length - 1} phản hồi khác
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAllReplies(false)}
                  className="text-xs font-extrabold text-[var(--text-muted)] hover:text-[var(--text-color)] hover:underline flex items-center gap-1 cursor-pointer transition-all"
                >
                  Ẩn bớt phản hồi
                </button>
              )}
            </div>
          )}

          {/* Reply input field */}
          {isReplying && (
            <div className="flex gap-2.5 items-center mt-1.5 animate-fade-in">
              <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 flex items-center justify-center">
                {userInfo?.profile?.avatarUrl && userInfo.profile.avatarUrl !== DEFAULT_AVATAR_URL ? (
                  <img
                    src={userInfo.profile.avatarUrl}
                    alt="my avatar"
                    className="w-full h-full rounded-full object-cover bg-black"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-xs font-black text-primary capitalize select-none">
                    {userInfo?.profile?.fullName ? userInfo.profile.fullName.trim().charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </div>
              <div className="flex-1 relative flex items-center">
                <textarea
                  ref={replyInputRef}
                  rows={1}
                  placeholder={`Nhắc tên ${getCommentAuthorName(comment)} để trả lời...`}
                  value={replyText}
                  onFocus={(e) => {
                    if (!requireAuth()) {
                      e.target.blur();
                    }
                  }}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    e.target.style.height = "auto";
                    const newHeight = Math.min(e.target.scrollHeight, 120);
                    e.target.style.height = `${newHeight}px`;
                    e.target.style.overflowY = e.target.scrollHeight > 120 ? "auto" : "hidden";
                  }}
                  onCompositionStart={replyComposing.onCompositionStart}
                  onCompositionEnd={replyComposing.onCompositionEnd}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !replyComposing.isComposingRef.current) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  className="w-full pl-3.5 pr-9 py-2 text-[13px] sm:text-sm bg-[var(--border-color)]/20 border border-[var(--border-color)]/30 text-[var(--text-color)] rounded-2xl focus:outline-none focus:border-primary transition-all font-semibold resize-none overflow-y-hidden max-h-[120px] leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSubmittingReply || !replyText.trim()}
                  className="absolute right-1.5 p-1 hover:bg-primary/10 rounded-xl text-primary transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyText("");
                }}
                className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer px-1"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CommentsSection({
  postId,
  commentInput,
  comments = [],
  commentsCount = 0,
  onCommentChange,
  onProfileClick,
  onSendComment,
  userInfo,
  onCommentClick,
  onViewMoreComments,
  isModal = false,
  initialAutoReplyComment,
  postOwnerId,
}) {
  const { requireAuth } = useRequireAuth();
  const mainInputRef = useRef(null);
  const mainComposing = useComposing();

  const [localComments, setLocalComments] = useState(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (!postId) return;

    const channelName = `post-${postId}`;
    const channel = socketClient.subscribe(channelName);

    channel.bind("comment.created", (newComment) => {
      setLocalComments((prev) => {
        if (!newComment.parentCommentId) {
          if (prev.some((c) => c.id === newComment.id)) return prev;
          return [newComment, ...prev];
        } else {
          return prev.map((c) => {
            if (c.id === newComment.parentCommentId) {
              const replies = c.replies || [];
              if (replies.some((r) => r.id === newComment.id)) return c;
              return {
                ...c,
                replies: [...replies, newComment],
              };
            }
            return c;
          });
        }
      });
    });

    channel.bind("comment.updated", (updatedComment) => {
      setLocalComments((prev) => {
        if (!updatedComment.parentCommentId) {
          return prev.map((c) => (c.id === updatedComment.id ? { ...c, ...updatedComment, replies: c.replies } : c));
        } else {
          return prev.map((c) => {
            if (c.id === updatedComment.parentCommentId) {
              const replies = c.replies || [];
              return {
                ...c,
                replies: replies.map((r) => (r.id === updatedComment.id ? { ...r, ...updatedComment } : r)),
              };
            }
            return c;
          });
        }
      });
    });

    channel.bind("comment.deleted", ({ commentId, parentCommentId }) => {
      setLocalComments((prev) => {
        if (!parentCommentId) {
          return prev.filter((c) => c.id !== commentId);
        } else {
          return prev.map((c) => {
            if (c.id === parentCommentId) {
              const replies = c.replies || [];
              return {
                ...c,
                replies: replies.filter((r) => r.id !== commentId),
              };
            }
            return c;
          });
        }
      });
    });

    channel.bind("comment.reaction.updated", ({ commentId, parentCommentId, reactions, reactionsCount, activeReactions }) => {
      setLocalComments((prev) => {
        const currentUserId = userInfo?.id;
        if (!parentCommentId) {
          return prev.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                reactionsCount,
                activeReactions,
                hasReacted: reactions.some((r) => r.userId === currentUserId),
                userReaction: reactions.find((r) => r.userId === currentUserId)?.reactionType || null,
              };
            }
            return c;
          });
        } else {
          return prev.map((c) => {
            if (c.id === parentCommentId) {
              const replies = c.replies || [];
              return {
                ...c,
                replies: replies.map((r) => {
                  if (r.id === commentId) {
                    return {
                      ...r,
                      reactionsCount,
                      activeReactions,
                      hasReacted: reactions.some((r2) => r2.userId === currentUserId),
                      userReaction: reactions.find((r2) => r2.userId === currentUserId)?.reactionType || null,
                    };
                  }
                  return r;
                }),
              };
            }
            return c;
          });
        }
      });
    });

    return () => {
      channel.unbind_all();
      socketClient.unsubscribe(channelName);
    };
  }, [postId, userInfo]);

  useEffect(() => {
    if (!commentInput && mainInputRef.current) {
      mainInputRef.current.style.height = "auto";
      mainInputRef.current.style.overflowY = "hidden";
    }
  }, [commentInput]);

  const displayedComments = isModal ? localComments : localComments.slice(0, 3);
  const mentionNames = Array.from(new Set(
    localComments
      .flatMap((comment) => [comment, ...(comment.replies || [])])
      .map(getCommentAuthorName)
      .filter(Boolean)
  ));

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--border-color)]/20 pt-3 mt-1.5">
      {/* View more comments text */}
      {commentsCount > displayedComments.length && onViewMoreComments && (
        <button
          onClick={onViewMoreComments}
          className="text-left text-xs font-black text-primary hover:text-primary-hover hover:underline mb-1 cursor-pointer transition-all"
        >
          Xem thêm bình luận ({commentsCount - displayedComments.length})
        </button>
      )}

      {displayedComments && displayedComments.length > 0 && (
        <div className={isModal ? "flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1" : "flex flex-col gap-3.5 pr-1"}>
          {displayedComments.map((comm) => (
            <CommentItem
              key={comm.id}
              comment={comm}
              postId={postId}
              userInfo={userInfo}
              onProfileClick={onProfileClick}
              onCommentClick={onCommentClick}
              isModal={isModal}
              autoFocusReply={
                initialAutoReplyComment &&
                (initialAutoReplyComment.id === comm.id ||
                  comm.replies?.some((reply) => reply.id === initialAutoReplyComment.id))
                  ? initialAutoReplyComment
                  : null
              }
              mentionNames={mentionNames}
              postOwnerId={postOwnerId}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2.5 items-center mt-1">
        <div className="w-8 h-8 rounded-full p-[1px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm shrink-0 flex items-center justify-center">
          {userInfo?.profile?.avatarUrl && userInfo.profile.avatarUrl !== DEFAULT_AVATAR_URL ? (
            <img
              src={userInfo.profile.avatarUrl}
              alt="my avatar"
              className="w-full h-full rounded-full object-cover bg-black"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-xs font-black text-primary capitalize select-none">
              {userInfo?.profile?.fullName ? userInfo.profile.fullName.trim().charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="flex-1 relative flex items-center">
          <textarea
            ref={mainInputRef}
            id={`comment-input-${postId}`}
            rows={1}
            placeholder={`Bình luận dưới tên ${userInfo?.profile?.fullName || "GymLife Member"}`}
            value={commentInput || ""}
            onFocus={(e) => {
              if (!requireAuth()) {
                e.target.blur();
              }
            }}
            onChange={(e) => {
              onCommentChange(e.target.value);
              e.target.style.height = "auto";
              const newHeight = Math.min(e.target.scrollHeight, 120);
              e.target.style.height = `${newHeight}px`;
              e.target.style.overflowY = e.target.scrollHeight > 120 ? "auto" : "hidden";
            }}
            onCompositionStart={mainComposing.onCompositionStart}
            onCompositionEnd={mainComposing.onCompositionEnd}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !mainComposing.isComposingRef.current) {
                e.preventDefault();
                if (requireAuth()) {
                  onSendComment();
                }
              }
            }}
            className="w-full pl-4 pr-10 py-2.5 text-[13px] sm:text-sm bg-[var(--border-color)]/20 border border-[var(--border-color)]/30 text-[var(--text-color)] rounded-2xl focus:outline-none focus:border-primary transition-all font-semibold resize-none overflow-y-hidden max-h-[120px] leading-relaxed"
          />
          <button
            onClick={() => {
              if (requireAuth()) {
                onSendComment();
              }
            }}
            className="absolute right-2 p-1.5 hover:bg-primary/10 rounded-xl text-primary transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
