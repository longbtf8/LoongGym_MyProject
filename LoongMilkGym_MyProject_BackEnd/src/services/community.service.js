const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");
const { deleteOldImage } = require("@/utils/cloudinary");
const pusher = require("@/lib/pusher");

const postInclude = (userId) => {
  const activeUserId = userId || "00000000-0000-0000-0000-000000000000";
  return {
    user: {
      select: {
        id: true,
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    },
    media: {
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
        reactions: {
          select: {
            userId: true,
            reactionType: true,
          },
        },
      },
    },
    _count: {
      select: {
        comments: true,
        reactions: true,
      },
    },
    reactions: {
      select: {
        userId: true,
        reactionType: true,
      },
    },
    profileArchives: {
      where: { userId: activeUserId },
      select: { postId: true },
    },
    saves: {
      where: { userId: activeUserId },
      select: { postId: true },
    },
    comments: {
      where: {
        parentCommentId: null,
        hiddenBy: {
          none: {
            userId: activeUserId
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        reactions: {
          select: {
            userId: true,
            reactionType: true,
          },
        },
        replies: {
          where: {
            hiddenBy: {
              none: {
                userId: activeUserId
              }
            }
          },
          orderBy: { createdAt: "asc" },
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            reactions: {
              select: {
                userId: true,
                reactionType: true,
              },
            },
          },
        },
      },
    },
  };
};

const mediaDetailInclude = (userId) => {
  const activeUserId = userId || "00000000-0000-0000-0000-000000000000";
  return {
    post: {
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    },
    _count: {
      select: {
        comments: true,
        reactions: true,
      },
    },
    reactions: {
      select: {
        userId: true,
        reactionType: true,
      },
    },
    comments: {
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        reactions: {
          select: {
            userId: true,
            reactionType: true,
          },
        },
      },
    },
  };
};

const serializeMediaComment = (comment, currentUserId) => {
  const userReactionObj = comment.reactions?.find((r) => r.userId === currentUserId);
  const activeReactions = Array.from(new Set(comment.reactions?.map((r) => r.reactionType) || []));
  const { reactions, ...rest } = comment;

  return {
    ...rest,
    hasReacted: !!userReactionObj,
    userReaction: userReactionObj ? userReactionObj.reactionType : null,
    activeReactions,
    reactionsCount: reactions?.length || 0,
  };
};

const serializeMedia = (media, currentUserId) => {
  if (!media) return media;
  const userReactionObj = media.reactions?.find((r) => r.userId === currentUserId);
  const activeReactions = Array.from(new Set(media.reactions?.map((r) => r.reactionType) || []));
  const serializedComments = media.comments?.map((comment) =>
    serializeMediaComment(comment, currentUserId)
  ) || [];
  const { reactions, _count, comments, ...rest } = media;

  return {
    ...rest,
    comments: serializedComments,
    hasReacted: !!userReactionObj,
    userReaction: userReactionObj ? userReactionObj.reactionType : null,
    activeReactions,
    commentsCount: _count?.comments || 0,
    reactionsCount: _count?.reactions || 0,
  };
};

const serializeComment = (comment, currentUserId) => {
  const userReactionObj = comment.reactions?.find((r) => r.userId === currentUserId);
  const hasReacted = !!userReactionObj;
  const userReaction = userReactionObj ? userReactionObj.reactionType : null;
  const activeReactions = Array.from(new Set(comment.reactions?.map((r) => r.reactionType) || []));

  const replies = comment.replies?.map(reply => {
    const rUserReactionObj = reply.reactions?.find((r) => r.userId === currentUserId);
    const rHasReacted = !!rUserReactionObj;
    const rUserReaction = rUserReactionObj ? rUserReactionObj.reactionType : null;
    const rActiveReactions = Array.from(new Set(reply.reactions?.map((r) => r.reactionType) || []));
    const { reactions, ...rRest } = reply;
    return {
      ...rRest,
      hasReacted: rHasReacted,
      userReaction: rUserReaction,
      activeReactions: rActiveReactions,
      reactionsCount: reactions?.length || 0,
    };
  }) || [];

  const { reactions, ...rest } = comment;
  return {
    ...rest,
    hasReacted,
    userReaction,
    activeReactions,
    reactionsCount: reactions?.length || 0,
    replies,
  };
};

