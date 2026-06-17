const { prisma } = require("@/lib/prisma");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");

// Helper to normalize dates to midnight UTC to prevent timezone shifts
const normalizeDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

/**
 * Calculates recovery score based on sleep, soreness, energy, and stress
 */
const calculateRecoveryScore = (sleepHours, sorenessLevel, energyLevel, stressLevel) => {
  // 1. Sleep hours score (35% weight)
  let sleepScore = 0;
  if (sleepHours >= 7.5 && sleepHours <= 9.0) {
    sleepScore = 100;
  } else if (sleepHours >= 6.0 && sleepHours < 7.5) {
    sleepScore = 70 + ((sleepHours - 6.0) / (7.5 - 6.0)) * (100 - 70);
  } else if (sleepHours >= 4.0 && sleepHours < 6.0) {
    sleepScore = 30 + ((sleepHours - 4.0) / (6.0 - 4.0)) * (70 - 30);
  } else if (sleepHours < 4.0) {
    sleepScore = 10 + (Math.max(0, sleepHours) / 4.0) * (30 - 10);
  } else if (sleepHours > 9.0 && sleepHours <= 10.5) {
    sleepScore = 100 - ((sleepHours - 9.0) / (10.5 - 9.0)) * (100 - 85);
  } else {
    // sleepHours > 10.5
    sleepScore = Math.max(50, 85 - ((Math.min(24, sleepHours) - 10.5) / (24.0 - 10.5)) * (85 - 50));
  }

  // 2. Soreness score (25% weight)
  const sorenessLevelInt = Math.max(1, Math.min(10, Math.round(sorenessLevel)));
  const sorenessMapping = {
    1: 100,
    2: 95,
    3: 90,
    4: 80,
    5: 70,
    6: 55,
    7: 45,
    8: 30,
    9: 20,
    10: 5,
  };
  const sorenessScore = sorenessMapping[sorenessLevelInt] || 70;

  // 3. Energy score (20% weight)
  const energyLevelInt = Math.max(1, Math.min(10, Math.round(energyLevel)));
  const energyMapping = {
    10: 100,
    9: 95,
    8: 85,
    7: 70,
    6: 60,
    5: 45,
    4: 35,
    3: 20,
    2: 10,
    1: 5,
  };
  const energyScore = energyMapping[energyLevelInt] || 60;

  // 4. Stress score (20% weight)
  const stressLevelInt = Math.max(1, Math.min(10, Math.round(stressLevel)));
  const stressMapping = {
    1: 100,
    2: 95,
    3: 85,
    4: 70,
    5: 60,
    6: 45,
    7: 35,
    8: 20,
    9: 10,
    10: 5,
  };
  const stressScore = stressMapping[stressLevelInt] || 60;

  const totalScore = sleepScore * 0.35 + sorenessScore * 0.25 + energyScore * 0.20 + stressScore * 0.20;
  return Math.round(totalScore);
};

