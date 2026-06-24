const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const { emitAdminEvent } = require("@/utils/admin-realtime.helper");

const fetchUserListItem = (id) =>
  prisma.user.findUnique({
    where: { id },
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

const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          email: {
            contains: search,
          },
        },
        {
          profile: {
            fullName: {
              contains: search,
            },
          },
        },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
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
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.success(
      {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      httpCodes.success,
      "Lấy danh sách người dùng thành công"
    );
  } catch (err) {
    next(err);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isSuperAdmin: true,
        createdAt: true,
        lastLoginAt: true,
        suspendedUntil: true,
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
            gender: true,
            birthDate: true,
            phone: true,
            address: true,
            goal: true,
            membershipTier: true,
            totalWorkoutDays: true,
            totalCaloriesBurned: true,
          },
        },
        _count: {
          select: {
            communityPosts: true,
            trainingPlans: true,
            postComments: true,
          },
        },
      },
    });

    if (!user) {
      return res.error("Người dùng không tồn tại", httpCodes.notFound);
    }

    // 5 recent community posts
    const recentPosts = await prisma.communityPost.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        content: true,
        createdAt: true,
        visibility: true,
      },
    });

    // 5 recent workout sessions
    const recentWorkouts = await prisma.workoutSession.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        startedAt: true,
        endedAt: true,
        durationSeconds: true,
        status: true,
        createdAt: true,
      },
    });

    // 10 recent admin audit logs targeting this user
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: {
        targetType: "USER",
        targetId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
      },
    });

    // Reported posts belonging to this user
    const reportedPosts = await prisma.postReport.findMany({
      where: {
        post: {
          userId: id,
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
        reporter: {
          select: {
            email: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return res.success(
      {
        user,
        recentPosts,
        recentWorkouts,
        auditLogs,
        reportedPosts,
      },
      httpCodes.success,
      "Lấy chi tiết người dùng thành công"
    );
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, duration } = req.body;

    if (!status || !["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      return res.error("Trạng thái không hợp lệ", httpCodes.badRequest);
    }

    if (status !== "ACTIVE" && !reason) {
      return res.error("Vui lòng nhập lý do thực hiện", httpCodes.badRequest);
    }

    if (id === req.user.id) {
      return res.error("Bạn không thể tự khóa tài khoản của chính mình", httpCodes.badRequest);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return res.error("Người dùng không tồn tại", httpCodes.notFound);
    }

    if (targetUser.isSuperAdmin) {
      return res.error("Không thể thay đổi trạng thái của Admin tối cao (Super Admin)", httpCodes.forbidden);
    }

    if (targetUser.role === "ADMIN" && !req.user.isSuperAdmin) {
      return res.error("Chỉ có Admin tối cao (Super Admin) mới có quyền thay đổi trạng thái của Admin khác", httpCodes.forbidden);
    }

    let suspendedUntil = null;
    if (status === "SUSPENDED") {
      if (duration === "3_days") {
        suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + 3);
      } else {
        return res.error("Thời gian khóa không hợp lệ", httpCodes.badRequest);
      }
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user status
      const updated = await tx.user.update({
        where: { id },
        data: {
          status,
          suspendedUntil,
        },
        select: {
          id: true,
          email: true,
          status: true,
          suspendedUntil: true,
        },
      });

      // 2. Revoke refresh tokens if user is locked
      if (status === "SUSPENDED" || status === "BANNED") {
        await tx.refreshTokens.deleteMany({
          where: { userId: id },
        });
      }

      // 3. Create admin audit log
      const actionName = status === "ACTIVE" ? "UNLOCK_USER" : "LOCK_USER";
      const descDetail = status === "ACTIVE"
        ? `Mở khóa tài khoản ${targetUser.email}. Lý do: ${reason || "Không có lý do chi tiết"}`
        : `Khóa tài khoản ${targetUser.email} (${status === "SUSPENDED" ? "3 ngày" : "Vĩnh viễn"}). Lý do: ${reason}`;

      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          action: actionName,
          targetType: "USER",
          targetId: id,
          description: descDetail,
        },
      });

      return updated;
    });

    const userItem = await fetchUserListItem(id);
    if (userItem) {
      await emitAdminEvent("admin-users", "user.updated", { user: userItem });
    }

    return res.success(
      result,
      httpCodes.success,
      status === "ACTIVE"
        ? "Mở khóa tài khoản thành công"
        : "Khóa tài khoản thành công"
    );
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return res.error("Vai trò không hợp lệ", httpCodes.badRequest);
    }

    if (id === req.user.id) {
      return res.error("Bạn không thể tự thay đổi vai trò của chính mình", httpCodes.badRequest);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return res.error("Người dùng không tồn tại", httpCodes.notFound);
    }

    if (targetUser.isSuperAdmin) {
      return res.error("Không thể thay đổi vai trò của Admin tối cao (Super Admin)", httpCodes.forbidden);
    }

    if (!req.user.isSuperAdmin) {
      return res.error("Chỉ có Admin tối cao (Super Admin) mới có quyền thay đổi vai trò của người dùng", httpCodes.forbidden);
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update user role
      const updated = await tx.user.update({
        where: { id },
        data: { role },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      // 2. Revoke refresh tokens if demoted to USER
      if (role === "USER") {
        await tx.refreshTokens.deleteMany({
          where: { userId: id },
        });
      }

      // 3. Create admin audit log
      await tx.adminAuditLog.create({
        data: {
          adminId: req.user.id,
          action: "UPDATE_USER_ROLE",
          targetType: "USER",
          targetId: id,
          description: `Thay đổi vai trò của tài khoản ${targetUser.email} thành ${role}.`,
        },
      });

      return updated;
    });

    const userItem = await fetchUserListItem(id);
    if (userItem) {
      await emitAdminEvent("admin-users", "user.updated", { user: userItem });
    }

    return res.success(
      result,
      httpCodes.success,
      "Cập nhật vai trò người dùng thành công"
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
};