const serializePost = (post, currentUserId) => {
  const userReactionObj = post.reactions?.find((r) => r.userId === currentUserId);
  const hasReacted = !!userReactionObj;
  const userReaction = userReactionObj ? userReactionObj.reactionType : null;
  const hasSaved = post.saves?.length > 0;
  const activeReactions = Array.from(new Set(post.reactions?.map((r) => r.reactionType) || []));

  const serializedComments = post.comments?.map(comment => serializeComment(comment, currentUserId)) || [];

  const serializedMedia = post.media?.map((item) => serializeMedia(item, currentUserId)) || [];

  const { reactions, saves, _count, profileArchives, comments, media, ...rest } = post;

  return {
    ...rest,
    media: serializedMedia,
    hasReacted,
    userReaction,
    hasSaved,
    activeReactions,
    comments: serializedComments,
    isArchivedOnProfile: profileArchives?.length > 0,
    commentsCount: _count?.comments || 0,
    reactionsCount: _count?.reactions || 0,
  };
};

/**
 * Tạo bài đăng mới kèm ảnh tùy chọn (lên Cloudinary)
 */
const createPost = async ({ userId, content, postType, visibility, relatedWorkoutSessionId, files = [], metadata = {} }) => {
  // Nếu có relatedWorkoutSessionId, xác thực xem session đó có thuộc về user không
  if (relatedWorkoutSessionId) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: relatedWorkoutSessionId, userId },
    });
    if (!session) {
      throw new AppError("Phiên tập luyện liên kết không hợp lệ hoặc không thuộc về bạn.", httpCodes.badRequest);
    }
  }

  const mediaCaptions = Array.isArray(metadata?.mediaCaptions) ? metadata.mediaCaptions : [];
  const metadataForPost = metadata
    ? Object.fromEntries(
        Object.entries(metadata).filter(
          ([key]) => key !== "mediaCaptions" && key !== "newMediaCaptions"
        )
      )
    : {};

  // Tạo post chính
  const post = await prisma.communityPost.create({
    data: {
      userId,
      content,
      postType: postType || (files.length > 0 ? "image" : "text"),
      visibility: visibility || "public",
      relatedWorkoutSessionId: relatedWorkoutSessionId || null,
      metadata: metadataForPost || {},
    },
  });

  // Tạo post_media nếu có file upload
  if (files && files.length > 0) {
    const mediaData = files.map((file, index) => ({
      postId: post.id,
      mediaUrl: file.path, // Multer Cloudinary lưu URL tại path
      mediaType: file.mimetype && file.mimetype.startsWith("video") ? "video" : "image",
      caption: mediaCaptions[index] || null,
      sortOrder: index,
    }));

    await prisma.postMedia.createMany({
      data: mediaData,
    });
  }

  // Lấy post hoàn chỉnh để trả về
  const postResult = await prisma.communityPost.findUnique({
    where: { id: post.id },
    include: postInclude(userId),
  });

  const serialized = serializePost(postResult, userId);

  // Trigger pusher event
  try {
    await pusher.trigger("community-feed", "post.created", serialized);
  } catch (err) {
    console.error("Lỗi gửi Pusher realtime post.created:", err);
  }

  return serialized;
};

/**
 * Lấy danh sách bài đăng công khai (Public Timeline) kèm thống kê và trạng thái thích bài viết
 */
