require("dotenv/config");
const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("../generated/prisma");
const cloudinary = require("cloudinary").v2;

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IMAGE_DIR = path.join(__dirname, "image");

const muscleMapUrls = {
  push: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739559/LoongMilkGym_APP/muscle_maps/push.jpg",
  pull: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739562/LoongMilkGym_APP/muscle_maps/pull.jpg",
  legs: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739565/LoongMilkGym_APP/muscle_maps/legs.jpg",
  core: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780739568/LoongMilkGym_APP/muscle_maps/core.jpg",
  arms: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024019/LoongMilkGym_APP/muscle_maps/arms.jpg",
  shoulders: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024668/LoongMilkGym_APP/muscle_maps/shoulders.jpg",
  fullbody: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024672/LoongMilkGym_APP/muscle_maps/fullbody.jpg",
  chest: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024676/LoongMilkGym_APP/muscle_maps/chest.jpg",
  back: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1781024679/LoongMilkGym_APP/muscle_maps/back.jpg",
};

const muscleGroups = [
  { name: "Ngực", slug: "nguc" },
  { name: "Lưng", slug: "lung" },
  { name: "Vai", slug: "vai" },
  { name: "Tay trước", slug: "tay-truoc" },
  { name: "Tay sau", slug: "tay-sau" },
  { name: "Đùi trước", slug: "dui-truoc" },
  { name: "Đùi sau", slug: "dui-sau" },
  { name: "Mông", slug: "mong" },
  { name: "Bắp chân", slug: "bap-chan" },
  { name: "Core", slug: "core" },
  { name: "Toàn thân", slug: "toan-than" },
];

const equipmentList = [
  { name: "Barbell", slug: "barbell" },
  { name: "Dumbbell", slug: "dumbbell" },
  { name: "Cable", slug: "cable" },
  { name: "EZ Bar", slug: "ez-bar" },
  { name: "Bodyweight", slug: "bodyweight" },
];

const armExercises = [
  {
    name: "Barbell Bicep Curl",
    slug: "barbell-bicep-curl",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=54x2WF1_Suc",
    description: "Xây dựng kích thước tổng thể cho tay trước bằng tạ đòn.",
    equipmentSlug: "barbell",
    muscles: [{ slug: "tay-truoc", role: "primary" }],
    tags: ["arms", "biceps", "strength"],
  },
  {
    name: "Hammer Curl",
    slug: "hammer-curl",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=BRVDS6HVR9Q",
    description: "Tập trung vào cơ brachialis giúp tay trông dày hơn.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "tay-truoc", role: "primary" }],
    tags: ["arms", "biceps", "brachialis", "strength"],
  },
  {
    name: "Incline Dumbbell Curl",
    slug: "incline-dumbbell-curl",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600",
    videoUrl: "https://www.youtube.com/watch?v=uCUaRFlA9vE",
    description: "Kéo căng cơ tay trước tối đa ở tư thế nằm nghiêng.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "tay-truoc", role: "primary" }],
    tags: ["arms", "biceps", "strength"],
  },
  {
    name: "Tricep Rope Pushdown",
    slug: "tricep-rope-pushdown",
    difficulty: "beginner",
    exerciseType: "strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=vB5OHsJ3EME",
    description: "Bài tập cáp an toàn và hiệu quả cho tay sau.",
    equipmentSlug: "cable",
    muscles: [{ slug: "tay-sau", role: "primary" }],
    tags: ["arms", "triceps", "strength"],
  },
  {
    name: "Skull Crushers",
    slug: "skull-crushers",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=S0fmDR60X-o",
    description: "Phát triển sức mạnh và độ dày tay sau.",
    equipmentSlug: "ez-bar",
    muscles: [{ slug: "tay-sau", role: "primary" }],
    tags: ["arms", "triceps", "strength"],
  },
  {
    name: "Overhead Dumbbell Extension",
    slug: "overhead-dumbbell-extension",
    difficulty: "intermediate",
    exerciseType: "strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=600&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q",
    description: "Cô lập đầu dài của cơ tay sau qua chuyển động qua đầu.",
    equipmentSlug: "dumbbell",
    muscles: [{ slug: "tay-sau", role: "primary" }],
    tags: ["arms", "triceps", "strength"],
  },
];

