const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");

/**
 * Lấy thông tin tóm tắt hiển thị trên Dashboard của người dùng
 * @param {string} userId - ID người dùng cần truy vấn
 */
const getDashboardSummary = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new AppError("Không tìm thấy người dùng", httpCodes.notFound);
  }

  const profile = user.profile || {};

  // Fetch real today's nutrition totals & targets
  const todayStr = new Date().toISOString().split("T")[0];
  let nutritionData = {
    protein: 0,
    proteinTarget: 160,
    carbs: 0,
    carbsTarget: 300,
    fat: 0,
    fatTarget: 80,
  };

  try {
    const nutritionInfo = await require("./nutrition.service").getTodayNutrition(userId, todayStr);
    nutritionData = {
      protein: nutritionInfo.totals.protein,
      proteinTarget: nutritionInfo.target.proteinGTarget ? Math.round(Number(nutritionInfo.target.proteinGTarget)) : 160,
      carbs: nutritionInfo.totals.carbs,
      carbsTarget: nutritionInfo.target.carbsGTarget ? Math.round(Number(nutritionInfo.target.carbsGTarget)) : 300,
      fat: nutritionInfo.totals.fat,
      fatTarget: nutritionInfo.target.fatGTarget ? Math.round(Number(nutritionInfo.target.fatGTarget)) : 80,
    };
  } catch (err) {
    // Fallback to defaults on error
  }

  // Fetch real recovery data for today
  let recoveryData = {
    recoveryScore: 0,
    sleepHoursText: "--",
    energyText: "--",
    sorenessText: "--",
    hasLog: false,
  };

  try {
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const todayRecovery = await prisma.recoveryLog.findUnique({
      where: {
        userId_logDate: {
          userId,
          logDate: utcToday,
        },
      },
    });

    if (todayRecovery) {
      recoveryData = {
        recoveryScore: todayRecovery.recoveryScore,
        sleepHoursText: `${todayRecovery.sleepHours}h`,
        energyText: todayRecovery.energyLevel >= 8 ? "Cao" : todayRecovery.energyLevel >= 5 ? "Vừa" : "Thấp",
        sorenessText: todayRecovery.sorenessLevel >= 8 ? "Nhiều" : todayRecovery.sorenessLevel >= 4 ? "Vừa" : "Nhẹ",
        hasLog: true,
      };
    }
  } catch (err) {
    // ignore
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: profile.fullName || "GymLife User",
      avatarUrl: profile.avatarUrl || null,
      goal: profile.goal || "gain_muscle",
      fitnessLevel: profile.fitnessLevel || "beginner",
    },
    todayWorkout: null,
    recovery: recoveryData,
    nutrition: nutritionData,
    stats: {
      completedWorkoutsThisWeek: 0,
      totalWorkoutMinutesThisWeek: 0,
      currentStreak: 0,
    },
    quickActions: [
      {
        label: "Xem thư viện bài tập",
        path: "/library",
      },
      {
        label: "Chọn lộ trình tập",
        path: "/plans",
      },
      {
        label: "Hỏi AI Coach",
        path: "/ai-coach",
      },
    ],
  };
};

module.exports = {
  getDashboardSummary,
};