const getTodayOverview = async (userId, dateStr) => {
  const targetDateStr = dateStr || new Date().toISOString().split("T")[0];
  const targetDate = normalizeDate(targetDateStr);

  // 1. Fetch today's recovery log
  const todayRecovery = await prisma.recoveryLog.findUnique({
    where: {
      userId_logDate: {
        userId,
        logDate: targetDate,
      },
    },
  });

  // 2. Fetch active injuries
  const activeInjuries = await prisma.injuryLog.findMany({
    where: {
      userId,
      status: "active",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 3. Fetch latest body metrics
  const latestMetrics = await prisma.bodyMetric.findFirst({
    where: {
      userId,
    },
    orderBy: {
      measuredAt: "desc",
    },
  });

  // 4. Fetch latest progress photos
  const latestPhotos = await prisma.progressPhoto.findMany({
    where: {
      userId,
    },
    orderBy: {
      takenAt: "desc",
    },
    take: 6,
  });

  return {
    targetDate: targetDateStr,
    recovery: todayRecovery || null,
    activeInjuries,
    latestMetrics: latestMetrics || null,
    latestPhotos,
  };
};

const logRecovery = async (userId, data) => {
  const logDate = normalizeDate(data.logDate);
  const recoveryScore = calculateRecoveryScore(
    data.sleepHours,
    data.sorenessLevel,
    data.energyLevel,
    data.stressLevel
  );

  return prisma.recoveryLog.upsert({
    where: {
      userId_logDate: {
        userId,
        logDate,
      },
    },
    update: {
      recoveryScore,
      sleepHours: data.sleepHours,
      sorenessLevel: data.sorenessLevel,
      stressLevel: data.stressLevel,
      energyLevel: data.energyLevel,
      hrvMs: data.hrvMs ?? null,
      restingHeartRate: data.restingHeartRate ?? null,
      notes: data.notes ?? null,
    },
    create: {
      userId,
      logDate,
      recoveryScore,
      sleepHours: data.sleepHours,
      sorenessLevel: data.sorenessLevel,
      stressLevel: data.stressLevel,
      energyLevel: data.energyLevel,
      hrvMs: data.hrvMs ?? null,
      restingHeartRate: data.restingHeartRate ?? null,
      notes: data.notes ?? null,
    },
  });
};

const logInjury = async (userId, data) => {
  const startedAt = normalizeDate(data.startedAt);
  const resolvedAt = data.resolvedAt ? normalizeDate(data.resolvedAt) : null;

  return prisma.injuryLog.create({
    data: {
      userId,
      bodyPart: data.bodyPart,
      severity: data.severity || "mild",
      painLevel: data.painLevel,
      description: data.description ?? null,
      startedAt,
      resolvedAt,
      status: data.status || "active",
    },
  });
};

const updateInjury = async (userId, id, data) => {
  const injury = await prisma.injuryLog.findUnique({
    where: { id },
  });

  if (!injury) {
    throw new AppError("Không tìm thấy chấn thương.", httpCodes.notFound);
  }

  if (injury.userId !== userId) {
    throw new AppError("Bạn không có quyền chỉnh sửa chấn thương này.", httpCodes.forbidden);
  }

  const updateFields = { ...data };
  if (data.startedAt) {
    updateFields.startedAt = normalizeDate(data.startedAt);
  }
  if (data.resolvedAt) {
    updateFields.resolvedAt = normalizeDate(data.resolvedAt);
  }

  return prisma.injuryLog.update({
    where: { id },
    data: updateFields,
  });
};

const logBodyMetric = async (userId, data) => {
  return prisma.bodyMetric.create({
    data: {
      userId,
      weightKg: data.weightKg ?? null,
      bodyFatPercent: data.bodyFatPercent ?? null,
      muscleMassKg: data.muscleMassKg ?? null,
      waistCm: data.waistCm ?? null,
      chestCm: data.chestCm ?? null,
      armCm: data.armCm ?? null,
      thighCm: data.thighCm ?? null,
      notes: data.notes ?? null,
    },
  });
};

const uploadProgressPhoto = async (userId, data) => {
  const takenAt = normalizeDate(data.takenAt);

  return prisma.progressPhoto.create({
    data: {
      userId,
      photoUrl: data.photoUrl,
      photoType: data.photoType,
      takenAt,
      visibility: data.visibility || "private",
    },
  });
};

const deleteProgressPhoto = async (userId, photoId) => {
  const photo = await prisma.progressPhoto.findUnique({
    where: { id: photoId },
  });

  if (!photo) {
    throw new AppError("Không tìm thấy ảnh tiến trình.", httpCodes.notFound);
  }

  if (photo.userId !== userId) {
    throw new AppError("Bạn không có quyền xóa ảnh này.", httpCodes.forbidden);
  }

  // Delete from Cloudinary if it is a Cloudinary URL
  const { deleteOldImage } = require("@/utils/cloudinary");
  await deleteOldImage(photo.photoUrl);

  // Delete from database
  return prisma.progressPhoto.delete({
    where: { id: photoId },
  });
};

module.exports = {
  getTodayOverview,
  logRecovery,
  logInjury,
  updateInjury,
  logBodyMetric,
  uploadProgressPhoto,
  deleteProgressPhoto,
  calculateRecoveryScore,
};
