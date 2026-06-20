import { useNavigate } from "react-router-dom";
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

export default function Community() {
  const { userInfo } = useAuth();
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
    searchQuery,
    showCreateModal,
    showMobileNav,
    confirmDeletePost,
    handleDeletePost,
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

  const navigateToProfile = (userId) => {
    if (userId) navigate(`/profile/${userId}`);
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  return (
    <div className="w-full min-h-screen pt-0 pb-3 mb-16 animate-slide-down lg:h-[calc(100dvh-8rem)] lg:min-h-0 lg:overflow-hidden lg:py-0 lg:mb-0">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-[1200px] mx-auto px-4 lg:h-full">
        <LeftSidebar
          activeNav={activeNav}
          navItems={NAV_ITEMS}
          onNavSelect={setActiveNav}
        />

        <main className="flex-1 flex flex-col gap-4 lg:gap-6 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:pb-6 [scrollbar-gutter:stable]">
          <CommunitySearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery("")}
            onOpenMobileNav={() => setShowMobileNav(true)}
          />

          <MatchingUsers
            localFollows={localFollows}
            matchingUsers={matchingUsers}
            onFollowToggle={handleFollowToggle}
            onProfileClick={navigateToProfile}
          />

          {!searchQuery && (
            <PostCreator
              userInfo={userInfo}
              onCreatePost={() => setShowCreateModal(true)}
              onProfileClick={() => navigateToProfile(userInfo?.id)}
            />
          )}

          <PostFeed
            commentInputs={commentInputs}
            isLoading={isLoadingFeed}
            onCommentChange={handleCommentChange}
            onDeletePost={handleDeletePost}
            onProfileClick={navigateToProfile}
            onRespectClick={handleRespectClick}
            onSendComment={handleSendComment}
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
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}

      {showMobileNav && (
        <MobileCommunityDrawer
          activeNav={activeNav}
          navItems={NAV_ITEMS}
          onClose={() => setShowMobileNav(false)}
          onNavSelect={setActiveNav}
        />
      )}

      {postToDelete && (
        <DeletePostModal
          onCancel={() => setPostToDelete(null)}
          onConfirm={confirmDeletePost}
        />
      )}
    </div>
  );
}

