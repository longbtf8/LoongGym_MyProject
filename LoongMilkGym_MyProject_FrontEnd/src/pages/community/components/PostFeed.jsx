import EmptyFeed from "./EmptyFeed";
import FeedLoadingSkeleton from "./FeedLoadingSkeleton";
import PostCard from "./PostCard";

export default function PostFeed({
  commentInputs,
  context = "community",
  isLoading,
  localFollows = {},
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
  openComments,
  posts,
  searchQuery,
  userInfo,
}) {
  if (isLoading) return <FeedLoadingSkeleton />;
  if (posts.length === 0) return <EmptyFeed searchQuery={searchQuery} />;

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          commentInput={commentInputs[post.id]}
          context={context}
          isAuthor={post.userId === userInfo?.id}
          isFollowingAuthor={localFollows[post.userId] ?? post.user?.isFollowing ?? false}
          isCommentsOpen={openComments[post.id]}
          isOwnProfile={isOwnProfile}
          onArchiveProfilePost={onArchiveProfilePost}
          onCommentChange={(value) => onCommentChange(post.id, value)}
          onDeletePost={onDeletePost}
          onFollowChanged={onFollowChanged}
          onProfileClick={onProfileClick}
          onRespectClick={onRespectClick}
          onSendComment={() => onSendComment(post.id)}
          onShowToast={onShowToast}
          onToggleComments={() => onToggleComments(post.id)}
          post={post}
          userInfo={userInfo}
        />
      ))}
    </div>
  );
}
