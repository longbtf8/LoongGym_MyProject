const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");
const { normalizeWeeklyPlanPayload } = require("./ai-plan-payload.helper");

const MAX_AI_PLAN_DAYS = 112;
const MAX_EXERCISES_PER_DAY = 10;

const clampNumber = (value, min, max, fallback) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
};

const toDateOnly = (value) => {
  const date = value ? new Date(`${value}T00:00:00.000Z`) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Ngày trong đề xuất lộ trình không hợp lệ.", httpCodes.badRequest);
  }
  return date;
};

const getDateKey = (value) => new Date(value).toISOString().slice(0, 10);

const addDays = (dateInput, days) => {
  const date = new Date(dateInput);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const trimText = (value, fallback, maxLength) => {
  const text = typeof value === "string" ? value.trim() : "";
  return (text || fallback).slice(0, maxLength);
};

const buildWeekTemplate = (days) => {
  return days.map((day, index) => ({
    title: day.title,
    status: day.status,
    notes: day.notes || null,
    focusArea: day.metadata?.focusArea || null,
    cycleDay: index + 1,
    customExercises: Array.isArray(day.metadata?.customExercises)
      ? day.metadata.customExercises
      : [],
  }));
};

const buildAiPlanDays = async (tx, payload) => {
  payload = normalizeWeeklyPlanPayload(payload);

  if (!payload || typeof payload !== "object") {
    throw new AppError("Payload lộ trình AI không hợp lệ.", httpCodes.badRequest);
  }

  const sourceDays = Array.isArray(payload.weekTemplate) && payload.weekTemplate.length
    ? payload.weekTemplate
    : payload.days;

  if (!Array.isArray(sourceDays) || sourceDays.length === 0) {
    throw new AppError("Đề xuất lộ trình cần có ít nhất một ngày tập.", httpCodes.badRequest);
  }

  if (sourceDays.length > MAX_AI_PLAN_DAYS) {
    throw new AppError(`Lộ trình AI chỉ hỗ trợ tối đa ${MAX_AI_PLAN_DAYS} ngày trong một lần áp dụng.`, httpCodes.badRequest);
  }

  const startDate = toDateOnly(payload.startDate || new Date().toISOString().slice(0, 10));
  const weekDays = sourceDays.slice(0, 7);

  while (weekDays.length < 7) {
    weekDays.push({
      date: getDateKey(addDays(startDate, weekDays.length)),
      title: "Nghỉ phục hồi",
      focusArea: "Phục hồi",
      status: "rest",
      notes: "Ngày nghỉ để cơ bắp phục hồi trước buổi tiếp theo.",
      exercises: [],
    });
  }

  const dbExercises = await tx.exercise.findMany({
    where: { isPublished: true },
    select: { id: true, name: true }
  });

  const cleanAndNormalize = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/-uuid$/i, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[-]/g, " ")
      .split(/\s+/)
      .map(word => {
        if (word === "flyes" || word === "flies") return "fly";
        if (word === "triceps") return "tricep";
        if (word === "biceps") return "bicep";
        if (word === "squats") return "squat";
        if (word === "lunges") return "lunge";
        if (word === "raises") return "raise";
        if (word === "curls") return "curl";
        if (word === "rows") return "row";
        if (word === "presses") return "press";
        if (word === "pushups") return "pushup";
        if (word === "pullups") return "pullup";
        if (word === "deadlifts") return "deadlift";
        if (word.endsWith("s") && word.length > 3) {
          return word.slice(0, -1);
        }
        return word;
      })
      .join("");
  };

  const exerciseById = new Map(dbExercises.map((ex) => [ex.id, ex]));
  const exerciseByNormalizedName = new Map(dbExercises.map((ex) => [cleanAndNormalize(ex.name), ex]));

  const seenDateKeys = new Set();

  return weekDays.map((day, dayIndex) => {
    const scheduledDate = toDateOnly(day.date || getDateKey(addDays(startDate, dayIndex)));
    const dateKey = getDateKey(scheduledDate);

    if (seenDateKeys.has(dateKey)) {
      throw new AppError("Đề xuất lộ trình có ngày bị trùng. Vui lòng yêu cầu AI tạo lại lịch.", httpCodes.badRequest);
    }
    seenDateKeys.add(dateKey);

    const rawExercises = Array.isArray(day.exercises) ? day.exercises.slice(0, MAX_EXERCISES_PER_DAY) : [];
    const status = day.status === "rest" || rawExercises.length === 0 ? "rest" : "pending";

    const customExercises = status === "rest"
      ? []
      : rawExercises.map((item, index) => {
          let exercise = exerciseById.get(item.exerciseId);
          if (!exercise) {
            const normProposed = cleanAndNormalize(item.exerciseId);
            exercise = exerciseByNormalizedName.get(normProposed);
          }

          if (!exercise) {
            throw new AppError(`Bài tập '${item.exerciseId}' không tồn tại hoặc chưa được xuất bản.`, httpCodes.badRequest);
          }

          const resolvedExerciseId = exercise.id;
          const repsMin = Math.round(clampNumber(item.repsMin, 1, 100, 8));
          const repsMax = Math.round(clampNumber(item.repsMax, repsMin, 100, Math.max(repsMin, 12)));

          return {
            id: `${resolvedExerciseId}-${dayIndex + 1}-${index + 1}`,
            exerciseId: resolvedExerciseId,
            exerciseName: exercise.name,
            exerciseOrder: index + 1,
            sets: Math.round(clampNumber(item.sets, 1, 8, 3)),
            repsMin,
            repsMax,
            weightKg: clampNumber(item.weightKg, 0, 500, 0),
            restSeconds: Math.round(clampNumber(item.restSeconds, 15, 360, 90)),
            tempo: trimText(item.tempo, "2-0-1-0", 30),
            note: trimText(item.note, "Bài tập do AI Coach đề xuất", 250),
          };
        });

    return {
      scheduledDate,
      title: trimText(day.title, status === "rest" ? "Nghỉ phục hồi" : `Buổi tập ${dayIndex + 1}`, 150),
      status,
      notes: trimText(day.notes, "", 500) || null,
      metadata: {
        customExercises,
        customized: true,
        generatedFrom: "ai-coach",
        focusArea: trimText(day.focusArea, "", 100) || null,
        cycleDay: dayIndex + 1,
        cycleOffset: dayIndex,
      },
    };
  });
};

