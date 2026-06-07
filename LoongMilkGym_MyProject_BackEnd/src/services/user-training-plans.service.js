const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");

const PLAN_GENERATION_WINDOW_DAYS = 30;
const PLAN_GENERATION_THRESHOLD_DAYS = 7;

const buildPlanDays = (
  count,
  startDate,
  getTitle,
  getStatus = () => "pending",
  getMetadata = () => ({ customExercises: [] })
) => {
  return Array.from({ length: count }, (_, index) => {
    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(startDate.getDate() + index);

    return {
      scheduledDate,
      title: getTitle(index),
      status: getStatus(index),
      metadata: getMetadata(index),
    };
  });
};

const normalizeText = (value = "") => {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = (items) => {
  return [...items].sort(() => Math.random() - 0.5);
};

const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const focusKeywordRules = [
  {
    triggers: ["nguc", "chest", "push", "day 1: chest"],
    keywords: ["nguc", "chest", "pec", "vai", "shoulder", "deltoid", "tay sau", "tricep"],
  },
  {
    triggers: ["lung", "back", "pull"],
    keywords: ["lung", "back", "lat", "xo", "tay truoc", "bicep", "core", "abs", "bung"],
  },
  {
    triggers: ["chan", "leg", "lower", "dui", "mong", "calf"],
    keywords: ["chan", "leg", "dui", "quad", "hamstring", "mong", "glute", "bap chan", "calf"],
  },
  {
    triggers: ["vai", "shoulder"],
    keywords: ["vai", "shoulder", "deltoid", "tay sau", "tricep", "core", "abs", "bung"],
  },
  {
    triggers: ["arms"],
    keywords: ["tay", "arms", "tay truoc", "bicep", "tay sau", "tricep", "forearm"],
  },
  {
    triggers: ["tay truoc", "bicep"],
    keywords: ["tay truoc", "bicep"],
  },
  {
    triggers: ["tay sau", "tricep"],
    keywords: ["tay sau", "tricep"],
  },
  {
    triggers: ["toan than", "full body", "upper", "than tren"],
    keywords: [
      "nguc",
      "chest",
      "lung",
      "back",
      "vai",
      "shoulder",
      "tay",
      "arms",
      "chan",
      "leg",
      "dui",
      "core",
      "abs",
      "bung",
    ],
  },
  {
    triggers: ["core", "bung", "abs"],
    keywords: ["core", "abs", "bung"],
  },
];

const getFocusKeywords = (focusArea = "") => {
  const normalizedFocus = normalizeText(focusArea);
  const keywords = new Set();

  focusKeywordRules.forEach((rule) => {
    if (rule.triggers.some((trigger) => normalizedFocus.includes(trigger))) {
      rule.keywords.forEach((keyword) => keywords.add(keyword));
    }
  });

  normalizedFocus
    .split(/[,/&+-]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => keywords.add(part));

  return [...keywords];
};

const exerciseMatchesFocus = (exercise, focusKeywords) => {
  if (!focusKeywords.length) return false;

  const searchableText = normalizeText(
    [
      exercise?.name,
      exercise?.slug,
      exercise?.exerciseType,
      ...(exercise?.muscles || []).flatMap((item) => [
        item.muscleGroup?.name,
        item.muscleGroup?.slug,
      ]),
      ...(exercise?.tags || []).map((item) => item.tag),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return focusKeywords.some((keyword) => searchableText.includes(normalizeText(keyword)));
};

const mapTemplateExerciseToCustom = (templateExercise) => ({
  exerciseId: templateExercise.exerciseId,
  sets: templateExercise.sets || 3,
  repsMin: templateExercise.repsMin || 8,
  repsMax: templateExercise.repsMax || 12,
  weightKg: toNumber(templateExercise.weightKg, 0),
  restSeconds: templateExercise.restSeconds || 90,
  tempo: templateExercise.tempo || "2-0-1-0",
  note: templateExercise.note || "Bài tập từ giáo án",
});

const mapLibraryExerciseToCustom = (exercise, referenceExercise) => ({
  exerciseId: exercise.id,
  sets: referenceExercise?.sets || 3,
  repsMin: referenceExercise?.repsMin || 8,
  repsMax: referenceExercise?.repsMax || 12,
  weightKg: toNumber(referenceExercise?.weightKg, 0),
  restSeconds: referenceExercise?.restSeconds || 75,
  tempo: referenceExercise?.tempo || "2-0-1-0",
  note: "Bài tập liên quan được gợi ý tự động",
});

const buildRandomExercisesForProgramDay = (programDay, libraryExercises = []) => {
  const templateExercises = programDay?.templates?.[0]?.exercises || [];
  if (!templateExercises.length) return [];

  const focusKeywords = getFocusKeywords(programDay.focusArea || programDay.title);
  const randomizedTemplateExercises = shuffle(templateExercises);
  const desiredCount = templateExercises.length >= 5
    ? getRandomInt(Math.max(4, templateExercises.length - 1), templateExercises.length)
    : Math.min(5, templateExercises.length + 2);

  const picked = randomizedTemplateExercises.slice(0, desiredCount).map(mapTemplateExerciseToCustom);
  const pickedIds = new Set(picked.map((exercise) => exercise.exerciseId));

  if (picked.length < desiredCount) {
    const relatedLibraryExercises = shuffle(
      libraryExercises.filter((exercise) => {
        return !pickedIds.has(exercise.id) && exerciseMatchesFocus(exercise, focusKeywords);
      })
    );

    relatedLibraryExercises.slice(0, desiredCount - picked.length).forEach((exercise) => {
      const referenceExercise = templateExercises.find((item) => item.sets || item.repsMin || item.repsMax);
      picked.push(mapLibraryExerciseToCustom(exercise, referenceExercise));
      pickedIds.add(exercise.id);
    });
  }

  return picked.map((exercise, index) => ({
    ...exercise,
    exerciseOrder: index + 1,
  }));
};

const getDateOnly = (dateInput) => {
  const date = new Date(dateInput);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (dateInput, days) => {
  const date = getDateOnly(dateInput);
  date.setDate(date.getDate() + days);
  return date;
};

const diffDays = (startInput, endInput) => {
  const start = getDateOnly(startInput);
  const end = getDateOnly(endInput);
  return Math.round((end - start) / 86400000);
};

const getProgramDayForOffset = (programDays, offset, dayMapping) => {
  if (!programDays.length) return null;

  const cycleIndex = ((offset % programDays.length) + programDays.length) % programDays.length;
  const shouldUseMapping = Array.isArray(dayMapping) && dayMapping.length === programDays.length;
  const mappedIndex = shouldUseMapping ? dayMapping[cycleIndex] : cycleIndex;

  return programDays.find((day) => day.cycleDay === mappedIndex + 1)
    || programDays[mappedIndex]
    || programDays[cycleIndex];
};

const getProgramInclude = () => ({
  days: {
    orderBy: { cycleDay: "asc" },
    include: {
      templates: {
        include: {
          exercises: {
            orderBy: { exerciseOrder: "asc" },
            include: {
              exercise: {
                include: {
                  muscles: {
                    include: {
                      muscleGroup: true,
                    },
                  },
                  tags: true,
                },
              },
            },
          },
        },
      },
    },
  },
});

const getExerciseLibrary = () => {
  return prisma.exercise.findMany({
    where: { isPublished: true },
    include: {
      muscles: {
        include: {
          muscleGroup: true,
        },
      },
      tags: true,
    },
  });
};

const buildProgramPlanDays = ({ program, startDate, count, startOffset = 0, dayMapping, libraryExercises }) => {
  return buildPlanDays(
    count,
    startDate,
    (index) => {
      const offset = startOffset + index;
      const programDay = getProgramDayForOffset(program.days, offset, dayMapping);
      return programDay ? `Ngày ${offset + 1}: ${programDay.title}` : `Ngày ${offset + 1}`;
    },
    (index) => {
      const programDay = getProgramDayForOffset(program.days, startOffset + index, dayMapping);
      return programDay?.templates?.length ? "pending" : "rest";
    },
    (index) => {
      const offset = startOffset + index;
      const programDay = getProgramDayForOffset(program.days, offset, dayMapping);
      const customExercises = buildRandomExercisesForProgramDay(programDay, libraryExercises);

      return {
        customExercises,
        generatedFrom: "workout-program-randomizer",
        focusArea: programDay?.focusArea || null,
        muscleMapUrl: programDay?.muscleMapUrl || null,
        programDayId: programDay?.id || null,
        cycleDay: programDay?.cycleDay || null,
        cycleOffset: offset,
      };
    }
  );
};

const buildCustomPlanDays = ({ startDate, count, startOffset = 0 }) => {
  return buildPlanDays(
    count,
    startDate,
    (index) => `Ngày ${startOffset + index + 1} - Tự chọn`,
    () => "pending",
    (index) => ({
      customExercises: [],
      generatedFrom: "custom-plan",
      cycleOffset: startOffset + index,
    })
  );
};

const appendUpcomingDaysIfNeeded = async (plan) => {
  const today = getDateOnly(new Date());
  const upcomingDays = plan.days.filter((day) => getDateOnly(day.scheduledDate) >= today);

  if (upcomingDays.length >= PLAN_GENERATION_THRESHOLD_DAYS) {
    return plan;
  }

  const lastDay = plan.days[plan.days.length - 1];
  const nextStartDate = lastDay ? addDays(lastDay.scheduledDate, 1) : getDateOnly(plan.startDate);
  const startOffset = diffDays(plan.startDate, nextStartDate);
  let daysToCreate = [];

  if (plan.programId) {
    const program = await prisma.workoutProgram.findUnique({
      where: { id: plan.programId },
      include: getProgramInclude(),
    });

    if (!program?.days?.length) return plan;

    const libraryExercises = await getExerciseLibrary();
    daysToCreate = buildProgramPlanDays({
      program,
      startDate: nextStartDate,
      count: PLAN_GENERATION_WINDOW_DAYS,
      startOffset,
      dayMapping: plan.metadata?.dayMapping,
      libraryExercises,
    });
  } else {
    daysToCreate = buildCustomPlanDays({
      startDate: nextStartDate,
      count: PLAN_GENERATION_WINDOW_DAYS,
      startOffset,
    });
  }

  if (!daysToCreate.length) return plan;

  await prisma.userTrainingPlanDay.createMany({
    data: daysToCreate.map((day) => ({
      ...day,
      userTrainingPlanId: plan.id,
    })),
  });

  return prisma.userTrainingPlan.findUnique({
    where: { id: plan.id },
    include: {
      days: {
        orderBy: { scheduledDate: "asc" },
      },
    },
  });
};

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

  return appendUpcomingDaysIfNeeded(plan);
};

const startProgramPlan = async (userId, programId, startDateInput, dayMappingInput) => {
  const program = await prisma.workoutProgram.findUnique({
    where: { id: programId },
    include: getProgramInclude(),
  });

  if (!program || !program.isPublished) {
    throw new AppError("Không tìm thấy giáo án để bắt đầu lộ trình.", httpCodes.notFound);
  }

  const dayMapping = Array.isArray(dayMappingInput) && dayMappingInput.length === program.days.length
    ? dayMappingInput
    : null;
  const libraryExercises = await getExerciseLibrary();
  const startDate = startDateInput ? new Date(startDateInput) : new Date();
  const days = buildProgramPlanDays({
    program,
    startDate,
    count: PLAN_GENERATION_WINDOW_DAYS,
    dayMapping,
    libraryExercises,
  });

  return prisma.$transaction(async (tx) => {
    await tx.userTrainingPlan.deleteMany({
      where: { userId }
    });

    return tx.userTrainingPlan.create({
      data: {
        userId,
        programId,
        title: program.title,
        startDate,
        status: "active",
        metadata: {
          source: "workout-program",
          goal: program.goal,
          difficulty: program.difficulty,
          dayMapping,
          cycleLength: program.days.length,
          generatedWindowDays: PLAN_GENERATION_WINDOW_DAYS,
        },
        days: {
          create: days
        }
      },
      include: {
        days: {
          orderBy: { scheduledDate: "asc" }
        }
      }
    });
  });
};

const startCustomPlan = async (userId, payload = {}) => {
  const startDate = payload.startDate ? new Date(payload.startDate) : new Date();
  const days = buildCustomPlanDays({
    startDate,
    count: PLAN_GENERATION_WINDOW_DAYS,
  });

  return prisma.$transaction(async (tx) => {
    await tx.userTrainingPlan.deleteMany({
      where: { userId }
    });

    return tx.userTrainingPlan.create({
      data: {
        userId,
        title: payload.title || "Lộ trình tự chọn",
        startDate,
        status: "active",
        aiGenerated: false,
        metadata: {
          source: "custom",
          generatedWindowDays: PLAN_GENERATION_WINDOW_DAYS,
          guidance: "Chọn bài theo nhóm cơ chính, ưu tiên 3-6 bài mỗi buổi, bắt đầu với mức dễ nếu chưa chắc kỹ thuật."
        },
        days: {
          create: days
        }
      },
      include: {
        days: {
          orderBy: { scheduledDate: "asc" }
        }
      }
    });
  });
};

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
 * Lấy chi tiết thông tin và bài tập của một ngày tập
 */
const getDayDetails = async (userId, dayId) => {
  // 1. Lấy thông tin ngày tập
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

  // 2. Tìm buổi trong chu kỳ giáo án tương ứng với ngày tập
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

  // 4. Lấy danh sách bài tập (sử dụng customExercises từ metadata nếu có)
  let exercises = [];
  const customExercises = Array.isArray(day.metadata?.customExercises)
    ? day.metadata.customExercises
    : [];

  if (customExercises.length > 0) {
    const customExs = customExercises;
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

  // Chuẩn bị dữ liệu cập nhật
  const data = {};
  if (updateData.status !== undefined) data.status = updateData.status;
  if (updateData.notes !== undefined) data.notes = updateData.notes;
  if (updateData.skipReason !== undefined) data.skipReason = updateData.skipReason;
  if (updateData.metadata !== undefined) {
    // Merge metadata cũ với metadata mới để tránh mất thông tin khác
    data.metadata = {
      ...(day.metadata || {}),
      ...updateData.metadata
    };
  }

  const updatedDay = await prisma.userTrainingPlanDay.update({
    where: { id: dayId },
    data
  });

  return updatedDay;
};

/**
 * Hoàn tất ngày tập, tính toán calo tiêu hao, cộng dồn thống kê cá nhân và dọn dẹp lịch sử > 30 ngày
 */
const completeDay = async (userId, dayId, notes) => {
  // 1. Kiểm tra ngày tập hiện tại
  const currentDay = await prisma.userTrainingPlanDay.findUnique({
    where: { id: dayId }
  });

  if (!currentDay) {
    throw new AppError("Không tìm thấy ngày tập.", httpCodes.notFound);
  }

  // Nếu đã hoàn thành từ trước, chỉ cập nhật ghi chú
  if (currentDay.status === "completed") {
    const updatedDay = await prisma.userTrainingPlanDay.update({
      where: { id: dayId },
      data: {
        notes: notes || null
      }
    });
    return { day: updatedDay, caloriesBurned: 0 };
  }

  // 2. Lấy chi tiết ngày tập và bài tập thực tế để ước tính thời gian/calo
  const dayDetails = await getDayDetails(userId, dayId);
  const exercises = dayDetails.exercises || [];

  // Lấy cân nặng từ profile của user
  const profile = await prisma.userProfile.findUnique({
    where: { userId }
  });
  const weightKg = profile?.weightKg || 70;

  // Công thức ước tính thời gian: 2.5 phút cho mỗi set tạ (bao gồm chuẩn bị, tập, nghỉ)
  const totalSets = exercises.reduce((acc, ex) => acc + (ex.sets || 3), 0);
  const durationMinutes = Math.max(totalSets * 2.5, 30); // Tối thiểu 30 phút

  // Tính calo tiêu thụ bằng MET (Tập tạ mạnh MET = 6.0)
  // Calories = MET * 3.5 * weightKg / 200 * durationMinutes
  const caloriesBurned = Math.round(6.0 * 3.5 * weightKg / 200 * durationMinutes);

  // 3. Cập nhật trạng thái ngày tập
  const updatedDay = await prisma.userTrainingPlanDay.update({
    where: { id: dayId },
    data: {
      status: "completed",
      notes: notes || null
    }
  });

  // 4. Cộng dồn số ngày tập và calo tiêu thụ vào UserProfile
  await prisma.userProfile.update({
    where: { userId },
    data: {
      totalWorkoutDays: { increment: 1 },
      totalCaloriesBurned: { increment: caloriesBurned }
    }
  });

  // 5. Xóa tự động các ngày tập (completed, skipped, rest) cách đây quá 30 ngày
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  await prisma.userTrainingPlanDay.deleteMany({
    where: {
      plan: { userId },
      scheduledDate: { lt: cutoffDate },
      status: { in: ["completed", "skipped", "rest"] }
    }
  });

  return {
    day: updatedDay,
    caloriesBurned
  };
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

module.exports = {
  getActivePlan,
  startProgramPlan,
  startCustomPlan,
  cancelActivePlan,
  getDayDetails,
  updateDayDetails,
  completeDay,
  getStats
};