const ex = (slug, order, sets, repsMin, repsMax, weight, rest, note = "") => ({
  slug,
  order,
  sets,
  repsMin,
  repsMax,
  weight,
  rest,
  note,
});

const pushExercises = [
  ex("bench-press", 1, 4, 8, 12, 60, 90, "Hạ tạ có kiểm soát, giữ vai ổn định."),
  ex("incline-dumbbell-press", 2, 3, 10, 12, 16, 75, "Giữ góc ghế vừa phải để tập trung ngực trên."),
  ex("dumbbell-flyes", 3, 3, 12, 15, 10, 60, "Mở biên độ vừa đủ, không khoá khuỷu tay."),
  ex("shoulder-press", 4, 3, 10, 12, 14, 75, "Giữ core chắc và đẩy thẳng qua đầu."),
  ex("lateral-raise", 5, 3, 12, 15, 6, 60, "Nâng bằng vai, tránh dùng đà."),
  ex("tricep-rope-pushdown", 6, 3, 12, 15, 15, 60, "Ép tay sau ở cuối biên độ."),
];

const pullExercises = [
  ex("deadlift", 1, 4, 6, 8, 80, 120, "Giữ lưng trung lập trong toàn bộ chuyển động."),
  ex("lat-pulldown", 2, 3, 10, 12, 40, 75, "Kéo khuỷu tay xuống, cảm nhận cơ xô."),
  ex("dumbbell-row", 3, 3, 10, 12, 18, 75, "Ép bả vai khi kéo tạ lên."),
  ex("seated-cable-row", 4, 3, 12, 15, 35, 60, "Giữ thân người thẳng và kéo có kiểm soát."),
  ex("barbell-bicep-curl", 5, 3, 10, 12, 15, 60, "Không vung lưng, giữ khuỷu tay ổn định."),
  ex("hammer-curl", 6, 3, 10, 12, 12, 60, "Giữ cổ tay trung lập trong từng rep."),
];

const legsExercises = [
  ex("barbell-squat", 1, 4, 8, 12, 60, 120, "Xuống có kiểm soát, đẩy lên bằng cả bàn chân."),
  ex("leg-press", 2, 3, 10, 12, 100, 90, "Không khoá gối ở đỉnh chuyển động."),
  ex("romanian-deadlift", 3, 3, 10, 12, 50, 75, "Đẩy hông ra sau để kéo căng đùi sau."),
  ex("walking-lunges", 4, 3, 12, 15, 0, 60, "Bước chắc, giữ thân người ổn định."),
  ex("calf-raise", 5, 4, 15, 20, 0, 45, "Giữ đỉnh chuyển động một nhịp ngắn."),
];

const upperExercises = [
  ex("bench-press", 1, 4, 8, 12, 60, 90),
  ex("lat-pulldown", 2, 3, 10, 12, 40, 75),
  ex("shoulder-press", 3, 3, 10, 12, 14, 75),
  ex("dumbbell-row", 4, 3, 10, 12, 18, 75),
  ex("barbell-bicep-curl", 5, 3, 10, 12, 15, 60),
  ex("tricep-rope-pushdown", 6, 3, 12, 15, 15, 60),
];

const lowerExercises = [
  ex("barbell-squat", 1, 4, 8, 12, 60, 120),
  ex("romanian-deadlift", 2, 3, 10, 12, 50, 75),
  ex("leg-press", 3, 3, 10, 12, 100, 90),
  ex("calf-raise", 4, 4, 15, 20, 0, 45),
  ex("plank", 5, 3, 45, 60, 0, 45),
];

const fullBodyExercises = [
  ex("barbell-squat", 1, 4, 8, 12, 60, 120),
  ex("bench-press", 2, 4, 8, 12, 60, 90),
  ex("lat-pulldown", 3, 3, 10, 12, 40, 75),
  ex("shoulder-press", 4, 3, 10, 12, 14, 75),
  ex("plank", 5, 3, 45, 60, 0, 45),
  ex("mountain-climber", 6, 3, 30, 30, 0, 45),
];

const chestExercises = [
  ex("bench-press", 1, 4, 8, 12, 60, 90),
  ex("incline-dumbbell-press", 2, 3, 10, 12, 16, 75),
  ex("dumbbell-flyes", 3, 3, 12, 15, 10, 60),
  ex("tricep-rope-pushdown", 4, 3, 12, 15, 15, 60),
];

