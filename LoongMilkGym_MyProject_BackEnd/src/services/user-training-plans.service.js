const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");

// Import các helper đã phân tách mô-đun hóa
const {
  appendUpcomingDaysIfNeeded,
  startProgramPlan,
  startCustomPlan,
  getDateOnly,
} = require("./training/plan-setup.helper");

const {
  getDayDetails,
  updateDayDetails,
  completeDay,
  swapDaysDates,
} = require("./training/plan-adjustment.helper");

/**
 * Lấy lộ trình tập luyện đang hoạt động của người dùng
 */
const getActivePlan = async (userId) => {
  const plan = await prisma.userTrainingPlan.findFirst({
    where: {
      userId,
      status: "active"
    },
    include: {
      days: {
        orderBy: {
          scheduledDate: "asc"
        }
      }
    }
  });

  if (!plan) {
    throw new AppError("Không tìm thấy lộ trình tập luyện nào đang hoạt động.", httpCodes.notFound);
  }

  // Tự động sinh thêm các ngày tập kế tiếp nếu sắp hết
  return appendUpcomingDaysIfNeeded(plan);
};

/**
 * Hủy lộ trình tập luyện đang hoạt động
 */
const cancelActivePlan = async (userId) => {
  const plan = await prisma.userTrainingPlan.findFirst({
    where: {
      userId,
      status: "active"
    }
  });

  if (!plan) {
    throw new AppError("Không tìm thấy lộ trình đang hoạt động để huỷ.", httpCodes.notFound);
  }

  return prisma.userTrainingPlan.delete({
    where: { id: plan.id }
  });
};

/**
 * Lấy thống kê số ngày tập và calo tiêu thụ từ UserProfile
 */
const getStats = async (userId) => {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      totalWorkoutDays: true,
      totalCaloriesBurned: true
    }
  });

  return {
    totalWorkoutDays: profile?.totalWorkoutDays || 0,
    totalCaloriesBurned: Math.round(profile?.totalCaloriesBurned || 0)
  };
};

/**
 * Lấy danh sách các ngày tập luyện trong một khoảng thời gian cụ thể
 */
const getTrainingPlanDays = async (userId, { from, to }) => {
  const startDate = new Date(from);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(to);
  endDate.setHours(23, 59, 59, 999);

  return prisma.userTrainingPlanDay.findMany({
    where: {
      plan: {
        userId,
        status: "active",
      },
      scheduledDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      scheduledDate: "asc",
    },
  });
};

module.exports = {
  getActivePlan,
  startProgramPlan,
  startCustomPlan,
  cancelActivePlan,
  getDayDetails,
  updateDayDetails,
  completeDay,
  getStats,
  getTrainingPlanDays,
  swapDaysDates
};
