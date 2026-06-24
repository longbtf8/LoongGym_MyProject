const { prisma } = require("@/lib/prisma");
const { deleteOldImage } = require("@/utils/cloudinary");
const pusher = require("@/lib/pusher");
const { emitAdminEvent } = require("@/utils/admin-realtime.helper");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");
const communityService = require("@/services/community.service");

/**
 * GET /api/admin/posts
 * Lấy danh sách toàn bộ bài viết với bộ lọc, phân trang, tìm kiếm và sắp xếp
 */
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, postType, search, hasReports, hasMedia, dateFrom, dateTo, sort } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.moderationStatus = status;
    }

    if (postType) {
      whereClause.postType = postType;
    }

    if (search) {
      whereClause.OR = [
        { content: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { profile: { fullName: { contains: search } } } }
      ];
    }

    if (hasReports === 'true') {
      whereClause.reports = { some: { status: { in: ['pending', 'PENDING'] } } };
    }

    if (hasMedia === 'true') {
      whereClause.media = { some: {} };
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    let orderBy = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'most_reported') {
      orderBy = { reports: { _count: 'desc' } };
    } else if (sort === 'most_liked') {
      orderBy = { reactions: { _count: 'desc' } };
    }

    const items = await prisma.communityPost.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        media: {
          select: {
            id: true,
            mediaUrl: true,
            mediaType: true
          }
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            reports: {
              where: {
                status: { in: ['pending', 'PENDING'] }
              }
            },
            saves: true
          }
        }
      }
    });

    const total = await prisma.communityPost.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);

    // Get aggregated counts for quick statistics
    const [totalCount, visibleCount, hiddenCount, removedCount, reportedCount] = await Promise.all([
      prisma.communityPost.count(),
      prisma.communityPost.count({ where: { moderationStatus: 'VISIBLE' } }),
      prisma.communityPost.count({ where: { moderationStatus: 'HIDDEN' } }),
      prisma.communityPost.count({ where: { moderationStatus: 'REMOVED' } }),
      prisma.communityPost.count({ where: { reports: { some: { status: { in: ['pending', 'PENDING'] } } } } })
    ]);

    const formattedItems = items.map(post => ({
      id: post.id,
      content: post.content ? (post.content.length > 120 ? post.content.substring(0, 120) + '...' : post.content) : '',
      postType: post.postType,
      visibility: post.visibility,
      moderationStatus: post.moderationStatus,
      moderationReason: post.moderationReason,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.user?.id,
        fullName: post.user?.profile?.fullName || 'Người dùng LoongGym',
        avatarUrl: post.user?.profile?.avatarUrl,
        email: post.user?.email,
        status: post.user?.status
      },
      media: {
        firstImageUrl: post.media?.[0]?.mediaUrl || null,
        totalCount: post.media?.length || 0,
        firstMediaType: post.media?.[0]?.mediaType || null
      },
      stats: {
        reactions: post._count?.reactions || 0,
        comments: post._count?.comments || 0,
        reports: post._count?.reports || 0,
        saves: post._count?.saves || 0
      }
    }));

    return res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          total,
          page,
          limit,
          totalPages
        },
        meta: {
          counts: {
            total: totalCount,
            visible: visibleCount,
            hidden: hiddenCount,
            removed: removedCount,
            withReports: reportedCount
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách bài viết.' });
  }
};

/**
 * GET /api/admin/posts/:id
 * Lấy chi tiết bài viết (kèm lượt thích, bình luận, và các báo cáo liên quan)
 */
exports.getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            role: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        media: true,
        comments: {
          where: { parentCommentId: null },
          take: 100,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true } }
              }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                user: {
                  select: {
                    id: true,
                    profile: { select: { fullName: true, avatarUrl: true } }
                  }
                }
              }
            }
          }
        },
        reports: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            reporter: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true } }
              }
            }
          }
        },
        moderatedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } }
          }
        },
        relatedWorkoutSession: {
          include: {
            exercises: {
              include: {
                exercise: true,
                sets: true
              }
            }
          }
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
            reports: true,
            saves: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });
    }

    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching admin post detail:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết bài viết.' });
  }
};

