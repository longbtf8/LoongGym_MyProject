import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, 
  Dumbbell, 
  Image as ImageIcon, 
  Calendar, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Globe, 
  Lock,
  MoreHorizontal,
  Pencil,
  EyeOff,
  Flag,
  Heart,
  MessageSquare,
  Send,
  Settings,
  LayoutDashboard,
  Smile,
  Home,
  User,
  Target,
  Phone,
  Activity,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { 
  useUploadAvatarMutation, 
  useUploadCoverMutation,
  useUpdateAvatarPhotoMutation,
  useUpdateCoverPhotoMutation,
  useFollowUserMutation,
  useUnfollowUserMutation 
} from "@/services/auth/authApi";
import { 
  useGetPostsQuery,
  useGetArchivedPostsQuery,
  useAddCommentMutation,
  useToggleReactionMutation,
  useDeleteReactionMutation,
  useDeletePostMutation
} from "@/services/community/communityApi";
import { useAuth } from "@/hooks/useAuth";
import { getFitnessLevelLabel } from "@/pages/account/profile/PersonalInfoSection/constants";
import CreatePostModal from "@/pages/community/components/CreatePostModal";
import DeletePostModal from "@/pages/community/components/DeletePostModal";
import AvatarPhotoModal from "./AvatarPhotoModal";
import CoverPhotoModal from "./CoverPhotoModal";
import PostFeed from "@/pages/community/components/PostFeed";

const DEFAULT_COVER = "/default-bg.png";
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&auto=format&fit=crop&q=60";