const getPosts = async ({ userId, page = 1, limit = 10, authorId, feedType }) => {
  const activeUserId = userId || "00000000-0000-0000-0000-000000000000";
  const skip = (page - 1) * limit;

  const whereClause = {};
  let orderByClause = { createdAt: "desc" };

  if (authorId) {
    whereClause.userId = authorId;
    if (authorId !== userId) {
      whereClause.visibility = "public";
    } else {
      whereClause.profileArchives = {
        none: { userId: activeUserId },
      };
    }
  } else {
    whereClause.visibility = "public";
    whereClause.hiddenBy = {
      none: { userId: activeUserId },
    };

    if (feedType === "following" && userId) {
      whereClause.user = {
        followers: {
          some: { followerId: userId },
        },
      };
    } else if (feedType === "saved" && userId) {
      whereClause.saves = {
        some: { userId },
      };
    } else if (feedType === "trending") {
      orderByClause = [
        { reactions: { _count: "desc" } },
        { comments: { _count: "desc" } },
        { createdAt: "desc" },
      ];
    }
  }

  const posts = await prisma.communityPost.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip,
    take: limit,
    include: postInclude(userId),
  });

  return posts.map((post) => serializePost(post, userId));
};

const getArchivedPosts = async ({ userId, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const archives = await prisma.postProfileArchive.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      post: {
        include: postInclude(userId),
      },
    },
  });

  return archives.map((archive) => serializePost(archive.post, userId));
};

/**
 * Lấy chi tiết bài viết kèm danh sách bình luận (hỗ trợ replies 1 cấp)
 */