const assertPlanDayOwnership = async (tx, userId, planDayId) => {
  const day = await tx.userTrainingPlanDay.findFirst({
    where: {
      id: planDayId,
      plan: { userId },
    },
  });

  if (!day) {
    throw new AppError("Không tìm thấy ngày tập hoặc bạn không có quyền chỉnh sửa.", httpCodes.notFound);
  }

  return day;
};

const assertPublishedExercise = async (tx, exerciseId) => {
  const exercise = await tx.exercise.findFirst({
    where: {
      id: exerciseId,
      isPublished: true,
    },
  });

  if (!exercise) {
    throw new AppError("Bài tập được đề xuất không tồn tại hoặc chưa được xuất bản.", httpCodes.badRequest);
  }

  return exercise;
};

const createAiPlan = async (tx, userId, payload, days) => {
  const startDate = toDateOnly(payload.startDate || getDateKey(days[0].scheduledDate));
  const weekTemplate = buildWeekTemplate(days);
  const trainingDays = days.filter((day) => day.status !== "rest").length;

  await tx.userTrainingPlan.updateMany({
    where: {
      userId,
      status: "active",
    },
    data: {
      status: "replaced",
    },
  });

  return tx.userTrainingPlan.create({
    data: {
      userId,
      title: trimText(payload.title, "Lộ trình AI Coach", 200),
      startDate,
      status: "active",
      aiGenerated: true,
      aiPrompt: trimText(payload.notes, "", 2000) || null,
      metadata: {
        source: "ai-coach",
        goal: trimText(payload.goal, "", 100) || null,
        focusAreas: Array.isArray(payload.focusAreas) ? payload.focusAreas.slice(0, 8) : [],
        durationWeeks: clampNumber(payload.durationWeeks, 1, 16, Math.ceil(days.length / 7)),
        daysPerWeek: clampNumber(payload.daysPerWeek, 1, 7, trainingDays || 4),
        generatedWindowDays: days.length,
        cycleLength: weekTemplate.length,
        weekTemplate,
      },
      days: {
        create: days,
      },
    },
  });
};

