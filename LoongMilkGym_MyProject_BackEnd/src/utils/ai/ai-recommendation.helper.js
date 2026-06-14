const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");

/**
 * Thực thi các thay đổi dựa trên đề xuất được duyệt.
 * @param {string} userId 
 * @param {string} id - ID của đề xuất
 */
const execute = async (userId, id) => {
  const recommendation = await prisma.aiRecommendation.findFirst({
    where: { id, userId },
  });

  if (!recommendation) {
    throw new AppError("Không tìm thấy đề xuất.", httpCodes.notFound);
  }

  if (recommendation.status !== "pending") {
    throw new AppError("Đề xuất này đã được xử lý trước đó.", httpCodes.badRequest);
  }

  const { recommendationType, payload } = recommendation;

  await prisma.$transaction(async (tx) => {
    if (recommendationType === "reschedule") {
      const { planDayId, toDate } = payload;
      await tx.userTrainingPlanDay.update({
        where: { id: planDayId },
        data: {
          scheduledDate: new Date(toDate),
        },
      });
    } else if (recommendationType === "skip_day") {
      const { planDayId, reason } = payload;
      await tx.userTrainingPlanDay.update({
        where: { id: planDayId },
        data: {
          status: "skipped",
          skipReason: reason || "Huỷ bởi AI Coach",
        },
      });
    } else if (recommendationType === "swap_exercise") {
      const { planDayId, sessionExerciseId, newExerciseId } = payload;
      const day = await tx.userTrainingPlanDay.findUnique({
        where: { id: planDayId },
      });
      if (day && day.metadata) {
        const metadata = { ...day.metadata };
        if (Array.isArray(metadata.customExercises)) {
          metadata.customExercises = metadata.customExercises.map((ex) => {
            if (ex.id === sessionExerciseId || ex.exerciseId === sessionExerciseId) {
              return { ...ex, exerciseId: newExerciseId };
            }
            return ex;
          });
          await tx.userTrainingPlanDay.update({
            where: { id: planDayId },
            data: { metadata },
          });
        }
      }
    } else if (recommendationType === "adjust_volume") {
      const { planDayId, sessionExerciseId, sets, reps, weightKg } = payload;
      const day = await tx.userTrainingPlanDay.findUnique({
        where: { id: planDayId },
      });
      if (day && day.metadata) {
        const metadata = { ...day.metadata };
        if (Array.isArray(metadata.customExercises)) {
          metadata.customExercises = metadata.customExercises.map((ex) => {
            if (ex.id === sessionExerciseId || ex.exerciseId === sessionExerciseId) {
              return {
                ...ex,
                sets: sets !== undefined ? sets : ex.sets,
                repsMin: reps !== undefined ? reps : ex.repsMin,
                repsMax: reps !== undefined ? reps : ex.repsMax,
                weightKg: weightKg !== undefined ? weightKg : ex.weightKg,
              };
            }
            return ex;
          });

          await tx.userTrainingPlanDay.update({
            where: { id: planDayId },
            data: { metadata },
          });
        }
      }
    } else if (recommendationType === "nutrition_adjust") {
      const { calories, protein, carbs, fat } = payload;
      const currentProfile = await tx.userProfile.findUnique({ where: { userId } });
      const currentMeta = currentProfile?.metadata || {};
      await tx.userProfile.update({
        where: { userId },
        data: {
          metadata: {
            ...currentMeta,
            targetCalories: calories,
            targetProtein: protein,
            targetCarbs: carbs,
            targetFat: fat,
          },
        },
      });
    }

    // Đánh dấu đề xuất là đã áp dụng thành công
    await tx.aiRecommendation.update({
      where: { id },
      data: { status: "applied" },
    });
  });

  return prisma.aiRecommendation.findUnique({ where: { id } });
};

/**
 * Từ chối đề xuất được đưa ra bởi AI Coach.
 * @param {string} userId 
 * @param {string} id 
 */
const reject = async (userId, id) => {
  const recommendation = await prisma.aiRecommendation.findFirst({
    where: { id, userId },
  });

  if (!recommendation) {
    throw new AppError("Không tìm thấy đề xuất.", httpCodes.notFound);
  }

  if (recommendation.status !== "pending") {
    throw new AppError("Đề xuất này đã được xử lý trước đó.", httpCodes.badRequest);
  }

  return prisma.aiRecommendation.update({
    where: { id },
    data: { status: "rejected" },
  });
};

module.exports = {
  execute,
  reject,
};