const getPostById = async ({ userId, postId }) => {
  const activeUserId = userId || "00000000-0000-0000-0000-000000000000";
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
      media: {
        orderBy: { sortOrder: "asc" },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
      reactions: {
        select: {
          userId: true,
          reactionType: true,
        },
      },
      profileArchives: {
        where: { userId: activeUserId },
        select: { postId: true },
      },
      saves: {
        where: { userId: activeUserId },
        select: { postId: true },
      },
      comments: {
        where: {
          parentCommentId: null,
          hiddenBy: {
            none: {
              userId: activeUserId
            }
          }
        },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          reactions: {
            select: {
              userId: true,
              reactionType: true,
            },
          },
          replies: {
            where: {
              hiddenBy: {
                none: {
                  userId: activeUserId
                }
              }
            },
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: {
                  id: true,
                  profile: {
                    select: {
                      fullName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
              reactions: {
                select: {
                  userId: true,
                  reactionType: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!post) {
    throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);
  }

  return serializePost(post, userId);
};

/**
 * Xóa bài đăng (đồng thời xóa ảnh vật lý trên Cloudinary)
 */
const deletePost = async ({ userId, postId }) => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: {
      media: true,
    },
  });

  if (!post) {
    throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);
  }

  if (post.userId !== userId) {
    throw new AppError("Bạn không có quyền xóa bài viết này.", httpCodes.forbidden);
  }

  // 1. Xóa ảnh trên Cloudinary
  if (post.media && post.media.length > 0) {
    await Promise.all(
      post.media.map((item) => deleteOldImage(item.mediaUrl))
    );
  }

  // 2. Xóa bài viết trong DB (Cascade tự động xóa comment/reaction/media trong DB)
  const deleted = await prisma.communityPost.delete({
    where: { id: postId },
  });

  // Trigger pusher event
  try {
    await pusher.trigger("community-feed", "post.deleted", { postId });
  } catch (err) {
    console.error("Lỗi gửi Pusher realtime post.deleted:", err);
  }

  return deleted;
};

const updatePost = async ({ 
  userId, 
  postId, 
  content, 
  visibility, 
  removeMediaIds = [], 
  files = [],
  relatedWorkoutSessionId = null,
  metadata = undefined
}) => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: { media: true },
  });

  if (!post) {
    throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);
  }

  if (post.userId !== userId) {
    throw new AppError("Bạn không có quyền chỉnh sửa bài viết này.", httpCodes.forbidden);
  }

  const normalizedVisibility = visibility || post.visibility;
  if (!["public", "private"].includes(normalizedVisibility)) {
    throw new AppError("Đối tượng bài viết không hợp lệ.", httpCodes.badRequest);
  }

  if (relatedWorkoutSessionId) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: relatedWorkoutSessionId, userId },
    });
    if (!session) {
      throw new AppError("Phiên tập luyện liên kết không hợp lệ hoặc không thuộc về bạn.", httpCodes.badRequest);
    }
  }

  const removableMedia = post.media.filter((item) => removeMediaIds.includes(item.id));
  const mediaCaptions = Array.isArray(metadata?.mediaCaptions) ? metadata.mediaCaptions : [];
  const existingCaptionMap = new Map(
    mediaCaptions
      .filter((item) => item && item.id)
      .map((item) => [item.id, item.caption || null])
  );
  const newCaptions = Array.isArray(metadata?.newMediaCaptions) ? metadata.newMediaCaptions : [];
  const metadataForPost = metadata !== undefined
    ? Object.fromEntries(
        Object.entries(metadata).filter(
          ([key]) => key !== "mediaCaptions" && key !== "newMediaCaptions"
        )
      )
    : undefined;

  await prisma.$transaction(async (tx) => {
    if (removableMedia.length > 0) {
      await tx.postMedia.deleteMany({
        where: {
          id: { in: removableMedia.map((item) => item.id) },
          postId,
        },
      });
    }

    if (existingCaptionMap.size > 0) {
      await Promise.all(
        Array.from(existingCaptionMap.entries()).map(([mediaId, caption]) =>
          tx.postMedia.updateMany({
            where: { id: mediaId, postId },
            data: { caption },
          })
        )
      );
    }

    if (files.length > 0) {
      const remainingCount = post.media.length - removableMedia.length;
      await tx.postMedia.createMany({
        data: files.map((file, index) => ({
          postId,
          mediaUrl: file.path,
          mediaType: file.mimetype && file.mimetype.startsWith("video") ? "video" : "image",
          caption: newCaptions[index] || null,
          sortOrder: remainingCount + index,
        })),
      });
    }

    let postType = "text";
    if (relatedWorkoutSessionId) {
      postType = "workout_share";
    } else if (files.length > 0 || (post.media.length - removableMedia.length) > 0) {
      postType = "image";
    }

    await tx.communityPost.update({
      where: { id: postId },
      data: {
        content,
        visibility: normalizedVisibility,
        postType,
        relatedWorkoutSessionId: relatedWorkoutSessionId || null,
        metadata: metadataForPost !== undefined ? metadataForPost : post.metadata,
      },
    });
  });

  if (removableMedia.length > 0) {
    await Promise.all(removableMedia.map((item) => deleteOldImage(item.mediaUrl)));
  }

  const updatedPost = await prisma.communityPost.findUnique({
    where: { id: postId },
    include: postInclude(userId),
  });

  const serialized = serializePost(updatedPost, userId);

  // Trigger pusher event
  try {
    await pusher.trigger("community-feed", "post.updated", serialized);
  } catch (err) {
    console.error("Lỗi gửi Pusher realtime post.updated:", err);
  }

  return serialized;
};

const archivePostOnProfile = async ({ userId, postId }) => {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);
  if (post.userId !== userId) {
    throw new AppError("Bạn không có quyền ẩn bài viết này khỏi trang cá nhân.", httpCodes.forbidden);
  }

  return prisma.postProfileArchive.upsert({
    where: { postId_userId: { postId, userId } },
    update: {},
    create: { postId, userId },
  });
};

const restorePostToProfile = async ({ userId, postId }) => {
  await prisma.postProfileArchive.deleteMany({
    where: { postId, userId },
  });
  return { postId };
};

const hidePostForUser = async ({ userId, postId }) => {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);

  return prisma.postUserHidden.upsert({
    where: { postId_userId: { postId, userId } },
    update: {},
    create: { postId, userId },
  });
};

const reportPost = async ({ userId, postId, reason }) => {
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);

  return prisma.postReport.create({
    data: {
      postId,
      reporterId: userId,
      reason: reason || null,
      status: "pending",
    },
  });
};

/**
 * Thêm bình luận hoặc phản hồi bình luận
 */
