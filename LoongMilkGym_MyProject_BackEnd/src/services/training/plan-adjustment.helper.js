const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");
const { getDateOnly, diffDays, getProgramDayForOffset } = require("./plan-setup.helper");

/**
 * Lấy chi tiết thông tin và bài tập của một ngày tập
 */
const getDayDetails = async (userId, dayId) => {
  const day = await prisma.userTrainingPlanDay.findUnique({
    where: { id: dayId },
    include: {
      plan: true
    }
  });

  if (!day) {
    throw new AppError("Không tìm thấy ngày tập.", httpCodes.notFound);
  }

  if (day.plan.userId !== userId) {
    throw new AppError("Bạn không có quyền truy cập ngày tập này.", httpCodes.forbidden);
  }

  const dayOffset = day.metadata?.cycleOffset ?? diffDays(day.plan.startDate, day.scheduledDate);
  const metadataCycleDay = day.metadata?.cycleDay;

  const program = day.plan.programId ? await prisma.workoutProgram.findUnique({
    where: { id: day.plan.programId },
    include: {
      days: {
        orderBy: { cycleDay: "asc" },
        include: {
          templates: {
            include: {
              exercises: {
                orderBy: { exerciseOrder: "asc" },
                include: {
                  exercise: true
                }
              }
            }
          }
        }
      }
    }
  }) : null;

  const fallbackProgramDay = program
    ? getProgramDayForOffset(program.days, dayOffset, day.plan.metadata?.dayMapping)
    : null;
  const programDay = day.metadata?.programDayId
    ? program?.days?.find((item) => item.id === day.metadata.programDayId) || fallbackProgramDay
    : program?.days?.find((item) => item.cycleDay === metadataCycleDay) || fallbackProgramDay;
  const cycleDay = programDay?.cycleDay || metadataCycleDay || null;

  let exercises = [];
  const hasCustomExercises = day.metadata?.customExercises !== undefined && day.metadata?.customExercises !== null;
  const customExercises = hasCustomExercises ? day.metadata.customExercises : [];

  if (hasCustomExercises) {
    const customExs = customExercises;
    if (customExs.length === 0) {
      exercises = [];
    } else {
      const exIds = customExs.map(e => e.exerciseId);
      
      const dbExs = await prisma.exercise.findMany({
        where: { id: { in: exIds } },
        include: {
          primaryEquipment: true,
          muscles: {
            include: {
              muscleGroup: true
            }
          }
        }
      });

      exercises = customExs.map(ce => {
        const exercise = dbExs.find(e => e.id === ce.exerciseId);
        return {
          id: ce.id || ce.exerciseId,
          exerciseId: ce.exerciseId,
          exerciseOrder: ce.exerciseOrder,
          sets: ce.sets,
          repsMin: ce.repsMin,
          repsMax: ce.repsMax,
          weightKg: ce.weightKg,
          restSeconds: ce.restSeconds,
          tempo: ce.tempo || "2-0-1-0",
          note: ce.note || "",
          exercise: exercise || null
        };
      }).sort((a, b) => a.exerciseOrder - b.exerciseOrder);
    }
  } else if (programDay && programDay.templates.length > 0) {
    exercises = programDay.templates[0].exercises;
  }

  return {
    day: {
      id: day.id,
      userTrainingPlanId: day.userTrainingPlanId,
      scheduledDate: day.scheduledDate,
      title: day.title,
      status: day.status,
      skipReason: day.skipReason,
      notes: day.notes,
      metadata: day.metadata,
      createdAt: day.createdAt
    },
    focusArea: programDay?.focusArea || null,
    muscleMapUrl: day.metadata?.muscleMapUrl || programDay?.muscleMapUrl || null,
    cycleDay,
    dayNumber: cycleDay,
    exercises
  };
};

/**
 * Cập nhật thông tin ngày tập
 */
const updateDayDetails = async (userId, dayId, updateData) => {
  const day = await prisma.userTrainingPlanDay.findUnique({
    where: { id: dayId },
    include: {
      plan: true
    }
  });

  if (!day) {
    throw new AppError("Không tìm thấy ngày tập cần cập nhật.", httpCodes.notFound);
  }

  if (day.plan.userId !== userId) {
    throw new AppError("Bạn không có quyền chỉnh sửa ngày tập này.", httpCodes.forbidden);
  }

  const data = {};
  if (updateData.title !== undefined) data.title = updateData.title;
  if (updateData.status !== undefined) data.status = updateData.status;
  if (updateData.notes !== undefined) data.notes = updateData.notes;
  if (updateData.skipReason !== undefined) data.skipReason = updateData.skipReason;
  if (updateData.metadata !== undefined) {
    const existingOriginal = day.metadata?.originalExercises;
    data.metadata = {
      ...(day.metadata || {}),
      ...updateData.metadata
    };
    if (existingOriginal && !updateData.metadata.originalExercises) {
      data.metadata.originalExercises = existingOriginal;
    }
  }

  return prisma.userTrainingPlanDay.update({
    where: { id: dayId },
    data
  });
};

/**
 * Hoàn tất ngày tập, tính toán calo tiêu hao, cộng dồn thống kê
 */
