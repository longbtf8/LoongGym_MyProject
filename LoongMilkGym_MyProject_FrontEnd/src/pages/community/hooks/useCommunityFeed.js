import { useEffect, useMemo, useState } from "react";
import {
  useAddCommentMutation,
  useDeletePostMutation,
  useDeleteReactionMutation,
  useGetPostsQuery,
  useToggleReactionMutation,
  useSearchUsersQuery,
} from "@/services/community/communityApi";
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/services/auth/authApi";

export default function useCommunityFeed() {
  const [activeNav, setActiveNav] = useState("feed");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [localFollows, setLocalFollows] = useState({});
  const [postToDelete, setPostToDelete] = useState(null);

  const { data: postsResponse, isLoading: isLoadingFeed, refetch: refetchPosts } = useGetPostsQuery({
    feedType: activeNav,
    page: 1,
    limit: 20,
  }, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const posts = useMemo(() => postsResponse?.data || [], [postsResponse]);

  const { data: searchUsersResponse } = useSearchUsersQuery(searchQuery, {
    skip: !searchQuery.trim(),
  });

  const [toggleReaction] = useToggleReactionMutation();
  const [deleteReaction] = useDeleteReactionMutation();
  const [addComment] = useAddCommentMutation();
  const [deletePost] = useDeletePostMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  useEffect(() => {
    const handleToggle = () => setShowMobileNav((prev) => !prev);
    window.addEventListener("toggle-community-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-community-sidebar", handleToggle);
  }, []);

  useEffect(() => {
    refetchPosts();
  }, [activeNav, refetchPosts]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    const query = searchQuery.toLowerCase().trim();
    return posts.filter((post) => {
      const contentMatch = post.content?.toLowerCase().includes(query);
      const userNameMatch = post.user?.profile?.fullName
        ?.toLowerCase()
        .includes(query);
      return contentMatch || userNameMatch;
    });
  }, [posts, searchQuery]);

  const matchingUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchUsersResponse?.data || [];
  }, [searchUsersResponse, searchQuery]);

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId).unwrap();
        setLocalFollows((prev) => ({ ...prev, [userId]: false }));
      } else {
        await followUser(userId).unwrap();
        setLocalFollows((prev) => ({ ...prev, [userId]: true }));
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái theo dõi:", err);
      setLocalFollows((prev) => ({ ...prev, [userId]: !isCurrentlyFollowing }));
    }
  };

  const handleFollowChanged = (userId, isFollowing) => {
    setLocalFollows((prev) => ({ ...prev, [userId]: isFollowing }));
  };

  const handleToggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
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
      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
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
    } catch (err) {
      console.error("Lỗi xóa bài đăng:", err);
    } finally {
      setPostToDelete(null);
    }
  };

  return {
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
    handleFollowToggle,
    handleFollowChanged,
    handleRespectClick,
    handleSendComment,
    handleToggleComments,
    setActiveNav,
    setCommentInputs,
    setPostToDelete,
    setSearchQuery,
    setShowCreateModal,
    setShowMobileNav,
  };
}