export default function ProfileDashboard({ profile, isOwnProfile }) {
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [avatarModalMode, setAvatarModalMode] = useState(null);
  const [coverModalMode, setCoverModalMode] = useState(null);
  const [openPostMenuId, setOpenPostMenuId] = useState(null);
  const [hiddenPostIds, setHiddenPostIds] = useState([]);
  const [reportPost, setReportPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [reportText, setReportText] = useState("");
  const coverFrameRef = useRef(null);
  const [coverFrameSize, setCoverFrameSize] = useState({ width: 0, height: 0 });

  // References for inputs
  // Mutations
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [uploadCover, { isLoading: isUploadingCover }] = useUploadCoverMutation();
  const [updateAvatarPhoto, { isLoading: isUpdatingAvatarPhoto }] = useUpdateAvatarPhotoMutation();
  const [updateCoverPhoto, { isLoading: isUpdatingCoverPhoto }] = useUpdateCoverPhotoMutation();
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();

  // Fetch author posts
  const { data: postsResponse, isLoading: isLoadingPosts } = useGetPostsQuery({ 
    authorId: profile?.userId,
    page: 1,
    limit: 100
  });
  const posts = postsResponse?.data || [];
  
  // Toast state and helper
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const toastTimerRef = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const coverFrame = coverFrameRef.current;
    if (!coverFrame) return undefined;

    const updateCoverFrameSize = () => {
      const rect = coverFrame.getBoundingClientRect();
      setCoverFrameSize({ width: rect.width, height: rect.height });
    };

    updateCoverFrameSize();
    const resizeObserver = new ResizeObserver(updateCoverFrameSize);
    resizeObserver.observe(coverFrame);
    window.addEventListener("resize", updateCoverFrameSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCoverFrameSize);
    };
  }, []);

  // Fetch archived posts
  const { data: archivedPostsResponse, isLoading: isLoadingArchive } = useGetArchivedPostsQuery({
    page: 1,
    limit: 10
  }, {
    skip: activeTab !== "archive" || !isOwnProfile,
  });
  const archivedPosts = archivedPostsResponse?.data || [];

  const visiblePosts = posts.filter((post) => !hiddenPostIds.includes(post.id));
  const ownPostedImages = Array.from(new Set(
    posts
      .flatMap((post) => post.media || [])
      .filter((media) => !media.mediaType || media.mediaType === "image")
      .map((media) => media.mediaUrl)
      .filter(Boolean)
  ));

  const hasIntroInfo = !!(
    profile?.bio ||
    profile?.address ||
    profile?.birthDate ||
    profile?.gender ||
    profile?.fitnessLevel ||
    profile?.goal ||
    profile?.phone
  );

  const navigate = useNavigate();
  const [toggleReaction] = useToggleReactionMutation();
  const [deleteReaction] = useDeleteReactionMutation();
  const [addComment] = useAddCommentMutation();
  const [deletePost] = useDeletePostMutation();

  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const handleToggleComments = (postId) => {
    setOpenComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleRespectClick = async (post, reactionType = "like") => {
    try {
      if (post.hasReacted && post.userReaction === reactionType) {
        await deleteReaction({ postId: post.id, reactionType }).unwrap();
      } else {
        await toggleReaction({ postId: post.id, reactionType }).unwrap();
      }
    } catch (err) {
      console.error("Lỗi khi tương tác bài viết:", err);
    }
  };

  const handleSendComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await addComment({ postId, content: text }).unwrap();
      setCommentInputs(prev => ({
        ...prev,
        [postId]: ""
      }));
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
    }
  };

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete).unwrap();
      showToast("Đã xóa bài viết thành công.");
    } catch (err) {
      console.error("Lỗi xóa bài đăng:", err);
      showToast("Không thể xóa bài viết lúc này.","error");
    } finally {
      setPostToDelete(null);
    }
  };

  const handleHidePost = (postId) => {
    setHiddenPostIds((currentIds) => [...new Set([...currentIds, postId])]);
    setOpenPostMenuId(null);
  };

  const handleReportSubmit = () => {
    console.log("Báo cáo bài viết:", {
      postId: reportPost?.id,
      reason: reportText.trim(),
    });
    setReportPost(null);
    setReportText("");
  };

  // Helper formats
  const capitalizeName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMin / 60);
    
    if (diffMin < 1) return "vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
  };

  const formatWorkoutDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const PostContent = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const limit = 250;

    if (text.length <= limit) {
      return (
        <p className="text-sm font-semibold text-[var(--text-color)] leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      );
    }

    return (
      <p className="text-sm font-semibold text-[var(--text-color)] leading-relaxed whitespace-pre-wrap">
        {isExpanded ? text : `${text.slice(0, limit)}... `}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:underline font-bold text-xs inline-block ml-1 cursor-pointer bg-transparent border-0 p-0"
        >
          {isExpanded ? "Thu gọn" : "Xem thêm"}
        </button>
      </p>
    );
  };

  const handleCoverSave = async ({ file, coverPhotoUrl, coverPhotoProfile }) => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("image-cover", file);
        formData.append("coverPhotoProfile", JSON.stringify(coverPhotoProfile || {}));
        await uploadCover(formData).unwrap();
        showToast("Tải ảnh bìa lên thành công.");
      } else {
        await updateCoverPhoto({ coverPhotoUrl, coverPhotoProfile }).unwrap();
        showToast("Đã cập nhật ảnh bìa.");
      }
    } catch (err) {
      console.error("Lỗi lưu ảnh bìa:", err);
      showToast("Không thể lưu ảnh bìa lúc này.", "error");
      throw err;
    }
  };

  const handleRemoveCover = async () => {
    try {
      await updateCoverPhoto({ coverPhotoUrl: null, coverPhotoProfile: null }).unwrap();
      showToast("Gỡ ảnh bìa thành công.");
    } catch (err) {
      console.error("Lỗi gỡ ảnh bìa:", err);
      showToast("Không thể gỡ ảnh bìa lúc này.", "error");
      throw err;
    }
  };

  const handleAvatarUpload = async (file, avatarProfile, avatarUrl) => {
    showToast(file ? "Đang tải ảnh đại diện..." : "Đang cập nhật ảnh đại diện.");

    const request = file
      ? (() => {
          const formData = new FormData();
          formData.append("image-avatar", file);
          formData.append("avatarProfile", JSON.stringify(avatarProfile || {}));
          return uploadAvatar(formData).unwrap();
        })()
      : updateAvatarPhoto({ avatarUrl, avatarProfile }).unwrap();

    request
      .then(() => {
        showToast(file ? "Tải ảnh đại diện lên thành công." : "Đã cập nhật ảnh đại diện.");
      })
      .catch((err) => {
        console.error("Lỗi tải ảnh đại diện lên:", err);
        showToast("Tải ảnh đại diện thất bại, hãy liên hệ admin để được giúp đỡ.", "error");
      });

    return Promise.resolve();
  };

  const handleFollowToggle = async () => {
    if (profile?.isFollowing) {
      await unfollowUser(profile.userId).unwrap();
    } else {
      await followUser(profile.userId).unwrap();
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return "0 phút";
    return `${Math.round(sec / 60)} phút`;
  };

  const formatBirthDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getDate()} tháng ${date.getMonth() + 1}`;
  };

  const profileTabs = [
    { id: "posts", label: "Bài viết" },
    { id: "photos", label: "Ảnh tiến trình" },
    { id: "history", label: "Lịch sử tập luyện" },
    ...(isOwnProfile ? [{ id: "archive", label: "Kho lưu trữ" }] : []),
  ];

  const PostActionMenu = ({ post, isAuthor }) => {
    const menuRef = useRef(null);
    const isMenuOpen = openPostMenuId === post.id;
    const isOwnProfileAuthorPost = isOwnProfile && isAuthor;

    useEffect(() => {
      if (!isMenuOpen) return undefined;

      const handlePointerDown = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setOpenPostMenuId(null);
        }
      };

      document.addEventListener("pointerdown", handlePointerDown);
      return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [isMenuOpen]);

    const runAction = (handler) => {
      setOpenPostMenuId(null);
      handler?.();
    };

    return (
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpenPostMenuId((currentId) => currentId === post.id ? null : post.id)}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/30 rounded-full transition-all cursor-pointer"
          title="Tùy chọn bài viết"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full z-40 mt-2 w-[min(330px,calc(100vw-48px))] overflow-visible rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 shadow-2xl">
            <span className="absolute -top-2 right-5 h-4 w-4 rotate-45 border-l border-t border-[var(--border-color)] bg-[var(--bg-secondary)]" />
            <div className="relative flex flex-col">
              {isAuthor ? (
                <>
                  <button
                    type="button"
                    onClick={() => runAction(() => console.log("Chỉnh sửa bài viết:", post.id))}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    <Pencil className="w-5 h-5 text-primary" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction(() => console.log("Chỉnh sửa đối tượng:", post.id))}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    {post.visibility === "public" ? (
                      <Globe className="w-5 h-5 text-primary" />
                    ) : (
                      <Lock className="w-5 h-5 text-primary" />
                    )}
                    <span>Chỉnh sửa đối tượng</span>
                  </button>
                  {isOwnProfileAuthorPost && (
                    <button
                      type="button"
                      onClick={() => runAction(() => handleHidePost(post.id))}
                      className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                    >
                      <EyeOff className="w-5 h-5 text-primary" />
                      <span>Ẩn khỏi trang cá nhân</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => runAction(() => handleDeletePost(post.id))}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-rose-500 transition-all hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Xóa</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => runAction(() => handleFollowToggle())}
                    disabled={isFollowing || isUnfollowing}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30 disabled:opacity-60"
                  >
                    {profile?.isFollowing ? (
                      <UserMinus className="w-5 h-5 text-primary" />
                    ) : (
                      <UserPlus className="w-5 h-5 text-primary" />
                    )}
                    <span>{profile?.isFollowing ? "Hủy theo dõi" : "Theo dõi"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction(() => handleHidePost(post.id))}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    <EyeOff className="w-5 h-5 text-primary" />
                    <span>Tôi không muốn thấy các bài viết như này nữa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction(() => setReportPost(post))}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/30"
                  >
                    <Flag className="w-5 h-5 text-rose-500" />
                    <span>Báo cáo</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfileTabs = () => (
    <div className="relative z-10 -mx-1 bg-[var(--bg-color)]/95 px-1 pb-1 pt-0">
      <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none]">
        {profileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-3 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap rounded-2xl ${
              activeTab === tab.id
                ? "text-primary bg-primary/8"
                : "text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--border-color)]/20"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute left-5 right-5 -bottom-0.5 h-[3px] rounded-full bg-primary shadow-[0_0_12px_rgba(204,255,0,0.45)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 animate-fade-in w-full">
      
      {/* Cover and Avatar Header Area */}
      <div className="relative overflow-visible border-b border-[var(--border-color)]/65 pb-5">
        
        {/* Cover Photo */}
        <div ref={coverFrameRef} className="h-[190px] sm:h-[260px] w-full relative bg-black/40 rounded-3xl overflow-visible">
          <img 
            src={profile?.coverPhotoUrl || DEFAULT_COVER} 
            alt="cover photo" 
            className="w-full h-full rounded-3xl object-cover"
            style={{
              objectPosition: profile?.coverPhotoProfile?.objectPosition || "50% 50%",
            }}
          />
          {isOwnProfile && (
            <div className="absolute right-3 top-3 z-30 lg:bottom-4 lg:right-4 lg:top-auto">
              <button 
                onClick={() => setCoverModalMode("menu")}
                disabled={isUploadingCover || isUpdatingCoverPhoto}
                className="flex items-center gap-1.5 px-3 py-2 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border border-white/10 text-[10px] sm:text-[11px] font-black rounded-xl transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 text-primary" />
                <span>{isUploadingCover || isUpdatingCoverPhoto ? "Đang lưu..." : "Chỉnh sửa ảnh bìa"}</span>
              </button>
              <CoverPhotoModal
                open={Boolean(coverModalMode)}
                mode={coverModalMode || "menu"}
                currentCoverUrl={profile?.coverPhotoUrl || ""}
                defaultCoverUrl={DEFAULT_COVER}
                currentProfile={profile?.coverPhotoProfile}
                suggestedImages={ownPostedImages}
                isSaving={isUploadingCover || isUpdatingCoverPhoto}
                frameSize={coverFrameSize}
                onSave={handleCoverSave}
                onRemove={handleRemoveCover}
                onClose={() => setCoverModalMode(null)}
              />
            </div>
          )}
          {!isOwnProfile && (profile?.coverPhotoUrl || DEFAULT_COVER) && (
            <button
              type="button"
              onClick={() => setCoverModalMode("viewer")}
              className="absolute inset-0 cursor-pointer"
              aria-label="Xem ảnh bìa"
            />
          )}
          {!isOwnProfile && (
            <CoverPhotoModal
              open={coverModalMode === "viewer"}
              mode="viewer"
              currentCoverUrl={profile?.coverPhotoUrl || ""}
              defaultCoverUrl={DEFAULT_COVER}
              currentProfile={profile?.coverPhotoProfile}
              suggestedImages={[]}
              onClose={() => setCoverModalMode(null)}
            />
          )}
        </div>

        {/* Profile Info Overlay Row */}
        <div className="px-2 sm:px-6 pt-0 relative flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 flex-1 min-w-0 text-center lg:text-left">
            {/* Avatar (Overlapping) */}
            <div className="relative -mt-[69px] sm:-mt-[75px] lg:-mt-[84px] mx-auto lg:mx-0 w-[138px] h-[138px] sm:w-[150px] sm:h-[150px] lg:w-[168px] lg:h-[168px] rounded-full border-[4px] border-[var(--bg-color)] bg-[var(--bg-color)] shadow-xl shrink-0 overflow-visible z-10">
              <button
                type="button"
                onClick={() => setAvatarModalMode(isOwnProfile ? "menu" : "viewer")}
                className="block w-full h-full rounded-full overflow-hidden bg-[var(--bg-secondary)] cursor-pointer"
                title="Ảnh đại diện"
              >
                {profile?.avatarUrl && profile.avatarUrl !== DEFAULT_AVATAR ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: profile?.avatarProfile?.objectPosition || "50% 50%",
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[var(--bg-secondary)] flex items-center justify-center text-4xl sm:text-5xl font-black text-primary capitalize select-none">
                    {profile?.fullName ? profile.fullName.trim().charAt(0).toUpperCase() : "?"}
                  </div>
                )}
              </button>
              {isOwnProfile && (
                <button 
                  type="button"
                  onClick={() => setAvatarModalMode("picker")}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-9 h-9 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-primary border-2 border-[var(--bg-color)] flex items-center justify-center cursor-pointer shadow-md transition-all duration-300 hover:scale-105 active:scale-95 z-20 disabled:cursor-not-allowed disabled:opacity-70"
                  title="Thay đổi ảnh đại diện"
                >
                  <Camera className="w-4.5 h-4.5 text-primary stroke-[2.4px]" />
                </button>
              )}
              <AvatarPhotoModal
                key={avatarModalMode || "closed"}
                open={Boolean(avatarModalMode)}
                mode={avatarModalMode || "menu"}
                currentAvatarUrl={profile?.avatarUrl && !profile.avatarUrl.includes("photo-1534438327276-14e5300c3a48") ? profile.avatarUrl : ""}
                fullName={profile?.fullName}
                suggestedImages={ownPostedImages}
                isSaving={isUploadingAvatar || isUpdatingAvatarPhoto}
                onSave={handleAvatarUpload}
                onClose={() => setAvatarModalMode(null)}
              />
            </div>

            {/* User Bio and Stats */}
            <div className="flex-1 min-w-0 lg:pb-2">
              <h2 className="text-2xl sm:text-3xl lg:text-2xl font-black text-[var(--text-color)] m-0 leading-tight">
                {profile?.fullName || "Thành viên LoongMilkGym"}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-bold mt-1 max-w-[520px] mx-auto lg:mx-0">
                {profile?.bio || "Không có tiểu sử nào được ghi chép."}
              </p>

              {/* Profile stats badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-3 text-xs text-[var(--text-color)] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-black text-sm">{profile?.workoutsCount || 0}</span>
                  <span className="text-[var(--text-muted)]">Buổi tập</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-black text-sm">{profile?.followersCount || 0}</span>
                  <span className="text-[var(--text-muted)]">Người theo dõi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-black text-sm">{profile?.followingCount || 0}</span>
                  <span className="text-[var(--text-muted)]">Đang theo dõi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Follow Actions (For other users only) */}
          {!isOwnProfile ? (
            <button
              onClick={handleFollowToggle}
              disabled={isFollowing || isUnfollowing}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 ${
                profile?.isFollowing 
                  ? "bg-[var(--border-color)]/30 hover:bg-[var(--border-color)]/60 text-[var(--text-color)] border border-[var(--border-color)]/50" 
                  : "bg-primary text-black hover:bg-primary/95"
              }`}
            >
              {profile?.isFollowing ? (
                <>
                  <UserMinus className="w-4.5 h-4.5" />
                  <span>Đang theo dõi</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Theo dõi</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center justify-center lg:justify-end gap-2.5 shrink-0 flex-wrap">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md bg-primary text-black hover:bg-primary/95 active:bg-primary-active"
              >
                <LayoutDashboard className="w-4.5 h-4.5" />
                <span>Bảng điều khiển</span>
              </button>
              <button
                onClick={() => navigate("/account/profile")}
                className="flex items-center gap-1.5 px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md bg-[var(--border-color)]/30 hover:bg-[var(--border-color)]/60 text-[var(--text-color)] border border-[var(--border-color)]/50"
              >
                <Settings className="w-4.5 h-4.5 text-primary" />
                <span>Chỉnh sửa</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Tab Content Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 mt-1 items-start">
        
        {/* Left Column: Intro Card */}
        {hasIntroInfo && (
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:mt-[58px]">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-5 text-left">
              <h3 className="text-base font-black text-[var(--text-color)] m-0 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
                <span>Giới thiệu</span>
              </h3>
              
              {profile?.bio && (
                <p className="text-xs text-[var(--text-color)] font-semibold bg-[var(--border-color)]/10 p-3 rounded-2xl border border-[var(--border-color)]/25 leading-relaxed text-center">
                  "{profile?.bio}"
                </p>
              )}

              <div className="flex flex-col gap-4 text-xs font-bold text-[var(--text-muted)]">
                {profile?.address && (
                  <div className="flex items-center gap-3">
                    <Home className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span>
                      Sống tại <strong className="text-[var(--text-color)]">{profile.address}</strong>
                    </span>
                  </div>
                )}

                {profile?.birthDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span>
                      Sinh ngày <strong className="text-[var(--text-color)]">{formatBirthDate(profile.birthDate)}</strong>
                    </span>
                  </div>
                )}

                {profile?.gender && (
                  <div className="flex items-center gap-3">
                    <User className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span>
                      Giới tính <strong className="text-[var(--text-color)]">{profile.gender}</strong>
                    </span>
                  </div>
                )}

                {profile?.fitnessLevel && (
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span>
                      Trình độ <strong className="text-[var(--text-color)]">{getFitnessLevelLabel(profile.fitnessLevel)}</strong>
                    </span>
                  </div>
                )}

                {profile?.goal && (
                  <div className="flex items-center gap-3">
                    <Target className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span>
                      Mục tiêu <strong className="text-[var(--text-color)]">{profile.goal}</strong>
                    </span>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4.5 h-4.5 text-primary shrink-0" />
                    <span>
                      Điện thoại <strong className="text-[var(--text-color)]">{profile.phone}</strong>
                    </span>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate("/account/profile")}
                  className="w-full py-3 bg-[var(--border-color)]/25 hover:bg-[var(--border-color)]/45 text-[var(--text-color)] border border-[var(--border-color)]/30 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Chỉnh sửa chi tiết
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Right Column: Tab Panels Content */}
        <main className={`${hasIntroInfo ? "lg:col-span-8" : "col-span-12"} flex flex-col gap-4 min-w-0`}>
          {renderProfileTabs()}
          
          
          {/* Post Creator Box */}
          {activeTab === "posts" && isOwnProfile && (
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-primary to-[#00f5d4] shadow-sm cursor-pointer shrink-0 flex items-center justify-center"
                >
                  {profile?.avatarUrl && profile.avatarUrl !== DEFAULT_AVATAR ? (
                    <img
                      src={profile.avatarUrl}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover bg-black"
                      style={{
                        objectPosition: profile?.avatarProfile?.objectPosition || "50% 50%",
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[var(--bg-color)] flex items-center justify-center text-sm font-black text-primary capitalize select-none">
                      {profile?.fullName ? profile.fullName.trim().charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex-1 bg-[var(--border-color)]/25 hover:bg-[var(--border-color)]/45 text-left px-5 py-3 rounded-full text-xs font-semibold text-[var(--text-muted)] transition-all cursor-pointer border border-[var(--border-color)]/20"
                >
                  Bạn đang nghĩ gì? Ghi nhật ký tập luyện...
                </button>
              </div>

              <div className="h-[1px] bg-[var(--border-color)]/50" />

              {/* Quick Actions */}
              <div className="flex justify-around items-center text-xs font-bold text-[var(--text-muted)] px-2">
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 hover:text-[var(--text-color)] transition-all cursor-pointer">
                  <ImageIcon className="w-4.5 h-4.5 text-emerald-500" />
                  <span>Ảnh</span>
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 hover:text-[var(--text-color)] transition-all cursor-pointer">
                  <Smile className="w-4.5 h-4.5 text-amber-500" />
                  <span>Cảm xúc</span>
                </button>
                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 hover:text-[var(--text-color)] transition-all cursor-pointer">
                  <Dumbbell className="w-4.5 h-4.5 text-primary" />
                  <span>Workout</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: Posts list */}
          {activeTab === "posts" && (
            <div className="flex flex-col gap-5 animate-fade-in">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-base font-black text-[var(--text-color)] m-0 uppercase tracking-wider">Bài viết</h3>
              </div>
              <PostFeed
                commentInputs={commentInputs}
                context="profile"
                isLoading={isLoadingPosts}
                isOwnProfile={isOwnProfile}
                localFollows={{ [profile?.userId]: profile?.isFollowing }}
                onArchiveProfilePost={showToast}
                onCommentChange={(postId, value) => setCommentInputs((prev) => ({ ...prev, [postId]: value }))}
                onDeletePost={handleDeletePost}
                onFollowChanged={() => {}}
                onProfileClick={(userId) => navigate(`/profile/${userId}`)}
                onRespectClick={handleRespectClick}
                onSendComment={handleSendComment}
                onShowToast={showToast}
                onToggleComments={handleToggleComments}
                openComments={openComments}
                posts={posts}
                searchQuery=""
                userInfo={userInfo}
              />
            </div>
          )}

        {/* TAB 2: Progress Photos Grid */}
        {activeTab === "photos" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-black text-[var(--text-color)] m-0 uppercase tracking-wider">Ảnh tiến trình</h3>
            </div>
            {isOwnProfile && (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[var(--text-color)] uppercase tracking-wider">
                      Ảnh tiến trình được quản lý ở trang Phục hồi
                    </h4>
                    <p className="text-xs font-semibold text-[var(--text-muted)] leading-relaxed mt-2">
                      Profile chỉ hiển thị lại ảnh tiến trình đã được ghi nhận. Để thêm ảnh mới, hãy vào trang Phục hồi, mở mục Số đo & Tiến trình và tải ảnh theo đúng góc chụp trước, sau hoặc nghiêng.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate("/recovery")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-black text-xs font-black uppercase tracking-wider hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <Activity className="w-4.5 h-4.5" />
                    <span>Sang trang Phục hồi</span>
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--border-color)]/25 hover:bg-[var(--border-color)]/45 text-[var(--text-color)] border border-[var(--border-color)]/30 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-4.5 h-4.5 text-primary" />
                    <span>Xem Dashboard</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile?.progressPhotos?.map((photo) => (
                <div key={photo.id} className="aspect-square bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl overflow-hidden relative group shadow-sm">
                  <img 
                    src={photo.photoUrl} 
                    alt="progress" 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay details */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-white bg-black/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {new Date(photo.takenAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/80 font-bold">
                      {photo.visibility === "public" ? <Globe className="w-3.5 h-3.5 text-primary" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{photo.visibility === "public" ? "Công khai" : "Riêng tư"}</span>
                    </div>
                  </div>
                </div>
              ))}
            
              {(!profile?.progressPhotos || profile.progressPhotos.length === 0) && (
                <div className="col-span-full text-center py-12 text-[var(--text-muted)] text-sm font-semibold border border-dashed border-[var(--border-color)] rounded-3xl">
                  {isOwnProfile
                    ? "Chưa có ảnh tiến trình nào. Hãy thêm ảnh từ trang Phục hồi để Profile tự động hiển thị tại đây."
                    : "Không có ảnh tiến trình công khai nào."}
                </div>
              )}
            </div>
        </div>
      )}

        {/* TAB 3: Completed Workout Sessions Timeline */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-black text-[var(--text-color)] m-0 uppercase tracking-wider">Lịch sử tập luyện</h3>
            </div>
            {profile?.completedWorkouts && profile.completedWorkouts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {profile.completedWorkouts.map((workout) => (
                  <div key={workout.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Dumbbell className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[var(--text-color)]">{workout.title}</h4>
                            <span className="text-[10px] text-[var(--text-muted)] font-bold block mt-0.5">
                              {new Date(workout.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long" })}
                            </span>
                          </div>
                        </div>
                        {workout.notes && (
                          <p className="text-xs text-[var(--text-muted)] mt-3 italic">
                            "{workout.notes}"
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right flex flex-col gap-1.5 shrink-0">
                        <span className="text-xs font-black text-primary uppercase">
                          {formatDuration(workout.durationSeconds)}
                        </span>
                        {workout.perceivedEffort && (
                          <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                            RPE {workout.perceivedEffort}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-[var(--border-color)] rounded-3xl text-[var(--text-muted)] text-sm font-semibold">
                Chưa hoàn thành buổi tập nào.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Archived posts list */}
        {activeTab === "archive" && isOwnProfile && (
          <div className="flex flex-col gap-5 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base font-black text-[var(--text-color)] m-0 uppercase tracking-wider">Kho lưu trữ bài viết</h3>
            </div>
            <PostFeed
              commentInputs={commentInputs}
              context="archive"
              isLoading={isLoadingArchive}
              isOwnProfile={isOwnProfile}
              localFollows={{ [profile?.userId]: profile?.isFollowing }}
              onArchiveProfilePost={showToast}
              onCommentChange={(postId, value) => setCommentInputs((prev) => ({ ...prev, [postId]: value }))}
              onDeletePost={handleDeletePost}
              onFollowChanged={() => {}}
              onProfileClick={(userId) => navigate(`/profile/${userId}`)}
              onRespectClick={handleRespectClick}
              onSendComment={handleSendComment}
              onShowToast={showToast}
              onToggleComments={handleToggleComments}
              openComments={openComments}
              posts={archivedPosts}
              searchQuery=""
              userInfo={userInfo}
            />
          </div>
        )}
        </main>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onRequestStarted={(message) => showToast(message)}
          onRequestSuccess={(message) => showToast(message)}
          onRequestError={(message) => showToast(message, "error")}
        />
      )}

      {postToDelete && (
        <DeletePostModal
          onCancel={() => setPostToDelete(null)}
          onConfirm={confirmDeletePost}
        />
      )}

      {reportPost && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setReportPost(null);
              setReportText("");
            }
          }}
        >
          <div className="w-[min(480px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl">
            <div className="border-b border-[var(--border-color)] px-5 py-4 text-center">
              <h3 className="m-0 text-lg font-black text-[var(--text-color)]">
                Báo cáo bài viết
              </h3>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <textarea
                value={reportText}
                onChange={(event) => setReportText(event.target.value)}
                placeholder="Nhập nội dung bạn muốn báo cáo..."
                className="min-h-32 w-full resize-none rounded-2xl border border-[var(--border-color)] bg-[var(--bg-color)] px-4 py-3 text-sm font-semibold text-[var(--text-color)] outline-none transition-all focus:border-primary"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportPost(null);
                    setReportText("");
                  }}
                  className="rounded-2xl px-5 py-3 text-sm font-black text-[var(--text-color)] transition-all hover:bg-[var(--border-color)]/35"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  className="rounded-2xl bg-primary px-6 py-3 text-sm font-black text-black transition-all hover:bg-primary/95"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-sm animate-slide-down ${
          toast.type === "error"
            ? "border-red-300/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 dark:bg-rose-950/20"
            : "border-primary/30 bg-[var(--bg-secondary)] text-[var(--text-color)]"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
          )}
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
