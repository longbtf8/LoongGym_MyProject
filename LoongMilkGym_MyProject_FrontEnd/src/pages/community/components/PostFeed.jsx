import EmptyFeed from "./EmptyFeed";
import FeedLoadingSkeleton from "./FeedLoadingSkeleton";
import PostCard from "./PostCard";

export default function PostFeed({
  commentInputs,
  isLoading,
  onCommentChange,
  onDeletePost,
  onProfileClick,
  onRespectClick,
  onSendComment,
  onToggleComments,
  openComments,
  posts,
  searchQuery,
  userInfo,
}) {
  if (isLoading) return <FeedLoadingSkeleton />;
  if (posts.length === 0) return <EmptyFeed searchQuery={searchQuery} />;

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          commentInput={commentInputs[post.id]}
          isAuthor={post.userId === userInfo?.id}
          isCommentsOpen={openComments[post.id]}
          onCommentChange={(value) => onCommentChange(post.id, value)}
          onDeletePost={onDeletePost}
          onProfileClick={onProfileClick}
          onRespectClick={onRespectClick}
          onSendComment={() => onSendComment(post.id)}
          onToggleComments={() => onToggleComments(post.id)}
          post={post}
          userInfo={userInfo}
        />
      ))}
    </div>
  );
}