const backExercises = [
  ex("deadlift", 1, 4, 6, 8, 80, 120),
  ex("lat-pulldown", 2, 3, 10, 12, 40, 75),
  ex("dumbbell-row", 3, 3, 10, 12, 18, 75),
  ex("seated-cable-row", 4, 3, 12, 15, 35, 60),
  ex("hammer-curl", 5, 3, 10, 12, 12, 60),
];

const shoulderExercises = [
  ex("shoulder-press", 1, 4, 10, 12, 14, 75),
  ex("lateral-raise", 2, 4, 12, 15, 6, 60),
  ex("overhead-dumbbell-extension", 3, 3, 10, 12, 12, 60),
];

const armsExercises = [
  ex("barbell-bicep-curl", 1, 4, 10, 12, 15, 60),
  ex("hammer-curl", 2, 3, 10, 12, 12, 60),
  ex("incline-dumbbell-curl", 3, 3, 10, 12, 10, 60),
  ex("tricep-rope-pushdown", 4, 4, 12, 15, 15, 60),
  ex("skull-crushers", 5, 3, 10, 12, 15, 75),
  ex("overhead-dumbbell-extension", 6, 3, 10, 12, 12, 60),
];

const programsConfig = [
  {
    title: "Đẩy - Kéo - Chân (PPL)",
    slug: "push-pull-legs-ppl-split",
    description: "Lộ trình PPL xoay vòng để phát triển sức mạnh và cơ bắp toàn thân.",
    goal: "muscle_gain",
    difficulty: "intermediate",
    coverImageUrl: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780849517/LoongMilkGym_APP/program_covers/ppl.jpg",
    days: [
      { cycleDay: 1, title: "Đẩy", focusArea: "Ngực, Vai, Tay sau", muscleMapUrl: muscleMapUrls.push, exercises: pushExercises },
      { cycleDay: 2, title: "Kéo", focusArea: "Lưng, Tay trước", muscleMapUrl: muscleMapUrls.pull, exercises: pullExercises },
      { cycleDay: 3, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 4, title: "Chân", focusArea: "Đùi trước, Đùi sau, Mông, Bắp chân", muscleMapUrl: muscleMapUrls.legs, exercises: legsExercises },
      { cycleDay: 5, title: "Đẩy", focusArea: "Ngực, Vai, Tay sau", muscleMapUrl: muscleMapUrls.push, exercises: pushExercises },
      { cycleDay: 6, title: "Kéo và Core", focusArea: "Lưng, Tay trước, Core", muscleMapUrl: muscleMapUrls.pull, exercises: [...pullExercises, ex("plank", 7, 3, 45, 60, 0, 45)] },
      { cycleDay: 7, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
    ],
  },
  {
    title: "Thân trên - Thân dưới",
    slug: "upper-lower-body-split",
    description: "Lộ trình xen kẽ thân trên và thân dưới, phù hợp để tăng cơ nạc ổn định.",
    goal: "hypertrophy",
    difficulty: "intermediate",
    coverImageUrl: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780849519/LoongMilkGym_APP/program_covers/upperLower.jpg",
    days: [
      { cycleDay: 1, title: "Thân trên", focusArea: "Ngực, Lưng, Vai, Tay", muscleMapUrl: muscleMapUrls.push, exercises: upperExercises },
      { cycleDay: 2, title: "Thân dưới", focusArea: "Đùi trước, Đùi sau, Mông, Bắp chân, Core", muscleMapUrl: muscleMapUrls.legs, exercises: lowerExercises },
      { cycleDay: 3, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 4, title: "Thân trên", focusArea: "Ngực, Lưng, Vai, Tay", muscleMapUrl: muscleMapUrls.pull, exercises: upperExercises },
      { cycleDay: 5, title: "Thân dưới", focusArea: "Đùi trước, Đùi sau, Mông, Bắp chân, Core", muscleMapUrl: muscleMapUrls.legs, exercises: lowerExercises },
      { cycleDay: 6, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 7, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
    ],
  },
  {
    title: "Tập toàn thân",
    slug: "fullbody-3x-week",
    description: "Lộ trình tập toàn diện cơ thể, phù hợp với người bận rộn hoặc mới quay lại tập.",
    goal: "fitness",
    difficulty: "beginner",
    coverImageUrl: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780849521/LoongMilkGym_APP/program_covers/fullBody.jpg",
    days: [
      { cycleDay: 1, title: "Toàn thân", focusArea: "Ngực, Lưng, Đùi trước, Vai, Core", muscleMapUrl: muscleMapUrls.fullbody, exercises: fullBodyExercises },
      { cycleDay: 2, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 3, title: "Toàn thân", focusArea: "Ngực, Lưng, Đùi trước, Vai, Core", muscleMapUrl: muscleMapUrls.fullbody, exercises: fullBodyExercises },
      { cycleDay: 4, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 5, title: "Toàn thân", focusArea: "Ngực, Lưng, Đùi trước, Vai, Core", muscleMapUrl: muscleMapUrls.fullbody, exercises: fullBodyExercises },
      { cycleDay: 6, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 7, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
    ],
  },
  {
    title: "Chia nhóm cơ đơn lẻ",
    slug: "classic-bro-split-5day",
    description: "Lộ trình tập trung từng nhóm cơ lớn với khối lượng tập cao.",
    goal: "muscle_gain",
    difficulty: "advanced",
    coverImageUrl: "https://res.cloudinary.com/dvlp6zqdo/image/upload/v1780849524/LoongMilkGym_APP/program_covers/broSplit.jpg",
    days: [
      { cycleDay: 1, title: "Ngực", focusArea: "Ngực, Tay sau", muscleMapUrl: muscleMapUrls.chest, exercises: chestExercises },
      { cycleDay: 2, title: "Lưng", focusArea: "Lưng, Tay trước", muscleMapUrl: muscleMapUrls.back, exercises: backExercises },
      { cycleDay: 3, title: "Vai", focusArea: "Vai, Tay sau", muscleMapUrl: muscleMapUrls.shoulders, exercises: shoulderExercises },
      { cycleDay: 4, title: "Tay", focusArea: "Tay trước, Tay sau", muscleMapUrl: muscleMapUrls.arms, exercises: armsExercises },
      { cycleDay: 5, title: "Chân", focusArea: "Đùi trước, Đùi sau, Mông, Bắp chân", muscleMapUrl: muscleMapUrls.legs, exercises: legsExercises },
      { cycleDay: 6, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
      { cycleDay: 7, title: "Nghỉ ngơi", focusArea: "Toàn thân", isRest: true },
    ],
  },
];

const ensureImageDir = async () => {
  await fs.mkdir(IMAGE_DIR, { recursive: true });
};

const downloadImage = async (exercise) => {
  await ensureImageDir();
  const response = await fetch(exercise.thumbnailUrl);
  if (!response.ok) {
    throw new Error(`Không tải được ảnh ${exercise.slug}: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const localPath = path.join(IMAGE_DIR, `${exercise.slug}.jpg`);
  await fs.writeFile(localPath, buffer);
  return localPath;
};

const uploadExerciseImage = async (exercise, existingExercise) => {
  if (existingExercise?.thumbnailUrl?.includes("res.cloudinary.com")) {
    return existingExercise.thumbnailUrl;
  }

  let localPath = null;
  try {
    localPath = await downloadImage(exercise);
    const result = await cloudinary.uploader.upload(localPath, {
      folder: "LoongMilkGym_APP/exercises",
      public_id: exercise.slug,
      overwrite: true,
      resource_type: "image",
    });

    try {
      await fs.unlink(localPath);
    } catch {}

    return result.secure_url;
  } catch (error) {
    console.warn(`[Cảnh báo] Không thể tải/upload ảnh cho ${exercise.slug} lên Cloudinary, sử dụng URL gốc làm fallback:`, error.message);
    if (localPath) {
      try {
        await fs.unlink(localPath);
      } catch {}
    }
    return exercise.thumbnailUrl;
  }
};

const upsertMuscleGroups = async () => {
  for (const item of muscleGroups) {
    await prisma.muscleGroup.upsert({
      where: { slug: item.slug },
      update: { name: item.name },
      create: item,
    });
  }
};

const upsertEquipment = async () => {
  for (const item of equipmentList) {
    await prisma.equipment.upsert({
      where: { slug: item.slug },
      update: { name: item.name },
      create: item,
    });
  }
};

const upsertArmExercises = async () => {
  for (const item of armExercises) {
    const equipment = await prisma.equipment.findUnique({ where: { slug: item.equipmentSlug } });
    const existingExercise = await prisma.exercise.findUnique({ where: { slug: item.slug } });
    const thumbnailUrl = await uploadExerciseImage(item, existingExercise);

    const exercise = await prisma.exercise.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        description: item.description,
        difficulty: item.difficulty,
        exerciseType: item.exerciseType,
        primaryEquipmentId: equipment?.id || null,
        thumbnailUrl,
        videoUrl: item.videoUrl,
        isPublished: true,
      },
      create: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        difficulty: item.difficulty,
        exerciseType: item.exerciseType,
        primaryEquipmentId: equipment?.id || null,
        thumbnailUrl,
        videoUrl: item.videoUrl,
        isPublished: true,
      },
    });

    await prisma.exerciseMuscle.deleteMany({ where: { exerciseId: exercise.id } });
    for (const muscle of item.muscles) {
      const muscleGroup = await prisma.muscleGroup.findUnique({ where: { slug: muscle.slug } });
      if (!muscleGroup) continue;

      await prisma.exerciseMuscle.create({
        data: {
          exerciseId: exercise.id,
          muscleGroupId: muscleGroup.id,
          role: muscle.role,
        },
      });
    }

    await prisma.exerciseTag.deleteMany({ where: { exerciseId: exercise.id } });
    await prisma.exerciseTag.createMany({
      data: item.tags.map((tag) => ({
        exerciseId: exercise.id,
        tag,
      })),
      skipDuplicates: true,
    });
  }
};

const getExerciseBySlug = async (slug) => {
  const exercise = await prisma.exercise.findUnique({ where: { slug } });
  if (!exercise) {
    console.warn(`Bỏ qua bài tập chưa có trong DB: ${slug}`);
  }
  return exercise;
};

const seedProgramDay = async (programId, day) => {
  const programDay = await prisma.workoutProgramDay.create({
    data: {
      programId,
      cycleDay: day.cycleDay,
      title: day.title,
      focusArea: day.focusArea,
      muscleMapUrl: day.muscleMapUrl || null,
      description: day.isRest
        ? "Ngày nghỉ để phục hồi."
        : `Buổi tập tập trung vào ${day.focusArea}.`,
    },
  });

  if (day.isRest) return;

  const template = await prisma.workoutTemplate.create({
    data: {
      programDayId: programDay.id,
      title: day.title,
      description: `Mục tiêu chính: ${day.focusArea}.`,
      estimatedDurationMinutes: 60,
    },
  });

  for (const item of day.exercises) {
    const exercise = await getExerciseBySlug(item.slug);
    if (!exercise) continue;

    await prisma.workoutTemplateExercise.create({
      data: {
        workoutTemplateId: template.id,
        exerciseId: exercise.id,
        exerciseOrder: item.order,
        sets: item.sets,
        repsMin: item.repsMin,
        repsMax: item.repsMax,
        weightKg: item.weight > 0 ? item.weight : null,
        restSeconds: item.rest || 60,
        tempo: "2-0-1-0",
        note: item.note || "",
      },
    });
  }
};

const upsertPrograms = async () => {
  for (const item of programsConfig) {
    const program = await prisma.workoutProgram.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        goal: item.goal,
        difficulty: item.difficulty,
        coverImageUrl: item.coverImageUrl,
        isPublished: true,
        price: 0,
        metadata: {
          cycleLength: item.days.length,
          scheduleType: "recurring",
        },
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        goal: item.goal,
        difficulty: item.difficulty,
        coverImageUrl: item.coverImageUrl,
        isPublished: true,
        price: 0,
        metadata: {
          cycleLength: item.days.length,
          scheduleType: "recurring",
        },
      },
    });

    await prisma.workoutProgramDay.deleteMany({ where: { programId: program.id } });

    for (const day of item.days) {
      await seedProgramDay(program.id, day);
    }

    console.log(`Đã seed giáo án: ${item.title}`);
  }
};

async function main() {
  console.log("Bắt đầu seed roadmap dạng chu kỳ.");

  await upsertMuscleGroups();
  await upsertEquipment();
  await upsertArmExercises();
  await upsertPrograms();

  // Clean up local image directory
  try {
    await fs.rm(IMAGE_DIR, { recursive: true, force: true });
  } catch {}

  console.log("Seed roadmap hoàn tất.");
}

main()
  .catch((error) => {
    console.error("Lỗi seed roadmap:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