const addComment = async ({ userId, postId, parentCommentId, content }) => {
  // Kiểm tra bài viết tồn tại
  const postExists = await prisma.communityPost.findUnique({
    where: { id: postId },
  });
  if (!postExists) {
    throw new AppError("Không tìm thấy bài viết để bình luận.", httpCodes.notFound);
  }

  // Nếu là phản hồi bình luận khác, kiểm tra parentCommentId tồn tại
  if (parentCommentId) {
    const parentComment = await prisma.postComment.findUnique({
      where: { id: parentCommentId },
    });
    if (!parentComment) {
      throw new AppError("Bình luận gốc không tồn tại.", httpCodes.notFound);
    }
  }

  const commentData = await prisma.postComment.create({
    data: {
      postId,
      userId,
      parentCommentId: parentCommentId || null,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
      reactions: {
        select: {
          userId: true,
          reactionType: true,
        },
      },
    },
  });

  const newComment = serializeComment(commentData, userId);

  // Trigger pusher real-time event
  try {
    await pusher.trigger(`post-${postId}`, "comment.created", newComment);
  } catch (err) {
    console.error("Lỗi gửi Pusher realtime comment:", err);
  }

  return newComment;
};

const broadcastPostReactions = async (postId) => {
  try {
    const reactions = await prisma.postReaction.findMany({
      where: { postId },
      select: { userId: true, reactionType: true }
    });
    const reactionsCount = reactions.length;
    const activeReactions = Array.from(new Set(reactions.map(r => r.reactionType)));
    
    await pusher.trigger(`post-${postId}`, "post.reaction.updated", {
      postId,
      reactions,
      reactionsCount,
      activeReactions
    });
  } catch (err) {
    console.error("Lỗi broadcastPostReactions:", err);
  }
};

/**
 * Thả tim/Reaction vào bài viết
 */
const toggleReaction = async ({ userId, postId, reactionType = "like" }) => {
  const postExists = await prisma.communityPost.findUnique({
    where: { id: postId },
  });
  if (!postExists) {
    throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);
  }

  await prisma.postReaction.deleteMany({
    where: { postId, userId },
  });

  const result = await prisma.postReaction.create({
    data: {
      postId,
      userId,
      reactionType,
    },
  });

  await broadcastPostReactions(postId);

  return result;
};

/**
 * Bỏ thích/Xóa reaction khỏi bài viết
 */
const deleteReaction = async ({ userId, postId }) => {
  const result = await prisma.postReaction.deleteMany({
    where: {
      postId,
      userId,
    },
  });

  await broadcastPostReactions(postId);

  return result;
};

/**
 * Theo dõi người dùng
 */
const followUser = async ({ followerId, followingId }) => {
  if (followerId === followingId) {
    throw new AppError("Bạn không thể tự theo dõi chính mình.", httpCodes.badRequest);
  }

  // Kiểm tra user followingId có tồn tại không
  const targetUser = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!targetUser) {
    throw new AppError("Người dùng muốn theo dõi không tồn tại.", httpCodes.notFound);
  }

  return prisma.userFollow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
    update: {},
    create: {
      followerId,
      followingId,
    },
  });
};

/**
 * Hủy theo dõi người dùng
 */
const unfollowUser = async ({ followerId, followingId }) => {
  const follow = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });

  if (!follow) {
    throw new AppError("Bạn chưa theo dõi người dùng này.", httpCodes.badRequest);
  }

  return prisma.userFollow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
};

const savePost = async ({ userId, postId }) => {
  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
  });
  if (!post) {
    throw new AppError("Không tìm thấy bài viết.", httpCodes.notFound);
  }

  return prisma.postSave.upsert({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
    update: {},
    create: {
      postId,
      userId,
    },
  });
};

const unsavePost = async ({ userId, postId }) => {
  const existing = await prisma.postSave.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (!existing) return null;

  return prisma.postSave.delete({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });
};

