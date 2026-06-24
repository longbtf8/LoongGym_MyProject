const { prisma } = require("@/lib/prisma");

/**
 * Lấy số liệu thống kê tổng quan cho trang Dashboard Admin
 */
const getDashboardStats = async () => {
  // 1. Thống kê Người dùng (ACTIVE / SUSPENDED)
  const [totalUsers, activeUsers, suspendedUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
  ]);

  // 2. Thống kê Bài viết (moderationStatus: VISIBLE / HIDDEN)
  const [totalPosts, visiblePosts, hiddenPosts] = await Promise.all([
    prisma.communityPost.count(),
    prisma.communityPost.count({ where: { moderationStatus: "VISIBLE" } }),
    prisma.communityPost.count({ where: { moderationStatus: "HIDDEN" } }),
  ]);

  // 3. Thống kê Báo cáo bài viết (pending / resolved)
  const [totalReports, pendingReports, resolvedReports] = await Promise.all([
    prisma.postReport.count(),
    prisma.postReport.count({
      where: {
        status: { in: ["pending", "PENDING"] }
      }
    }),
    prisma.postReport.count({
      where: {
        status: { in: ["resolved", "RESOLVED", "dismissed", "DISMISSED"] }
      }
    }),
  ]);

  // 4. Thống kê Sản phẩm (active / draft / out_of_stock / archived)
  const [totalProducts, activeProducts, draftProducts, outOfStockProducts, archivedProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.product.count({ where: { status: "draft" } }),
    prisma.product.count({ where: { status: "out_of_stock" } }),
    prisma.product.count({ where: { status: "archived" } }),
  ]);

  // 5. Thống kê Giáo án (isPublished: true / false)
  const [totalWorkoutPrograms, publishedPrograms, unpublishedPrograms] = await Promise.all([
    prisma.workoutProgram.count(),
    prisma.workoutProgram.count({ where: { isPublished: true } }),
    prisma.workoutProgram.count({ where: { isPublished: false } }),
  ]);

  // 6. Lấy 5 report mới nhất
  const recentReportsRaw = await prisma.postReport.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      post: {
        select: {
          id: true,
          content: true,
          user: {
            select: {
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
      reporter: {
        select: {
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  const recentReports = await Promise.all(
    recentReportsRaw.map(async (report) => {
      const totalReportsOnPost = await prisma.postReport.count({
        where: { postId: report.postId },
      });

      return {
        id: report.id,
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
        post: {
          id: report.post?.id || "",
          contentPreview: report.post?.content 
            ? (report.post.content.length > 60 
                ? report.post.content.slice(0, 60) + "..." 
                : report.post.content)
            : "Bài viết không có nội dung văn bản",
          authorName: report.post?.user?.profile?.fullName || "Người dùng LoongMilkGym",
          authorAvatar: report.post?.user?.profile?.avatarUrl || null,
        },
        reporterName: report.reporter?.profile?.fullName || "Người dùng ẩn danh",
        totalReportsOnPost,
      };
    })
  );

  // 7. Lấy 5 hoạt động Admin gần nhất
  const recentActivities = await prisma.adminAuditLog.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
    },
    posts: {
      total: totalPosts,
      visible: visiblePosts,
      hidden: hiddenPosts,
    },
    reports: {
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
    },
    products: {
      total: totalProducts,
      active: activeProducts,
      draft: draftProducts,
      outOfStock: outOfStockProducts,
      archived: archivedProducts,
    },
    workoutPrograms: {
      total: totalWorkoutPrograms,
      published: publishedPrograms,
      unpublished: unpublishedPrograms,
    },
    recentReports,
    recentActivities,
  };
};

module.exports = {
  getDashboardStats,
};