const completeDay = async (userId, dayId, notes) => {
  const currentDay = await prisma.userTrainingPlanDay.findUnique({
    where: { id: dayId },
    include: { plan: true },
  });

  if (!currentDay) {
    throw new AppError("Không tìm thấy ngày tập.", httpCodes.notFound);
  }

  if (currentDay.plan.userId !== userId) {
    throw new AppError("Bạn không có quyền hoàn tất ngày tập này.", httpCodes.forbidden);
  }

  if (currentDay.status === "completed") {
    const updatedDay = await prisma.userTrainingPlanDay.update({
      where: { id: dayId },
      data: {
        notes: notes || null
      }
    });
    return { day: updatedDay, caloriesBurned: 0 };
  }

  if (currentDay.status === "rest") {
    throw new AppError("Không thể hoàn tất ngày nghỉ.", httpCodes.badRequest);
  }

  const dayDetails = await getDayDetails(userId, dayId);
  const exercises = dayDetails.exercises || [];

  const profile = await prisma.userProfile.findUnique({
    where: { userId }
  });
  const weightKg = profile?.weightKg || 70;

  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets || 3), 0);
  const durationMinutes = Math.max(totalSets * 2.5, 30);
  const durationSeconds = Math.round(durationMinutes * 60);
  const caloriesBurned = Math.round(6.0 * 3.5 * weightKg / 200 * durationMinutes);

  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const updatedDay = await tx.userTrainingPlanDay.update({
      where: { id: dayId },
      data: {
        status: "completed",
        notes: notes || null
      }
    });

    const session = await tx.workoutSession.create({
      data: {
        userId,
        planDayId: dayId,
        title: currentDay.title,
        startedAt,
        endedAt,
        durationSeconds,
        status: "completed",
        notes: notes || null,
      },
    });

    if (exercises.length > 0) {
      await tx.workoutSessionExercise.createMany({
        data: exercises.map((ex, index) => ({
          workoutSessionId: session.id,
          exerciseId: ex.exerciseId,
          exerciseOrder: ex.exerciseOrder || index + 1,
          status: "completed",
          notes: ex.note || null,
        })),
      });
    }

    await tx.userProfile.update({
      where: { userId },
      data: {
        totalWorkoutDays: { increment: 1 },
        totalCaloriesBurned: { increment: caloriesBurned }
      }
    });

    const cutoffDate = getDateOnly(new Date());
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    await tx.userTrainingPlanDay.deleteMany({
      where: {
        plan: { userId },
        scheduledDate: { lt: cutoffDate },
        status: { in: ["completed", "skipped", "rest"] }
      }
    });

    return { day: updatedDay, sessionId: session.id };
  });

  return {
    day: result.day,
    caloriesBurned
  };
};

const REST_DAY_TITLE = "Nghỉ phục hồi";

const buildSwapPayloadFromDay = (sourceDay) => {
  const metadata = { ...(sourceDay.metadata || {}) };

  if (sourceDay.status === "rest") {
    return {
      title: sourceDay.title || REST_DAY_TITLE,
      notes: sourceDay.notes,
      status: "rest",
      metadata: {
        ...metadata,
        customExercises: [],
        customized: false,
      },
    };
  }

  return {
    title: sourceDay.title,
    notes: sourceDay.notes,
    status: sourceDay.status,
    metadata,
  };
};

/**
 * Hoán đổi nội dung + trạng thái giữa 2 ngày tập (REST ↔ buổi tập)
 */
const swapDaysDates = async (userId, dayId1, dayId2) => {
  const day1 = await prisma.userTrainingPlanDay.findUnique({
    where: { id: dayId1 },
    include: { plan: true },
  });
  const day2 = await prisma.userTrainingPlanDay.findUnique({
    where: { id: dayId2 },
    include: { plan: true },
  });

  if (!day1 || !day2) {
    throw new AppError("Không tìm thấy ngày tập để hoán đổi.", httpCodes.notFound);
  }

  if (day1.plan.userId !== userId || day2.plan.userId !== userId) {
    throw new AppError("Bạn không có quyền chỉnh sửa ngày tập này.", httpCodes.forbidden);
  }

  if (day1.status === "completed" || day2.status === "completed") {
    throw new AppError("Không thể hoán đổi ngày tập đã hoàn thành.", httpCodes.badRequest);
  }

  const day1Original = day1.metadata?.originalExercises || 
    (Array.isArray(day1.metadata?.customExercises) ? day1.metadata.customExercises.map(ex => ({ ...ex })) : []);
  const day2Original = day2.metadata?.originalExercises || 
    (Array.isArray(day2.metadata?.customExercises) ? day2.metadata.customExercises.map(ex => ({ ...ex })) : []);

  const day1Payload = buildSwapPayloadFromDay(day2);
  const day2Payload = buildSwapPayloadFromDay(day1);

  // Preserve slot-specific original exercises and mark customized: true
  day1Payload.metadata = {
    ...(day1Payload.metadata || {}),
    originalExercises: day1Original,
    customized: true,
  };

  day2Payload.metadata = {
    ...(day2Payload.metadata || {}),
    originalExercises: day2Original,
    customized: true,
  };

  return prisma.$transaction(async (tx) => {
    const updatedDay1 = await tx.userTrainingPlanDay.update({
      where: { id: dayId1 },
      data: day1Payload,
    });

    const updatedDay2 = await tx.userTrainingPlanDay.update({
      where: { id: dayId2 },
      data: day2Payload,
    });

    return [updatedDay1, updatedDay2];
  });
};

module.exports = {
  getDayDetails,
  updateDayDetails,
  completeDay,
  swapDaysDates,
};
