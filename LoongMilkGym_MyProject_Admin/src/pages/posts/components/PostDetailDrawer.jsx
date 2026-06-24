import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  X, ShieldAlert, Heart, MessageSquare, Bookmark,
  Calendar, Clock, AlertCircle, EyeOff, Trash2, 
  Dumbbell, Flame, Trophy
} from "lucide-react";
import { useGetPostDetailQuery } from "@/services/admin/adminApi";
import PhotoZoomModal from "@/components/common/PhotoZoomModal";
import PostWorkoutDetails from "./PostWorkoutDetails";
import PostCommentsSection from "./PostCommentsSection";

export default function PostDetailDrawer({ postId, isOpen, onClose, onModerateClick }) {
  const { data, isLoading, isError } = useGetPostDetailQuery(postId, {
    skip: !postId || !isOpen,
  });
  const [activeZoomIndex, setActiveZoomIndex] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setActiveZoomIndex(null);
      setIsZoomOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const post = data?.data;

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
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-4xl bg-[var(--bg-secondary)] border-l border-[var(--border-color)]/60 shadow-2xl flex flex-col h-full z-10 animate-slide-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]/60 bg-[var(--bg-color)]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl border border-[var(--color-primary)]/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-color)]">
                Chi tiết bài viết cộng đồng
              </h2>
              <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5">
                ID: {postId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--border-color)]/40 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-all cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-wider">Đang tải thông tin bài viết...</p>
          </div>
        ) : isError || !post ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <h3 className="text-sm font-black text-[var(--text-color)]">Lỗi tải dữ liệu</h3>
            <p className="text-xs font-bold text-[var(--text-muted)] max-w-xs">
              Bài viết này không tồn tại hoặc đã bị xóa vĩnh viễn trước đó.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col md:flex-row">
            
            {/* LEFT COLUMN: Post Content & Interaction details */}
            <div className="flex-1 border-r border-[var(--border-color)]/40 p-6 overflow-y-auto no-scrollbar space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]/40">
                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Nội dung bài đăng
                </span>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    post.visibility === 'public' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    post.visibility === 'followers' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    Hiển thị: {post.visibility === 'public' ? 'Công khai' : post.visibility === 'followers' ? 'Người theo dõi' : 'Riêng tư'}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    post.moderationStatus === 'VISIBLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    Kiểm duyệt: {post.moderationStatus === 'VISIBLE' ? 'Hiển thị' : 'Tạm ẩn'}
                  </span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/80 shadow-sm">
                {post.user?.profile?.avatarUrl ? (
                  <img 
                    src={post.user.profile.avatarUrl} 
                    alt={post.user.profile.fullName || "User Avatar"} 
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--border-color)]/60 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--border-color)] flex items-center justify-center text-sm font-black text-[var(--text-color)] ring-2 ring-[var(--border-color)]/60 flex-shrink-0">
                    {post.user?.profile?.fullName?.charAt(0).toUpperCase() || post.user?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/users?search=${post.user?.email}`}
                    className="text-xs font-black text-[var(--text-color)] hover:text-[var(--color-primary)] transition-colors truncate block"
                  >
                    {post.user?.profile?.fullName || "Người dùng Gym"}
                  </Link>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">
                    {post.user?.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Đăng lúc
                  </p>
                  <p className="text-[10px] font-bold text-[var(--text-color)] mt-0.5">
                    {formatDate(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* Post Content details */}
              <div className="space-y-4">
                {post.content && (
                  <div className="p-4.5 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/85 text-xs font-semibold text-[var(--text-color)] whitespace-pre-wrap leading-relaxed shadow-inner">
                    {post.content}
                  </div>
                )}

                {/* Media attachments */}
                {post.media && post.media.length > 0 && (() => {
                  const media = post.media;
                  const openMedia = (index) => {
                    setActiveZoomIndex(index);
                    setIsZoomOpen(true);
                  };
                  const tileClass = "relative w-full h-full min-h-0 overflow-hidden cursor-pointer bg-black/10 hover:opacity-95 transition-opacity";

                  return (
                    <div className="mt-2">
                      {media.length === 1 && (
                        <button
                          type="button"
                          onClick={() => openMedia(0)}
                          className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)]/60 bg-black/15 flex items-center justify-center max-h-[500px] p-0 text-left cursor-pointer hover:border-[var(--color-primary)]/40 transition-colors"
                        >
                          <div
                            className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                            style={{ backgroundImage: `url(${media[0].mediaUrl})` }}
                          />
                          <img
                            src={media[0].mediaUrl}
                            alt="post media"
                            className="relative z-10 w-full h-auto max-h-[500px] object-contain block mx-auto animate-in fade-in duration-300"
                          />
                        </button>
                      )}

                      {media.length === 2 && (
                        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)]/60 aspect-[3/2] w-full bg-black/5">
                          {media.map((med, index) => (
                            <button
                              type="button"
                              key={med.id || index}
                              onClick={() => openMedia(index)}
                              className="relative w-full h-full min-h-0 overflow-hidden flex items-center justify-center bg-black/15 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <div
                                className="absolute inset-0 bg-cover bg-center blur-md opacity-30 scale-105"
                                style={{ backgroundImage: `url(${med.mediaUrl})` }}
                              />
                              <img
                                src={med.mediaUrl}
                                alt="post media"
                                className="relative z-10 max-h-full max-w-full object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      {media.length === 3 && (
                        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)]/60 aspect-[3/2] w-full">
                          <button type="button" onClick={() => openMedia(0)} className={tileClass}>
                            <img
                              src={media[0].mediaUrl}
                              alt="post media"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </button>
                          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                            {[1, 2].map((idx) => (
                              <button key={idx} type="button" onClick={() => openMedia(idx)} className={tileClass}>
                                <img
                                  src={media[idx].mediaUrl}
                                  alt="post media"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {media.length === 4 && (
                        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)]/60 aspect-[3/2] w-full">
                          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                            {[0, 1].map((idx) => (
                              <button key={idx} type="button" onClick={() => openMedia(idx)} className={tileClass}>
                                <img
                                  src={media[idx].mediaUrl}
                                  alt="post media"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                            {[2, 3].map((idx) => (
                              <button key={idx} type="button" onClick={() => openMedia(idx)} className={tileClass}>
                                <img
                                  src={media[idx].mediaUrl}
                                  alt="post media"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {media.length >= 5 && (
                        <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden border border-[var(--border-color)]/60 aspect-[1/1] w-full">
                          <div className="grid grid-rows-2 gap-1 h-full min-h-0">
                            {[0, 1].map((idx) => (
                              <button key={idx} type="button" onClick={() => openMedia(idx)} className={tileClass}>
                                <img
                                  src={media[idx].mediaUrl}
                                  alt="post media"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                          <div className="grid grid-rows-3 gap-1 h-full min-h-0">
                            {[2, 3].map((idx) => (
                              <button key={idx} type="button" onClick={() => openMedia(idx)} className={tileClass}>
                                <img
                                  src={media[idx].mediaUrl}
                                  alt="post media"
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              </button>
                            ))}
                            <button type="button" onClick={() => openMedia(4)} className={tileClass}>
                              <img
                                src={media[4].mediaUrl}
                                alt="post media"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              {media.length > 5 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-base font-black pointer-events-none select-none z-10">
                                  +{media.length - 5}
                                </div>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Related Workout Session card if exists */}
              <PostWorkoutDetails session={post.relatedWorkoutSession} />

              {/* Interactions Summary */}
              <div className="flex items-center gap-4 py-3 px-4.5 rounded-2xl bg-[var(--bg-color)]/30 border border-[var(--border-color)]/40">
                <div className="flex items-center gap-1.5 text-rose-500 font-bold text-[11px]">
                  <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                  <span>{post._count?.reactions || 0} Thích</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5 fill-blue-500/20" />
                  <span>{post._count?.comments || 0} Bình luận</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[11px]">
                  <Bookmark className="w-3.5 h-3.5 fill-amber-500/20" />
                  <span>{post._count?.saves || 0} Đã lưu</span>
                </div>
              </div>

              {/* Comments Section */}
              <PostCommentsSection comments={post.comments} />
            </div>

            {/* RIGHT COLUMN: Reports & Moderated Logs */}
            <div className="w-full md:w-[380px] p-6 overflow-y-auto no-scrollbar space-y-5 bg-[var(--bg-secondary)]/80">
              
              {/* Moderation Details */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Trạng thái kiểm duyệt
                </p>
                <div className="p-4 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/80 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[var(--text-muted)]">Trạng thái:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      post.moderationStatus === "VISIBLE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {post.moderationStatus === "VISIBLE" ? "Đang hiển thị" : post.moderationStatus === "HIDDEN" ? "Tạm ẩn" : post.moderationStatus === "REMOVED" ? "Đã xóa" : post.moderationStatus}
                    </span>
                  </div>
                  {post.moderationStatus === "HIDDEN" && (
                    <>
                      <div className="border-t border-[var(--border-color)]/30 pt-2.5 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Thông tin ẩn bài:</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[var(--text-muted)]">Admin xử lý:</span>
                          <span className="font-bold text-[var(--text-color)]">
                            {post.moderatedBy?.profile?.fullName || post.moderatedBy?.email || "Quản trị viên"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[var(--text-muted)]">Thời gian:</span>
                          <span className="font-bold text-[var(--text-color)]">{formatDate(post.moderatedAt)}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--bg-color)] border border-[var(--border-color)]/50 text-day text-[10px] text-[var(--text-muted)] italic leading-relaxed mt-1">
                          Lý do: "{post.moderationReason || "Không có lý do chi tiết"}"
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Author account status summary */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                  Trạng thái người viết
                </p>
                <div className="p-4 rounded-2xl bg-[var(--bg-color)]/60 border border-[var(--border-color)]/40 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)]">Trạng thái tài khoản:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      post.user?.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      post.user?.status === "SUSPENDED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}>
                      {post.user?.status === "ACTIVE" ? "Hoạt động" : post.user?.status === "SUSPENDED" ? "Khóa tạm thời" : "Bị cấm"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--text-muted)]">Vai trò hệ thống:</span>
                    <span className="font-black text-[var(--text-color)] uppercase tracking-wide">{post.user?.role}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border-color)]/30 pt-2.5">
                    <span className="font-bold text-[var(--text-muted)]">Tổng báo cáo nhận được:</span>
                    <span className="font-extrabold text-[var(--text-color)]">{post.reports?.length || 0} báo cáo</span>
                  </div>
                </div>
              </div>

              {/* Reports Submitted Against this Post */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider">
                    Báo cáo liên quan ({post.reports?.length || 0})
                  </p>
                  {post.reports && post.reports.length > 0 && (
                    <Link
                      to={`/reports?postId=${post.id}`}
                      className="text-[9px] font-black text-[var(--color-primary)] hover:underline uppercase tracking-wider"
                    >
                      Xem tất cả
                    </Link>
                  )}
                </div>
                {post.reports && post.reports.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                    {post.reports.map((or) => (
                      <div key={or.id} className="p-3 rounded-2xl bg-[var(--bg-color)] border border-[var(--border-color)]/40 text-[10px] space-y-1">
                        <div className="flex justify-between font-bold text-[var(--text-color)]">
                          <span>{or.reporter?.profile?.fullName || or.reporter?.email}</span>
                          <span className="text-[9px] text-[var(--text-muted)]">{formatDate(or.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="font-semibold text-rose-400 italic">"{or.reason || "Lý do khác"}"</p>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                            or.status?.toUpperCase() === "PENDING" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}>
                            {or.status?.toUpperCase() === "PENDING" ? "Đang chờ" : or.status?.toUpperCase() === "RESOLVED" ? "Đã xử lý" : or.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] italic">
                    Không có báo cáo nào đối với bài viết này.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTIONS BAR */}
        {post && onModerateClick && (
          <div className="p-4 border-t border-[var(--border-color)]/60 bg-[var(--bg-secondary)] flex justify-between gap-3 shrink-0">
            <div className="flex gap-2">
              {post.moderationStatus !== "VISIBLE" && (
                <button
                  onClick={() => onModerateClick("RESTORE", post)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Khôi phục hiển thị
                </button>
              )}
              {post.moderationStatus !== "HIDDEN" && (
                <button
                  onClick={() => onModerateClick("HIDE", post)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Tạm ẩn bài viết
                </button>
              )}
            </div>

            {/* Remove Post Action */}
            <button
              onClick={() => onModerateClick("REMOVE", post)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/25 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa vĩnh viễn
            </button>
          </div>
        )}

        {isZoomOpen && post && post.media && (
          <PhotoZoomModal
            media={post.media}
            initialIndex={activeZoomIndex}
            onClose={() => {
              setIsZoomOpen(false);
              setActiveZoomIndex(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
