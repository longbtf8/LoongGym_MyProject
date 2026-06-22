const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const uploadCloud = require("@/utils/upload");
const communityController = require("@/controllers/community.controller");

// 1. Quản lý bài viết (Posts)
router.get("/posts", authRequire, communityController.getPosts);
router.get("/posts/archives/me", authRequire, communityController.getArchivedPosts);
router.post(
  "/posts",
  authRequire,
  uploadCloud.array("images", 10), // Cho phép upload tối đa 10 ảnh lên Cloudinary
  communityController.createPost
);
router.get("/posts/:id", authRequire, communityController.getPostById);
router.patch(
  "/posts/:id",
  authRequire,
  uploadCloud.array("images", 10),
  communityController.updatePost
);
router.delete("/posts/:id", authRequire, communityController.deletePost);
router.post("/posts/:id/archive-profile", authRequire, communityController.archivePostOnProfile);
router.delete("/posts/:id/archive-profile", authRequire, communityController.restorePostToProfile);
router.post("/posts/:id/hide", authRequire, communityController.hidePostForUser);
router.post("/posts/:id/report", authRequire, communityController.reportPost);
router.post("/posts/:id/save", authRequire, communityController.savePost);
router.delete("/posts/:id/save", authRequire, communityController.unsavePost);

// 2.1 Tương tác theo từng ảnh trong bài viết
router.get("/media/:id", authRequire, communityController.getMediaById);
router.post("/media/:id/comments", authRequire, communityController.addMediaComment);
router.post("/media/:id/reactions", authRequire, communityController.toggleMediaReaction);
router.delete("/media/:id/reactions", authRequire, communityController.deleteMediaReaction);
router.post("/media-comments/:id/reactions", authRequire, communityController.toggleMediaCommentReaction);
router.delete("/media-comments/:id/reactions", authRequire, communityController.deleteMediaCommentReaction);

// 2. Tương tác bình luận (Comments)
router.post("/posts/:id/comments", authRequire, communityController.addComment);
router.patch("/comments/:id", authRequire, communityController.updateComment);
router.delete("/comments/:id", authRequire, communityController.deleteComment);
router.post("/comments/:id/hide", authRequire, communityController.hideComment);
router.post("/comments/:id/reactions", authRequire, communityController.toggleCommentReaction);
router.delete("/comments/:id/reactions", authRequire, communityController.deleteCommentReaction);

// 3. Tương tác bày tỏ cảm xúc (Reactions)
router.post("/posts/:id/reactions", authRequire, communityController.toggleReaction);
router.delete("/posts/:id/reactions", authRequire, communityController.deleteReaction);

// 4. Quản lý theo dõi người dùng (Followers/Following)
router.get("/users/search", authRequire, communityController.searchUsers);
router.post("/users/:id/follow", authRequire, communityController.followUser);
router.delete("/users/:id/follow", authRequire, communityController.unfollowUser);

module.exports = router;
