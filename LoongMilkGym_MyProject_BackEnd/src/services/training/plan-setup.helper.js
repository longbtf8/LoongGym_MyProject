const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");

const PLAN_GENERATION_WINDOW_DAYS = 30;
const PLAN_GENERATION_THRESHOLD_DAYS = 7;
const STANDARD_EXERCISES_PER_SESSION = 5;

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
      "nguc", "chest", "lung", "back", "vai", "shoulder", "tay", "arms", "chan", "leg", "dui", "core", "abs", "bung",
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
  const sortedTemplateExercises = [...templateExercises].sort(
    (a, b) => (a.exerciseOrder || 0) - (b.exerciseOrder || 0)
  );
  const desiredCount = STANDARD_EXERCISES_PER_SESSION;

  const picked = sortedTemplateExercises.slice(0, desiredCount).map(mapTemplateExerciseToCustom);
  const pickedIds = new Set(picked.map((exercise) => exercise.exerciseId));

  if (picked.length < desiredCount) {
    const relatedLibraryExercises = shuffle(
      libraryExercises.filter((exercise) => {
        return !pickedIds.has(exercise.id) && exerciseMatchesFocus(exercise, focusKeywords);
      })
    );

    relatedLibraryExercises.slice(0, desiredCount - picked.length).forEach((exercise) => {
      const referenceExercise = sortedTemplateExercises.find((item) => item.sets || item.repsMin || item.repsMax);
      picked.push(mapLibraryExerciseToCustom(exercise, referenceExercise));
      pickedIds.add(exercise.id);
    });
  }

  return picked.map((exercise, index) => ({
    ...exercise,
    exerciseOrder: index + 1,
  }));
};

const getDateParts = (dateInput) => {
  if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split("-").map(Number);
    return { year, month, day };
  }

  const date = new Date(dateInput);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

const getUtcDateOnlyFromParts = ({ year, month, day }) => {
  return new Date(Date.UTC(year, month - 1, day));
};

const getDateOnly = (dateInput) => {
  return getUtcDateOnlyFromParts(getDateParts(dateInput));
};

const getDateKey = (dateInput) => {
  const date = new Date(dateInput);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getWeekStartMonday = (dateInput) => {
  const { year, month, day: monthDay } = getDateParts(dateInput);
  const date = new Date(year, month - 1, monthDay);
  const weekday = date.getDay();
  const diffToMonday = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + diffToMonday);
  return getUtcDateOnlyFromParts({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
};

const addDays = (dateInput, days) => {
  const date = getDateOnly(dateInput);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const diffDays = (startInput, endInput) => {
  const start = getDateOnly(startInput);
  const end = getDateOnly(endInput);
  return Math.round((end - start) / 86400000);
};

const getProgramDayByMappingValue = (programDays, mappingValue) => {
  if (typeof mappingValue === "string") {
    return programDays.find((day) => day.id === mappingValue) || null;
  }

  return programDays[mappingValue]
    || programDays.find((day) => day.cycleDay === mappingValue + 1)
    || null;
};

const getEffectiveProgramDayMapping = (programDays = [], dayMappingInput) => {
  if (!programDays.length) return [];

  const defaultMapping = programDays.map((day, index) => day.id || index);
  const programDayIds = new Set(programDays.map((day) => day.id).filter(Boolean));

  const isValidIdMapping = Array.isArray(dayMappingInput)
    && dayMappingInput.length === programDays.length
    && dayMappingInput.every((item) => typeof item === "string" && programDayIds.has(item))
    && new Set(dayMappingInput).size === programDays.length;

  if (isValidIdMapping) return [...dayMappingInput];

  const isValidIndexMapping = Array.isArray(dayMappingInput)
    && dayMappingInput.length === programDays.length
    && dayMappingInput.every((item) => Number.isInteger(item) && item >= 0 && item < programDays.length)
    && new Set(dayMappingInput).size === programDays.length;

  if (isValidIndexMapping) {
    return dayMappingInput.map((item) => programDays[item]?.id || item);
  }

  return defaultMapping;
};

const getProgramDayForOffset = (programDays, offset, dayMapping) => {
  if (!programDays.length) return null;

  const cycleIndex = ((offset % programDays.length) + programDays.length) % programDays.length;
  const effectiveMapping = getEffectiveProgramDayMapping(programDays, dayMapping);
  const mappingValue = effectiveMapping[cycleIndex] ?? cycleIndex;

  return getProgramDayByMappingValue(programDays, mappingValue)
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
      return programDay?.title || "Buổi tập";
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
        originalExercises: customExercises.map(ex => ({ ...ex })),
        generatedFrom: "workout-program-template",
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

const buildAiCoachPlanDays = ({ startDate, count, startOffset = 0, weekTemplate = [] }) => {
  const template = Array.isArray(weekTemplate) && weekTemplate.length
    ? weekTemplate.slice(0, 7)
    : [];

  if (!template.length) return [];

  return buildPlanDays(
    count,
    startDate,
    (index) => {
      const offset = startOffset + index;
      const dayTemplate = template[offset % template.length];
      return dayTemplate?.title || `Ngày ${offset + 1} - AI Coach`;
    },
    (index) => {
      const offset = startOffset + index;
      const dayTemplate = template[offset % template.length];
      return dayTemplate?.status || "pending";
    },
    (index) => {
      const offset = startOffset + index;
      const templateIndex = offset % template.length;
      const dayTemplate = template[templateIndex];
      const customExercises = Array.isArray(dayTemplate?.customExercises)
        ? dayTemplate.customExercises.map((exercise, exerciseIndex) => ({
            ...exercise,
            id: `${exercise.exerciseId}-${offset + 1}-${exerciseIndex + 1}`,
            exerciseOrder: exerciseIndex + 1,
          }))
        : [];

      return {
        customExercises,
        customized: true,
        generatedFrom: "ai-coach-week-template",
        focusArea: dayTemplate?.focusArea || null,
        cycleDay: templateIndex + 1,
        cycleOffset: offset,
      };
    }
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
  const startOffset = Number.isInteger(lastDay?.metadata?.cycleOffset)
    ? lastDay.metadata.cycleOffset + 1
    : diffDays(plan.startDate, nextStartDate);
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
  } else if (plan.aiGenerated && Array.isArray(plan.metadata?.weekTemplate) && plan.metadata.weekTemplate.length) {
    daysToCreate = buildAiCoachPlanDays({
      startDate: nextStartDate,
      count: PLAN_GENERATION_WINDOW_DAYS,
      startOffset,
      weekTemplate: plan.metadata.weekTemplate,
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

const startProgramPlan = async (userId, programId, startDateInput, dayMappingInput) => {
  const program = await prisma.workoutProgram.findUnique({
    where: { id: programId },
    include: getProgramInclude(),
  });

  if (!program || !program.isPublished) {
    throw new AppError("Không tìm thấy giáo án để bắt đầu lộ trình.", httpCodes.notFound);
  }

  const dayMapping = getEffectiveProgramDayMapping(program.days, dayMappingInput);
  const libraryExercises = await getExerciseLibrary();
  const requestedStartDate = getDateOnly(startDateInput || new Date());
  const startDate = getWeekStartMonday(requestedStartDate);
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
          requestedStartDate: getDateKey(requestedStartDate),
          weekStartsOn: "monday",
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

module.exports = {
  appendUpcomingDaysIfNeeded,
  startProgramPlan,
  startCustomPlan,
  getDateOnly,
  getWeekStartMonday,
  diffDays,
  getEffectiveProgramDayMapping,
  getProgramDayForOffset,
};
