import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import CreatePostModal from "./components/CreatePostModal";
import CommunitySearchBar from "./components/CommunitySearchBar";
import DeletePostModal from "./components/DeletePostModal";
import LeftSidebar from "./components/LeftSidebar";
import MatchingUsers from "./components/MatchingUsers";
import MobileCommunityDrawer from "./components/MobileCommunityDrawer";
import PostCreator from "./components/PostCreator";
import PostFeed from "./components/PostFeed";
import RightSidebar from "./components/RightSidebar";
import { NAV_ITEMS, TRAINERS } from "./constants/community.constants";
import useCommunityFeed from "./hooks/useCommunityFeed";
import { useAuth } from "@/hooks/useAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function Community() {
  const { userInfo } = useAuth();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();
  const {
    activeNav,
    commentInputs,
    filteredPosts,
    isLoadingFeed,
    localFollows,
    matchingUsers,
    openComments,
    postToDelete,
    refetchPosts,
    searchQuery,
    showCreateModal,
    showMobileNav,
    confirmDeletePost,
    handleDeletePost,
    handleFollowChanged,
    handleFollowToggle,
    handleRespectClick,
    handleSendComment,
    handleToggleComments,
    setActiveNav,
    setCommentInputs,
    setPostToDelete,
    setSearchQuery,
    setShowCreateModal,
    setShowMobileNav,
  } = useCommunityFeed();
  const feedScrollRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const wrappedRespectClick = (post, reactionType) => {
    if (requireAuth()) {
      handleRespectClick(post, reactionType);
    }
  };

  const wrappedSendComment = (postId) => {
    if (requireAuth()) {
      handleSendComment(postId);
    }
  };

  const wrappedFollowToggle = (userId, isCurrentlyFollowing) => {
    if (requireAuth()) {
      handleFollowToggle(userId, isCurrentlyFollowing);
    }
  };

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, type === "loading" ? 2200 : 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const target = window.innerWidth >= 1024 && feedScrollRef.current ? feedScrollRef.current : window;
    target.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [activeNav]);

  const navigateToProfile = (userId) => {
    if (userId) navigate(`/profile/${userId}`);
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleNavSelect = (navItem) => {
    if (navItem !== "feed" && !requireAuth()) {
      return;
    }
    setActiveNav(navItem);
  };

  return (
    <div className="w-full min-h-screen pt-0 pb-3 mb-16 animate-slide-down lg:h-[calc(100dvh-8rem)] lg:min-h-0 lg:overflow-hidden lg:py-0 lg:mb-0">
      <div className="flex flex-col lg:flex-row gap-3 px-2 sm:px-4 lg:gap-6 max-w-[1200px] mx-auto lg:h-full">
        <LeftSidebar
          activeNav={activeNav}
          navItems={NAV_ITEMS}
          onNavSelect={handleNavSelect}
        />

        <main ref={feedScrollRef} className="community-feed-scroll flex-1 flex flex-col gap-3 sm:gap-4 lg:gap-6 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-6 scroll-smooth">
          <CommunitySearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            onOpenMobileNav={() => setShowMobileNav(true)}
          />

          <MatchingUsers
            localFollows={localFollows}
            matchingUsers={matchingUsers}
            onFollowToggle={wrappedFollowToggle}
            onProfileClick={navigateToProfile}
            currentUserId={userInfo?.id}
          />

          {!searchQuery && (
            <PostCreator
              userInfo={userInfo}
              onCreatePost={() => {
                if (requireAuth()) {
                  setShowCreateModal(true);
                }
              }}
              onProfileClick={() => {
                if (requireAuth()) {
                  navigateToProfile(userInfo?.id);
                }
              }}
            />
          )}

          <PostFeed
            commentInputs={commentInputs}
            isLoading={isLoadingFeed}
            localFollows={localFollows}
            onCommentChange={handleCommentChange}
            onDeletePost={handleDeletePost}
            onFollowChanged={handleFollowChanged}
            onProfileClick={navigateToProfile}
            onRespectClick={wrappedRespectClick}
            onSendComment={wrappedSendComment}
            onShowToast={showToast}
            onToggleComments={handleToggleComments}
            openComments={openComments}
            posts={filteredPosts}
            searchQuery={searchQuery}
            userInfo={userInfo}
          />
        </main>

        <RightSidebar trainers={TRAINERS} />
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onRequestStarted={(message) => showToast(message, "loading")}
          onRequestSuccess={(message) => {
            showToast(message);
            refetchPosts();
          }}
          onRequestError={(message) => showToast(message, "error")}
        />
      )}

      {showMobileNav && (
        <MobileCommunityDrawer
          activeNav={activeNav}
          navItems={NAV_ITEMS}
          onClose={() => setShowMobileNav(false)}
          onNavSelect={handleNavSelect}
        />
      )}

      {postToDelete && (
        <DeletePostModal
          onCancel={() => setPostToDelete(null)}
          onConfirm={confirmDeletePost}
        />
      )}

      {toast.show && (
        <div className={`fixed left-1/2 top-[72px] -translate-x-1/2 z-[999999] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl border px-4 py-2.5 shadow-lg backdrop-blur-sm animate-slide-down ${
          toast.type === "error"
            ? "border-red-300/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 dark:bg-rose-950/20"
            : "border-primary/30 bg-[var(--bg-secondary)] text-[var(--text-color)]"
        }`}>
          {toast.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : toast.type === "loading" ? (
            <LoaderCircle className="w-4 h-4 shrink-0 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
          )}
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