/**
 * PATCH /api/admin/posts/:id/moderation
 * Thực hiện kiểm duyệt bài viết (Ẩn/Khôi phục/Xóa vĩnh viễn)
 */
exports.moderatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    const adminId = req.user.id;

    if (!['HIDE', 'RESTORE', 'REMOVE'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Hành động kiểm duyệt không hợp lệ.' });
    }

    if (action !== 'RESTORE' && (!reason || !reason.trim())) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp lý do kiểm duyệt.' });
    }

    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: true,
        media: true
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Bài viết không tồn tại.' });
    }

    // Kiểm tra xung đột trạng thái
    if (action === 'HIDE' && post.moderationStatus === 'HIDDEN') {
      return res.status(409).json({ success: false, message: 'Bài viết đã được ẩn trước đó bởi một quản trị viên khác.' });
    }
    if (action === 'RESTORE' && post.moderationStatus === 'VISIBLE') {
      return res.status(409).json({ success: false, message: 'Bài viết đã hiển thị bình thường trước đó.' });
    }

    if (action === 'REMOVE') {
      // Soft delete in DB
      await prisma.$transaction(async (tx) => {
        await tx.adminAuditLog.create({
          data: {
            adminId,
            action: 'REMOVE_POST',
            targetType: 'POST',
            targetId: id,
            description: `Admin đã xóa bài viết #${id} của người dùng ${post.user?.email || 'N/A'}. Lý do: ${reason}`
          }
        });

        await tx.communityPost.update({
          where: { id },
          data: {
            moderationStatus: 'REMOVED',
            moderationReason: reason.trim(),
            moderatedAt: new Date(),
            moderatedById: adminId
          }
        });
      });

      try {
        await pusher.trigger('community-feed', 'post.deleted', { postId: id });
        await emitAdminEvent('admin-posts', 'post.moderated', { postId: id, moderationStatus: 'REMOVED' });
      } catch (err) {
        console.error('Lỗi gửi Pusher realtime post.deleted (admin posts):', err);
      }

      return res.status(200).json({ success: true, message: 'Đã xóa vĩnh viễn bài viết thành công.' });
    }

    // Xử lý HIDE hoặc RESTORE
    await prisma.$transaction(async (tx) => {
      const isHide = action === 'HIDE';
      await tx.communityPost.update({
        where: { id },
        data: {
          moderationStatus: isHide ? 'HIDDEN' : 'VISIBLE',
          moderationReason: isHide ? reason.trim() : null,
          moderatedAt: isHide ? new Date() : null,
          moderatedById: isHide ? adminId : null
        }
      });

      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: isHide ? 'HIDE_POST' : 'RESTORE_POST',
          targetType: 'POST',
          targetId: id,
          description: isHide 
            ? `Admin đã ẩn bài viết #${id} của người dùng ${post.user?.email || 'N/A'}. Lý do: ${reason}`
            : `Admin đã khôi phục hiển thị bài viết #${id} của người dùng ${post.user?.email || 'N/A'}.`
        }
      });
    });

    try {
      if (action === 'HIDE') {
        await pusher.trigger('community-feed', 'post.deleted', { postId: id });
        await emitAdminEvent('admin-posts', 'post.moderated', { postId: id, moderationStatus: 'HIDDEN' });
      } else if (action === 'RESTORE') {
        const serialized = await communityService.getPostById({ userId: post.userId, postId: id });
        await pusher.trigger('community-feed', 'post.created', serialized);
        await pusher.trigger('admin-reports', 'post.restored', { postId: id });
        await emitAdminEvent('admin-posts', 'post.moderated', { postId: id, moderationStatus: 'VISIBLE', post: serialized });
      }
    } catch (err) {
      console.error('Lỗi gửi Pusher realtime post update (admin restore/hide):', err);
    }

    return res.status(200).json({
      success: true,
      message: action === 'HIDE' ? 'Đã ẩn bài viết thành công.' : 'Đã khôi phục bài viết thành công.'
    });
  } catch (error) {
    console.error('Error moderating post:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi thực hiện hành động kiểm duyệt.' });
  }
};
