const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");

const VIETNAM_TZ = "Asia/Ho_Chi_Minh";

const getVietnamDateParts = (dateInput = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [year, month, day] = formatter.format(dateInput).split("-").map(Number);
  return { year, month, day };
};

const getVietnamDayIndex = (dateInput = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: VIETNAM_TZ,
    weekday: "short",
  });
  const weekdayMap = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return weekdayMap[formatter.format(dateInput)] ?? 0;
};

const getVietnamWeekBounds = (referenceDate = new Date()) => {
  const parts = getVietnamDateParts(referenceDate);
  const dayIndex = getVietnamDayIndex(referenceDate);
  const refUtc = Date.UTC(parts.year, parts.month - 1, parts.day);
  const mondayUtc = refUtc - dayIndex * 24 * 60 * 60 * 1000;
  const monday = new Date(mondayUtc - 7 * 60 * 60 * 1000);
  const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  return { monday, sunday };
};

const getVietnamTodayString = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: VIETNAM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

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

  // Compute Weekly Stats & Maps Dynamically (theo múi giờ Việt Nam)
  const { monday, sunday } = getVietnamWeekBounds();

  let completedWorkoutsThisWeek = 0;
  let totalWorkoutMinutesThisWeek = 0;
  let caloriesBurnedThisWeek = 0;
  let averageSleepHours = "0.0";
  let weeklyWorkoutDaysMap = [0, 0, 0, 0, 0, 0, 0];
  let weeklyWorkoutMinutesMap = [0, 0, 0, 0, 0, 0, 0];
  let weeklyCaloriesMap = [0, 0, 0, 0, 0, 0, 0];
  let weeklySleepMap = [0, 0, 0, 0, 0, 0, 0];

  try {
    // 1. Fetch completed sessions this week
    const sessionsThisWeek = await prisma.workoutSession.findMany({
      where: {
        userId,
        status: "completed",
        endedAt: {
          gte: monday,
          lte: sunday,
        },
      },
    });

    sessionsThisWeek.forEach((session) => {
      if (!session.endedAt) return;
      const dayIndex = getVietnamDayIndex(session.endedAt);
      weeklyWorkoutDaysMap[dayIndex] = 1;
      const mins = Math.round((session.durationSeconds || 0) / 60);
      weeklyWorkoutMinutesMap[dayIndex] += mins;
      // Estimate 8 Kcal per minute of workout
      weeklyCaloriesMap[dayIndex] += mins * 8;
    });

    completedWorkoutsThisWeek = weeklyWorkoutDaysMap.reduce((a, b) => a + b, 0);
    totalWorkoutMinutesThisWeek = Math.round(weeklyWorkoutMinutesMap.reduce((a, b) => a + b, 0));
    caloriesBurnedThisWeek = Math.round(weeklyCaloriesMap.reduce((a, b) => a + b, 0));

    // 2. Fetch recovery logs this week
    const recoveryLogsThisWeek = await prisma.recoveryLog.findMany({
      where: {
        userId,
        logDate: {
          gte: monday,
          lte: sunday,
        },
      },
    });

    recoveryLogsThisWeek.forEach((log) => {
      const dayIndex = getVietnamDayIndex(log.logDate);
      weeklySleepMap[dayIndex] = Number(log.sleepHours);
    });

    const activeSleepLogs = weeklySleepMap.filter((h) => h > 0);
    if (activeSleepLogs.length > 0) {
      averageSleepHours = (activeSleepLogs.reduce((a, b) => a + b, 0) / activeSleepLogs.length).toFixed(1);
    }
  } catch (err) {
    console.error("Error computing weekly dashboard stats:", err);
  }

  // 3. Streak calculation
  let currentStreak = 0;
  try {
    const allCompletedSessions = await prisma.workoutSession.findMany({
      where: { userId, status: "completed" },
      select: { endedAt: true },
      orderBy: { endedAt: "desc" },
    });

    const uniqueDates = Array.from(
      new Set(
        allCompletedSessions
          .map((s) => s.endedAt)
          .filter(Boolean)
          .map((d) => new Date(d).toLocaleDateString("en-CA", { timeZone: VIETNAM_TZ }))
      )
    );

    if (uniqueDates.length > 0) {
      const todayStr = getVietnamTodayString();
      const yesterdayRef = new Date();
      yesterdayRef.setDate(yesterdayRef.getDate() - 1);
      const yesterdayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: VIETNAM_TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(yesterdayRef);

      let searchDateStr = uniqueDates[0] === todayStr ? todayStr : (uniqueDates[0] === yesterdayStr ? yesterdayStr : null);

      if (searchDateStr) {
        let checkDate = new Date(searchDateStr);
        let index = uniqueDates.indexOf(searchDateStr);
        
        while (index !== -1) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
          const nextCheckStr = checkDate.toLocaleDateString("en-CA");
          index = uniqueDates.indexOf(nextCheckStr);
        }
      }
    }
  } catch (err) {
    console.error("Error computing streak:", err);
  }

  // 4. Today's Workout recommendation
  let todayWorkout = null;
  try {
    const activePlan = await prisma.userTrainingPlan.findFirst({
      where: {
        userId,
        status: "active",
      },
      include: {
        days: true,
      },
    });
    if (activePlan) {
      const todayStr = getVietnamTodayString();

      const todayPlanDay = activePlan.days.find((day) => {
        const dayDateStr = new Date(day.scheduledDate).toISOString().split("T")[0];
        return dayDateStr === todayStr;
      });

      if (todayPlanDay) {
        let exercisesCount = 0;
        try {
          const details = await require("./training/plan-adjustment.helper").getDayDetails(userId, todayPlanDay.id);
          exercisesCount = details.exercises ? details.exercises.length : 0;
        } catch (e) {
          // ignore details if fails
        }

        todayWorkout = {
          id: todayPlanDay.id,
          title: todayPlanDay.title,
          status: todayPlanDay.status,
          exercisesCount,
          duration: todayPlanDay.metadata?.durationMinutes || (exercisesCount * 8 || 30),
          difficulty: activePlan.difficulty || "Trung bình",
        };
      }
    }
  } catch (err) {
    console.error("Error computing today's workout:", err);
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
    todayWorkout,
    recovery: recoveryData,
    nutrition: nutritionData,
    stats: {
      completedWorkoutsThisWeek,
      totalWorkoutMinutesThisWeek,
      caloriesBurnedThisWeek,
      averageSleepHours,
      currentStreak,
      weeklyWorkoutDaysMap,
      weeklyWorkoutMinutesMap,
      weeklyCaloriesMap,
      weeklySleepMap,
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