const updateUpcomingAiPlanDays = async (tx, userId, payload, days) => {
  const startDate = toDateOnly(payload.startDate || getDateKey(days[0].scheduledDate));
  let activePlan = await tx.userTrainingPlan.findFirst({
    where: {
      userId,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
  });

  if (!activePlan) {
    return createAiPlan(tx, userId, payload, days);
  }

  const completedDays = await tx.userTrainingPlanDay.findMany({
    where: {
      userTrainingPlanId: activePlan.id,
      scheduledDate: { gte: startDate },
      status: "completed",
    },
    select: {
      scheduledDate: true,
    },
  });
  const completedDateKeys = new Set(completedDays.map((day) => getDateKey(day.scheduledDate)));
  const daysToCreate = days.filter((day) => !completedDateKeys.has(getDateKey(day.scheduledDate)));

  await tx.userTrainingPlanDay.deleteMany({
    where: {
      userTrainingPlanId: activePlan.id,
      scheduledDate: { gte: startDate },
      status: { not: "completed" },
    },
  });

  await tx.userTrainingPlan.update({
    where: { id: activePlan.id },
    data: {
      title: trimText(payload.title, activePlan.title, 200),
      aiGenerated: true,
      aiPrompt: trimText(payload.notes, "", 2000) || activePlan.aiPrompt,
      metadata: {
        ...(activePlan.metadata || {}),
        source: "ai-coach-update",
        goal: trimText(payload.goal, activePlan.metadata?.goal || "", 100) || null,
        focusAreas: Array.isArray(payload.focusAreas) ? payload.focusAreas.slice(0, 8) : activePlan.metadata?.focusAreas || [],
        durationWeeks: clampNumber(payload.durationWeeks, 1, 16, activePlan.metadata?.durationWeeks || Math.ceil(days.length / 7)),
        daysPerWeek: clampNumber(payload.daysPerWeek, 1, 7, activePlan.metadata?.daysPerWeek || 4),
        generatedWindowDays: days.length,
        updatedByAiAt: new Date().toISOString(),
      },
    },
  });

  if (daysToCreate.length) {
    await tx.userTrainingPlanDay.createMany({
      data: daysToCreate.map((day) => ({
        ...day,
        userTrainingPlanId: activePlan.id,
      })),
    });
  }

  return activePlan;
};

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
      await assertPlanDayOwnership(tx, userId, planDayId);
      await tx.userTrainingPlanDay.update({
        where: { id: planDayId },
        data: {
          scheduledDate: new Date(toDate),
        },
      });
    } else if (recommendationType === "skip_day") {
      const { planDayId, reason } = payload;
      await assertPlanDayOwnership(tx, userId, planDayId);
      await tx.userTrainingPlanDay.update({
        where: { id: planDayId },
        data: {
          status: "skipped",
          skipReason: reason || "Huỷ bởi AI Coach",
        },
      });
    } else if (recommendationType === "swap_exercise") {
      const { planDayId, sessionExerciseId, newExerciseId } = payload;
      const day = await assertPlanDayOwnership(tx, userId, planDayId);
      await assertPublishedExercise(tx, newExerciseId);
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
      const day = await assertPlanDayOwnership(tx, userId, planDayId);
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
    } else if (recommendationType === "deload") {
      const { planDayId, percentage } = payload;
      const deloadRatio = clampNumber(percentage, 10, 80, 30) / 100;
      const day = await assertPlanDayOwnership(tx, userId, planDayId);

      const metadata = { ...(day.metadata || {}) };
      if (!Array.isArray(metadata.customExercises)) {
        throw new AppError("Ngày tập này chưa có danh sách bài tập có thể giảm tải.", httpCodes.badRequest);
      }

      metadata.customExercises = metadata.customExercises.map((exercise) => ({
        ...exercise,
        sets: Math.max(1, Math.round((exercise.sets || 3) * (1 - deloadRatio))),
        weightKg: exercise.weightKg
          ? Math.max(0, Number((Number(exercise.weightKg) * (1 - deloadRatio)).toFixed(2)))
          : exercise.weightKg,
        note: exercise.note || `AI Coach đã giảm tải ${Math.round(deloadRatio * 100)}%`,
      }));

      await tx.userTrainingPlanDay.update({
        where: { id: planDayId },
        data: {
          metadata: {
            ...metadata,
            customized: true,
            deloadedByAi: true,
          },
        },
      });
    } else if (recommendationType === "nutrition_adjust") {
      const { calories, protein, carbs, fat } = payload;
      
      // Update general calorieGoal in userProfile
      if (calories) {
        await tx.userProfile.updateMany({
          where: { userId },
          data: {
            calorieGoal: Math.round(calories),
          },
        });
      }

      // Upsert daily nutrition target for today's date in UTC
      const today = new Date();
      const targetDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

      await tx.nutritionTarget.upsert({
        where: {
          userId_targetDate: {
            userId,
            targetDate,
          },
        },
        update: {
          caloriesTarget: calories ? Math.round(calories) : undefined,
          proteinGTarget: protein ? Math.round(protein) : undefined,
          carbsGTarget: carbs ? Math.round(carbs) : undefined,
          fatGTarget: fat ? Math.round(fat) : undefined,
        },
        create: {
          userId,
          targetDate,
          caloriesTarget: calories ? Math.round(calories) : 2000,
          proteinGTarget: protein ? Math.round(protein) : 150,
          carbsGTarget: carbs ? Math.round(carbs) : 200,
          fatGTarget: fat ? Math.round(fat) : 60,
        },
      });
    } else if (recommendationType === "generate_training_plan") {
      const days = await buildAiPlanDays(tx, payload);
      await createAiPlan(tx, userId, payload, days);
    } else if (recommendationType === "update_training_plan") {
      const days = await buildAiPlanDays(tx, payload);
      await updateUpcomingAiPlanDays(tx, userId, payload, days);
    } else {
      throw new AppError("Loại đề xuất AI chưa được hỗ trợ.", httpCodes.badRequest);
    }

    // Đánh dấu đề xuất là đã áp dụng thành công
    await tx.aiRecommendation.update({
      where: { id },
      data: {
        status: "applied",
        appliedAt: new Date(),
      },
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