const searchUsers = async ({ query, userId }) => {
  if (!query || !query.trim()) return [];
  const searchQuery = query.trim();
  const resolvedUserId = userId || "00000000-0000-0000-0000-000000000000";

  const profiles = await prisma.userProfile.findMany({
    where: {
      fullName: {
        contains: searchQuery,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          followers: {
            where: { followerId: resolvedUserId },
            select: { followerId: true },
          },
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      },
    },
    take: 20,
  });

  return profiles.map((p) => ({
    id: p.userId,
    profile: {
      fullName: p.fullName,
      avatarUrl: p.avatarUrl,
      bio: p.bio,
    },
    isFollowing: p.user.followers.length > 0,
    followersCount: p.user._count.followers,
    followingCount: p.user._count.following,
  }));
};

const broadcastCommentReactions = async (commentId) => {
  try {
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId },
      select: { postId: true, parentCommentId: true }
    });
    if (!comment) return;

    const reactions = await prisma.commentReaction.findMany({
      where: { commentId },
      select: { userId: true, reactionType: true }
    });
    const reactionsCount = reactions.length;
    const activeReactions = Array.from(new Set(reactions.map(r => r.reactionType)));

    await pusher.trigger(`post-${comment.postId}`, "comment.reaction.updated", {
      commentId,
      parentCommentId: comment.parentCommentId,
      reactions,
      reactionsCount,
      activeReactions
    });
  } catch (err) {
    console.error("Lỗi broadcastCommentReactions:", err);
  }
};

/**
 * Thả cảm xúc vào bình luận
 */
const toggleCommentReaction = async ({ userId, commentId, reactionType = "like" }) => {
  const commentExists = await prisma.postComment.findUnique({
    where: { id: commentId },
  });
  if (!commentExists) {
    throw new AppError("Không tìm thấy bình luận.", httpCodes.notFound);
  }

  await prisma.commentReaction.deleteMany({
    where: { commentId, userId },
  });

  const result = await prisma.commentReaction.create({
    data: {
      commentId,
      userId,
      reactionType,
    },
  });

  await broadcastCommentReactions(commentId);

  return result;
};

/**
 * Xóa cảm xúc khỏi bình luận
 */
const deleteCommentReaction = async ({ userId, commentId }) => {
  const result = await prisma.commentReaction.deleteMany({
    where: {
      commentId,
      userId,
    },
  });

  await broadcastCommentReactions(commentId);

  return result;
};

const getMediaById = async ({ userId, mediaId }) => {
  const media = await prisma.postMedia.findUnique({
    where: { id: mediaId },
    include: mediaDetailInclude(userId),
  });

  if (!media) {
    throw new AppError("Không tìm thấy ảnh.", httpCodes.notFound);
  }

  if (media.post.visibility !== "public" && media.post.userId !== userId) {
    throw new AppError("Bạn không có quyền xem ảnh này.", httpCodes.forbidden);
  }

  return serializeMedia(media, userId);
};

