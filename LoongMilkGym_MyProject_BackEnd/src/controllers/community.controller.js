const communityService = require("@/services/community.service");
const { httpCodes } = require("@/config/constants");

const createPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Lấy thông tin từ body
    const { content, postType, visibility, relatedWorkoutSessionId, metadata } = req.body;
    
    // files được nạp từ middleware uploadCloud.array
    const files = req.files || [];

    // Parse metadata nếu nó được gửi dưới dạng string JSON
    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (err) {
        parsedMetadata = {};
      }
    }

    const post = await communityService.createPost({
      userId,
      content,
      postType,
      visibility,
      relatedWorkoutSessionId,
      files,
      metadata: parsedMetadata,
    });

    return res.success(post, httpCodes.created, "Đăng bài viết mới thành công.");
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const authorId = req.query.authorId || null;
    const feedType = req.query.feedType || null;

    const posts = await communityService.getPosts({ userId, page, limit, authorId, feedType });
    return res.success(posts, httpCodes.success, "Lấy danh sách bài đăng thành công.");
  } catch (error) {
    next(error);
  }
};

const getArchivedPosts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const posts = await communityService.getArchivedPosts({ userId, page, limit });
    return res.success(posts, httpCodes.success, "Lấy kho lưu trữ bài viết thành công.");
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { id } = req.params;

    const post = await communityService.getPostById({ userId, postId: id });
    return res.success(post, httpCodes.success, "Lấy chi tiết bài viết thành công.");
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await communityService.deletePost({ userId, postId: id });
    return res.success(null, httpCodes.success, "Xóa bài đăng thành công.");
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content, visibility, relatedWorkoutSessionId } = req.body;
    const files = req.files || [];

    const finalWorkoutSessionId = (relatedWorkoutSessionId === "" || !relatedWorkoutSessionId) ? null : relatedWorkoutSessionId;

    let parsedMetadata = undefined;
    if (req.body.metadata) {
      try {
        parsedMetadata = typeof req.body.metadata === "string"
          ? JSON.parse(req.body.metadata)
          : req.body.metadata;
      } catch (err) {
        parsedMetadata = undefined;
      }
    }

    let removeMediaIds = [];
    if (req.body.removeMediaIds) {
      try {
        removeMediaIds = typeof req.body.removeMediaIds === "string"
          ? JSON.parse(req.body.removeMediaIds)
          : req.body.removeMediaIds;
      } catch (err) {
        removeMediaIds = [];
      }
    }

    const post = await communityService.updatePost({
      userId,
      postId: id,
      content,
      visibility,
      removeMediaIds,
      files,
      relatedWorkoutSessionId: finalWorkoutSessionId,
      metadata: parsedMetadata,
    });

    return res.success(post, httpCodes.success, "Cập nhật bài viết thành công.");
  } catch (error) {
    next(error);
  }
};

const archivePostOnProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const archive = await communityService.archivePostOnProfile({ userId, postId: id });
    return res.success(archive, httpCodes.success, "Đã ẩn bài viết khỏi trang cá nhân.");
  } catch (error) {
    next(error);
  }
};

const restorePostToProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await communityService.restorePostToProfile({ userId, postId: id });
    return res.success(result, httpCodes.success, "Đã khôi phục bài viết lên trang cá nhân.");
  } catch (error) {
    next(error);
  }
};

const hidePostForUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const hidden = await communityService.hidePostForUser({ userId, postId: id });
    return res.success(hidden, httpCodes.success, "Đã ẩn bài viết khỏi bảng tin của bạn.");
  } catch (error) {
    next(error);
  }
};

const reportPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;
    const report = await communityService.reportPost({ userId, postId: id, reason });
    return res.success(report, httpCodes.created, "Đã gửi báo cáo bài viết.");
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // postId
    const { content, parentCommentId } = req.body;

    const comment = await communityService.addComment({
      userId,
      postId: id,
      parentCommentId,
      content,
    });
    return res.success(comment, httpCodes.created, "Đăng bình luận thành công.");
  } catch (error) {
    next(error);
  }
};

const toggleReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // postId
    const { reactionType } = req.body;

    const reaction = await communityService.toggleReaction({
      userId,
      postId: id,
      reactionType,
    });
    return res.success(reaction, httpCodes.created, "Tương tác bài đăng thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // postId
    const { reactionType } = req.query; // type as query param or standard 'like'

    await communityService.deleteReaction({
      userId,
      postId: id,
      reactionType: reactionType || "like",
    });
    return res.success(null, httpCodes.success, "Hủy tương tác bài đăng thành công.");
  } catch (error) {
    next(error);
  }
};

const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { id: followingId } = req.params;

    const follow = await communityService.followUser({ followerId, followingId });
    return res.success(follow, httpCodes.created, "Theo dõi người dùng thành công.");
  } catch (error) {
    next(error);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const { id: followingId } = req.params;

    await communityService.unfollowUser({ followerId, followingId });
    return res.success(null, httpCodes.success, "Hủy theo dõi người dùng thành công.");
  } catch (error) {
    next(error);
  }
};

const savePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const saved = await communityService.savePost({ userId, postId: id });
    return res.success(saved, httpCodes.success, "Đã lưu bài viết thành công.");
  } catch (error) {
    next(error);
  }
};

const unsavePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await communityService.unsavePost({ userId, postId: id });
    return res.success(null, httpCodes.success, "Đã bỏ lưu bài viết thành công.");
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const query = req.query.q || "";
    const users = await communityService.searchUsers({ query, userId });
    return res.success(users, httpCodes.success, "Tìm kiếm người dùng thành công.");
  } catch (error) {
    next(error);
  }
};

const getMediaById = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { id } = req.params;
    const media = await communityService.getMediaById({ userId, mediaId: id });
    return res.success(media, httpCodes.success, "Lấy chi tiết ảnh thành công.");
  } catch (error) {
    next(error);
  }
};

const addMediaComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;
    const comment = await communityService.addMediaComment({ userId, mediaId: id, content });
    return res.success(comment, httpCodes.created, "Đăng bình luận ảnh thành công.");
  } catch (error) {
    next(error);
  }
};

const toggleMediaReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reactionType } = req.body;
    const reaction = await communityService.toggleMediaReaction({ userId, mediaId: id, reactionType });
    return res.success(reaction, httpCodes.created, "Tương tác ảnh thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteMediaReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await communityService.deleteMediaReaction({ userId, mediaId: id });
    return res.success(null, httpCodes.success, "Hủy tương tác ảnh thành công.");
  } catch (error) {
    next(error);
  }
};

const toggleMediaCommentReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reactionType } = req.body;
    await communityService.toggleMediaCommentReaction({ userId, commentId: id, reactionType });
    return res.success(null, httpCodes.success, "Đã tương tác bình luận ảnh thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteMediaCommentReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await communityService.deleteMediaCommentReaction({ userId, commentId: id });
    return res.success(null, httpCodes.success, "Hủy tương tác bình luận ảnh thành công.");
  } catch (error) {
    next(error);
  }
};

const toggleCommentReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reactionType } = req.body;
    await communityService.toggleCommentReaction({ userId, commentId: id, reactionType });
    return res.success(null, httpCodes.success, "Đã tương tác bình luận thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteCommentReaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await communityService.deleteCommentReaction({ userId, commentId: id });
    return res.success(null, httpCodes.success, "Hủy tương tác bình luận thành công.");
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    const comment = await communityService.updateComment({
      userId,
      commentId: id,
      content,
    });
    return res.success(comment, httpCodes.success, "Cập nhật bình luận thành công.");
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await communityService.deleteComment({
      userId,
      commentId: id,
    });
    return res.success(null, httpCodes.success, "Xóa bình luận thành công.");
  } catch (error) {
    next(error);
  }
};

const hideComment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const hidden = await communityService.hideComment({
      userId,
      commentId: id,
    });
    return res.success(hidden, httpCodes.success, "Đã ẩn bình luận.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getArchivedPosts,
  getPostById,
  deletePost,
  updatePost,
  archivePostOnProfile,
  restorePostToProfile,
  hidePostForUser,
  reportPost,
  addComment,
  updateComment,
  deleteComment,
  hideComment,
  toggleReaction,
  deleteReaction,
  toggleCommentReaction,
  deleteCommentReaction,
  followUser,
  unfollowUser,
  savePost,
  unsavePost,
  searchUsers,
  getMediaById,
  addMediaComment,
  toggleMediaReaction,
  deleteMediaReaction,
  toggleMediaCommentReaction,
  deleteMediaCommentReaction,
};
