const { prisma } = require('@/lib/prisma');
const { deleteOldImage } = require('@/utils/cloudinary');
const pusher = require('@/lib/pusher');

/**
 * GET /api/admin/reports
 * Lấy danh sách báo cáo với các bộ lọc phân trang, tìm kiếm, sắp xếp
 */
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { status, reason, search, dateFrom, dateTo, sort, postId } = req.query;

    // Build Prisma query clauses
    const whereClause = {};

    if (postId) {
      whereClause.postId = postId;
    }

    if (status) {
      const upperStatus = status.toUpperCase();
      if (upperStatus === 'PENDING') {
        whereClause.status = { in: ['pending', 'PENDING'] };
      } else if (upperStatus === 'RESOLVED') {
        whereClause.status = { in: ['resolved', 'RESOLVED'] };
      } else if (upperStatus === 'DISMISSED') {
        whereClause.status = { in: ['dismissed', 'DISMISSED'] };
      } else {
        whereClause.status = status;
      }
    }

    if (reason) {
      whereClause.reason = { contains: reason };
    }

    if (search) {
      whereClause.OR = [
        {
          post: {
            user: {
              OR: [
                { email: { contains: search } },
                { profile: { fullName: { contains: search } } }
              ]
            }
          }
        },
        {
          reporter: {
            OR: [
              { email: { contains: search } },
              { profile: { fullName: { contains: search } } }
            ]
          }
        }
      ];
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

    // Determine sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'most_reported') {
      orderBy = {
        post: {
          reports: {
            _count: 'desc'
          }
        }
      };
    }

    // Query reports from DB
    const items = await prisma.postReport.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        post: {
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
                reports: true
              }
            }
          }
        }
      }
    });

    const total = await prisma.postReport.count({ where: whereClause });
    const totalPages = Math.ceil(total / limit);

    // Populate statistics for each report item
    const formattedItems = items.map((report) => {
      return {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
        resolvedAt: report.resolvedAt,
        resolutionAction: report.resolutionAction,
        resolutionNotes: report.resolutionNotes,
        reporter: {
          id: report.reporter?.id,
          fullName: report.reporter?.profile?.fullName || 'Chưa đặt tên',
          avatarUrl: report.reporter?.profile?.avatarUrl,
          email: report.reporter?.email
        },
        postAuthor: {
          id: report.post?.user?.id,
          fullName: report.post?.user?.profile?.fullName || 'Chưa đặt tên',
          avatarUrl: report.post?.user?.profile?.avatarUrl,
          email: report.post?.user?.email,
          status: report.post?.user?.status
        },
        post: {
          id: report.post?.id,
          content: report.post?.content || '',
          createdAt: report.post?.createdAt,
          visibility: report.post?.visibility,
          moderationStatus: report.post?.moderationStatus,
          mediaCount: report.post?.media?.length || 0,
          firstImageUrl: report.post?.media?.[0]?.mediaUrl || null
        },
        stats: {
          totalReportsOfThisPost: report.post?._count?.reports || 1,
          totalReportsOfPostAuthor: 0,
          totalHiddenPostsOfPostAuthor: 0
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        items: formattedItems,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy danh sách báo cáo.' });
  }
};

/**
 * GET /api/admin/reports/:id
 * Lấy chi tiết báo cáo và thông tin liên quan
 */
exports.getReportDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.postReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        resolvedBy: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true
              }
            }
          }
        },
        post: {
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
            comments: {
              take: 5,
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    profile: { select: { fullName: true } }
                  }
                }
              }
            },
            _count: {
              select: {
                reports: true,
                reactions: true,
                comments: true
              }
            }
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Báo cáo không tồn tại.' });
    }

    const postAuthorId = report.post?.userId;
    let totalReportsOfPostAuthor = 0;
    let totalHiddenPostsOfPostAuthor = 0;
    let authorViolationHistory = [];

    if (postAuthorId) {
      totalReportsOfPostAuthor = await prisma.postReport.count({
        where: {
          post: { userId: postAuthorId }
        }
      });

      totalHiddenPostsOfPostAuthor = await prisma.communityPost.count({
        where: {
          userId: postAuthorId,
          moderationStatus: { in: ['HIDDEN', 'REMOVED'] }
        }
      });

      // Get last 5 violations/admin actions against this user from audit logs
      authorViolationHistory = await prisma.adminAuditLog.findMany({
        where: {
          targetType: 'USER',
          targetId: postAuthorId,
          action: { in: ['SUSPEND_USER', 'WARN_USER'] }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
    }

    // Get other reports for the same post
    const otherReports = await prisma.postReport.findMany({
      where: {
        postId: report.postId,
        id: { not: report.id }
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    const responseData = {
      id: report.id,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
      resolvedAt: report.resolvedAt,
      resolutionAction: report.resolutionAction,
      resolutionNotes: report.resolutionNotes,
      resolvedBy: report.resolvedBy ? {
        id: report.resolvedBy.id,
        fullName: report.resolvedBy.profile?.fullName || report.resolvedBy.email
      } : null,
      reporter: {
        id: report.reporter?.id,
        fullName: report.reporter?.profile?.fullName || 'Chưa đặt tên',
        avatarUrl: report.reporter?.profile?.avatarUrl,
        email: report.reporter?.email
      },
      postAuthor: {
        id: report.post?.user?.id,
        fullName: report.post?.user?.profile?.fullName || 'Chưa đặt tên',
        avatarUrl: report.post?.user?.profile?.avatarUrl,
        email: report.post?.user?.email,
        status: report.post?.user?.status
      },
      post: {
        id: report.post?.id,
        content: report.post?.content || '',
        createdAt: report.post?.createdAt,
        visibility: report.post?.visibility,
        moderationStatus: report.post?.moderationStatus,
        media: report.post?.media || [],
        likesCount: report.post?._count?.reactions || 0,
        commentsCount: report.post?._count?.comments || 0,
        recentComments: report.post?.comments?.map(c => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          authorName: c.user?.profile?.fullName || 'Người dùng'
        })) || []
      },
      stats: {
        totalReportsOfThisPost: report.post?._count?.reports || 1,
        totalReportsOfPostAuthor,
        totalHiddenPostsOfPostAuthor
      },
      otherReportsOfThisPost: otherReports.map(or => ({
        id: or.id,
        reason: or.reason,
        createdAt: or.createdAt,
        reporterName: or.reporter?.profile?.fullName || or.reporter?.email,
        reporterAvatarUrl: or.reporter?.profile?.avatarUrl || null,
        reporterEmail: or.reporter?.email
      })),
      authorViolationHistory: authorViolationHistory.map(av => ({
        id: av.id,
        action: av.action,
        description: av.description,
        createdAt: av.createdAt
      }))
    };

    return res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error fetching report detail:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết báo cáo.' });
  }
};

/**
 * PATCH /api/admin/reports/:id/resolve
 * Xử lý báo cáo bài viết (Dismiss, Warn, Hide, Remove, Suspend)
 */
exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const adminId = req.user?.id || req.userId || req.adminId; // Set from authRequire middleware

    const safeNotes = (notes || '').trim() || 'Xử lý báo cáo bởi Admin';

    const allowedActions = ['DISMISS', 'HIDE_POST', 'REMOVE_POST', 'SUSPEND_USER'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Hành động xử lý không hợp lệ.' });
    }

    // Fetch the report first to check its current state
    const report = await prisma.postReport.findUnique({
      where: { id },
      include: {
        post: {
          include: {
            user: true,
            media: true
          }
        }
      }
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Báo cáo không tồn tại.' });
    }

    if (report.status === 'RESOLVED' || report.status === 'DISMISSED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Báo cáo này đã được xử lý trước đó và không thể xử lý lại.' 
      });
    }

    const postAuthor = report.post?.user;
    const postId = report.postId;

    if (!report.post && action !== 'DISMISS') {
      return res.status(400).json({ success: false, message: 'Bài viết liên quan không tồn tại hoặc đã bị xóa vĩnh viễn.' });
    }

    // Check permissions if suspending user
    if (action === 'SUSPEND_USER' && postAuthor) {
      if (postAuthor.id === adminId) {
        return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình.' });
      }
      if (postAuthor.role === 'ADMIN') {
        return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản của quản trị viên khác.' });
      }
    }

    // Execute changes within a database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update report status
      const reportStatus = action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
      await tx.postReport.update({
        where: { id },
        data: {
          status: reportStatus,
          resolvedAt: new Date(),
          resolvedById: adminId,
          resolutionAction: action,
          resolutionNotes: safeNotes
        }
      });

      // 2. Perform actions on Post and Author
      if (action === 'HIDE_POST') {
        await tx.communityPost.update({
          where: { id: postId },
          data: { 
            moderationStatus: 'HIDDEN',
            moderationReason: safeNotes,
            moderatedAt: new Date(),
            moderatedById: adminId
          }
        });
      } else if (action === 'REMOVE_POST') {
        // Soft delete post
        await tx.communityPost.update({
          where: { id: postId },
          data: {
            moderationStatus: 'REMOVED',
            moderationReason: safeNotes,
            moderatedAt: new Date(),
            moderatedById: adminId
          }
        });
      } else if (action === 'SUSPEND_USER' && postAuthor) {
        // Suspend user for 3 days
        const suspendedUntilDate = new Date();
        suspendedUntilDate.setDate(suspendedUntilDate.getDate() + 3);

        await tx.user.update({
          where: { id: postAuthor.id },
          data: {
            status: 'SUSPENDED',
            suspendedUntil: suspendedUntilDate
          }
        });

        // Revoke all refresh tokens
        await tx.refreshTokens.deleteMany({
          where: { userId: postAuthor.id }
        });

        // Hide the reported post
        await tx.communityPost.update({
          where: { id: postId },
          data: { 
            moderationStatus: 'HIDDEN',
            moderationReason: `Tác giả bị khóa tài khoản: ${safeNotes}`,
            moderatedAt: new Date(),
            moderatedById: adminId
          }
        });
      }

      // 3. Write target log (Post owner warning or ban)
      if (action === 'WARN_USER' && postAuthor) {
        await tx.adminAuditLog.create({
          data: {
            adminId,
            action: 'WARN_USER',
            targetType: 'USER',
            targetId: postAuthor.id,
            description: `Cảnh cáo người dùng ${postAuthor.email} từ báo cáo bài viết #${postId}. Lý do: ${safeNotes}`
          }
        });
      } else if (action === 'SUSPEND_USER' && postAuthor) {
        await tx.adminAuditLog.create({
          data: {
            adminId,
            action: 'SUSPEND_USER',
            targetType: 'USER',
            targetId: postAuthor.id,
            description: `Khóa tài khoản người dùng ${postAuthor.email} trong 3 ngày từ báo cáo bài viết #${postId}. Lý do: ${safeNotes}`
          }
        });
      }

      // 4. Save general audit log
      await tx.adminAuditLog.create({
        data: {
          adminId,
          action: `RESOLVE_REPORT_${action}`,
          targetType: 'REPORT',
          targetId: id,
          description: `Admin đã xử lý báo cáo #${id} với hành động: ${action}.`,
          metadata: {
            postId,
            authorId: postAuthor?.id,
            notes: safeNotes
          }
        }
      });
    });

    // Trigger real-time updates after transaction succeeds
    try {
      const reportStatus = action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED';
      
      // Notify community feed if the post is no longer public/visible
      if (action === 'REMOVE_POST' || action === 'HIDE_POST' || action === 'SUSPEND_USER') {
        await pusher.trigger('community-feed', 'post.deleted', { postId });
      }

      // Query updated stats for the admin reports dashboard
      const reportCountData = await prisma.postReport.count();
      const pendingReportsCount = await prisma.postReport.count({
        where: { status: { in: ["pending", "PENDING"] } }
      });
      const resolvedReportsCount = await prisma.postReport.count({
        where: { status: { in: ["resolved", "RESOLVED", "dismissed", "DISMISSED"] } }
      });

      await pusher.trigger('admin-reports', 'report.resolved', {
        reportId: id,
        postId,
        action,
        status: reportStatus,
        stats: {
          total: reportCountData,
          pending: pendingReportsCount,
          resolved: resolvedReportsCount
        }
      });

      if (action === 'SUSPEND_USER' && postAuthor?.id) {
        const { emitAdminEvent } = require('@/utils/admin-realtime.helper');
        const suspendedUser = await prisma.user.findUnique({
          where: { id: postAuthor.id },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            isSuperAdmin: true,
            createdAt: true,
            lastLoginAt: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                membershipTier: true,
              },
            },
            _count: {
              select: {
                communityPosts: true,
                trainingPlans: true,
                workoutSessions: true,
              },
            },
          },
        });
        if (suspendedUser) {
          await emitAdminEvent('admin-users', 'user.updated', { user: suspendedUser });
        }
      }
    } catch (err) {
      console.error('Lỗi gửi Pusher realtime report.resolved:', err);
    }

    return res.status(200).json({ 
      success: true, 
      message: action === 'DISMISS' 
        ? 'Đã bỏ qua báo cáo thành công.' 
        : 'Báo cáo đã được giải quyết thành công.' 
    });
  } catch (error) {
    console.error('Error resolving report:', error);
    return res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xử lý báo cáo.' });
  }
};