const addMediaComment = async ({ userId, mediaId, content }) => {
  const media = await prisma.postMedia.findUnique({
    where: { id: mediaId },
    include: { post: true },
  });

  if (!media) {
    throw new AppError("Không tìm thấy ảnh để bình luận.", httpCodes.notFound);
  }

  if (media.post.visibility !== "public" && media.post.userId !== userId) {
    throw new AppError("Bạn không có quyền bình luận ảnh này.", httpCodes.forbidden);
  }

  return prisma.postMediaComment.create({
    data: {
      mediaId,
      userId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });
};

const toggleMediaReaction = async ({ userId, mediaId, reactionType = "like" }) => {
  const media = await prisma.postMedia.findUnique({
    where: { id: mediaId },
    include: { post: true },
  });

  if (!media) {
    throw new AppError("Không tìm thấy ảnh.", httpCodes.notFound);
  }

  if (media.post.visibility !== "public" && media.post.userId !== userId) {
    throw new AppError("Bạn không có quyền tương tác ảnh này.", httpCodes.forbidden);
  }

  await prisma.postMediaReaction.deleteMany({
    where: { mediaId, userId },
  });

  return prisma.postMediaReaction.create({
    data: {
      mediaId,
      userId,
      reactionType,
    },
  });
};

const deleteMediaReaction = async ({ userId, mediaId }) => {
  return prisma.postMediaReaction.deleteMany({
    where: {
      mediaId,
      userId,
    },
  });
};

const toggleMediaCommentReaction = async ({ userId, commentId, reactionType = "like" }) => {
  const comment = await prisma.postMediaComment.findUnique({
    where: { id: commentId },
    include: {
      media: {
        include: { post: true },
      },
    },
  });

  if (!comment) {
    throw new AppError("Không tìm thấy bình luận ảnh.", httpCodes.notFound);
  }

  if (comment.media.post.visibility !== "public" && comment.media.post.userId !== userId) {
    throw new AppError("Bạn không có quyền tương tác bình luận này.", httpCodes.forbidden);
  }

  await prisma.postMediaCommentReaction.deleteMany({
    where: { commentId, userId },
  });

  return prisma.postMediaCommentReaction.create({
    data: {
      commentId,
      userId,
      reactionType,
    },
  });
};

const deleteMediaCommentReaction = async ({ userId, commentId }) => {
  return prisma.postMediaCommentReaction.deleteMany({
    where: {
      commentId,
      userId,
    },
  });
};

/**
 * Chỉnh sửa bình luận
 */
const updateComment = async ({ userId, commentId, content }) => {
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId }
  });
  if (!comment) {
    throw new AppError("Không tìm thấy bình luận.", httpCodes.notFound);
  }
  if (comment.userId !== userId) {
    throw new AppError("Bạn không có quyền chỉnh sửa bình luận này.", httpCodes.forbidden);
  }

  const updatedComment = await prisma.postComment.update({
    where: { id: commentId },
    data: { content },
    include: {
      user: {
        select: {
          id: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      },
      reactions: {
        select: {
          userId: true,
          reactionType: true,
        },
      },
    }
  });

  const serialized = serializeComment(updatedComment, userId);

  // Trigger pusher event
  try {
    await pusher.trigger(`post-${serialized.postId}`, "comment.updated", serialized);
  } catch (err) {
    console.error("Lỗi gửi Pusher realtime comment update:", err);
  }

  return serialized;
};

/**
 * Xóa bình luận (chấp nhận chính chủ hoặc chủ bài viết)
 */
const deleteComment = async ({ userId, commentId }) => {
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId },
    include: { post: true }
  });
  if (!comment) {
    throw new AppError("Không tìm thấy bình luận.", httpCodes.notFound);
  }
  if (comment.userId !== userId && comment.post.userId !== userId) {
    throw new AppError("Bạn không có quyền xóa bình luận này.", httpCodes.forbidden);
  }

  await prisma.postComment.delete({
    where: { id: commentId }
  });

  // Trigger pusher event
  try {
    await pusher.trigger(`post-${comment.postId}`, "comment.deleted", { commentId, parentCommentId: comment.parentCommentId });
  } catch (err) {
    console.error("Lỗi gửi Pusher realtime comment delete:", err);
  }
};

/**
 * Ẩn bình luận cho riêng người dùng hiện tại
 */
const hideComment = async ({ userId, commentId }) => {
  const comment = await prisma.postComment.findUnique({
    where: { id: commentId }
  });
  if (!comment) {
    throw new AppError("Không tìm thấy bình luận.", httpCodes.notFound);
  }

  const existing = await prisma.commentUserHidden.findUnique({
    where: {
      commentId_userId: {
        commentId,
        userId
      }
    }
  });
  if (existing) {
    return existing;
  }

  return prisma.commentUserHidden.create({
    data: {
      commentId,
      userId
    }
  });
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
  getMediaById,
  addMediaComment,
  toggleMediaReaction,
  deleteMediaReaction,
  toggleMediaCommentReaction,
  deleteMediaCommentReaction,
  followUser,
  unfollowUser,
  savePost,
  unsavePost,
  searchUsers,
};
