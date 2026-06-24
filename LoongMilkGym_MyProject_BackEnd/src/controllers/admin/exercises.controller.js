const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");
const { deleteOldImage } = require("@/utils/cloudinary");
const { emitAdminEvent } = require("@/utils/admin-realtime.helper");

const MUSCLE_INCLUDE = {
  muscles: {
    include: {
      muscleGroup: true,
    },
  },
};

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const formatExercise = (item) => {
  const primaryMuscle = item.muscles?.find((m) => m.role === "primary")?.muscleGroup?.name || null;
  const useCount = item._count?.workoutTemplateExercises ?? item.useCount ?? 0;
  const { _count, ...rest } = item;
  return {
    ...rest,
    useCount,
    primaryMuscle,
  };
};

const validateMuscleGroups = async (primaryId, secondaryIds = []) => {
  const uniqueSecondary = [...new Set(secondaryIds.filter((id) => id && id !== primaryId))];
  const allIds = [primaryId, ...uniqueSecondary];

  const groups = await prisma.muscleGroup.findMany({
    where: { id: { in: allIds } },
    select: { id: true },
  });

  if (groups.length !== allIds.length) {
    throw new AppError("Một hoặc nhiều nhóm cơ không tồn tại.", httpCodes.badRequest);
  }

  return uniqueSecondary;
};

const syncExerciseMuscles = async (tx, exerciseId, primaryId, secondaryIds = []) => {
  const uniqueSecondary = await validateMuscleGroups(primaryId, secondaryIds);

  await tx.exerciseMuscle.deleteMany({ where: { exerciseId } });

  await tx.exerciseMuscle.createMany({
    data: [
      { exerciseId, muscleGroupId: primaryId, role: "primary" },
      ...uniqueSecondary.map((muscleGroupId) => ({
        exerciseId,
        muscleGroupId,
        role: "secondary",
      })),
    ],
  });
};

const emitExerciseEvents = async (event, exercise) => {
  const formatted = formatExercise(exercise);
  await emitAdminEvent("admin-exercises", event, { exercise: formatted });
  await emitAdminEvent("exercises-feed", event, { exercise: formatted });
};

/**
 * Lấy danh sách bài tập (Exercises)
 */
const getExercises = async (req, res, next) => {
  try {
    const { search, difficulty, published, muscleGroupId, page, limit } = req.validated.query;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (published !== undefined && published !== "") {
      where.isPublished = published === "true";
    }

    if (muscleGroupId) {
      where.muscles = {
        some: {
          muscleGroupId,
          role: "primary",
        },
      };
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const total = await prisma.exercise.count({ where });

    const data = await prisma.exercise.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ...MUSCLE_INCLUDE,
        _count: {
          select: {
            workoutTemplateExercises: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return res.success(
      {
        items: data.map(formatExercise),
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      httpCodes.success,
      "Lấy danh sách bài tập thành công."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết bài tập
 */
const getExerciseDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        ...MUSCLE_INCLUDE,
        _count: {
          select: {
            workoutTemplateExercises: true,
          },
        },
      },
    });

    if (!exercise) {
      throw new AppError("Không tìm thấy bài tập.", httpCodes.notFound);
    }

    return res.success(
      formatExercise(exercise),
      httpCodes.success,
      "Lấy chi tiết bài tập thành công."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo bài tập mới
 */
const createExercise = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      difficulty,
      videoUrl,
      isPublished,
      primaryMuscleGroupId,
      secondaryMuscleGroupIds,
    } = req.validated.body;

    let finalSlug = slug ? slugify(slug) : slugify(name);
    if (!finalSlug) {
      throw new AppError("Không thể tạo slug từ tên bài tập. Vui lòng điền slug.", httpCodes.badRequest);
    }

    const existing = await prisma.exercise.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      throw new AppError("Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.", httpCodes.badRequest);
    }

    let thumbnailUrl = null;
    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0]) {
      thumbnailUrl = req.files["thumbnail"][0].path || req.files["thumbnail"][0].secure_url;
    }

    const exercise = await prisma.$transaction(async (tx) => {
      const created = await tx.exercise.create({
        data: {
          name,
          slug: finalSlug,
          description: description || "",
          difficulty,
          videoUrl: videoUrl || null,
          isPublished: isPublished ?? true,
          thumbnailUrl,
        },
      });

      await syncExerciseMuscles(tx, created.id, primaryMuscleGroupId, secondaryMuscleGroupIds);

      return tx.exercise.findUnique({
        where: { id: created.id },
        include: {
          ...MUSCLE_INCLUDE,
          _count: { select: { workoutTemplateExercises: true } },
        },
      });
    });

    await emitExerciseEvents("exercise.created", exercise);

    return res.success(formatExercise(exercise), httpCodes.created, "Tạo bài tập thành công.");
  } catch (error) {
    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0] && req.files["thumbnail"][0].path) {
      await deleteOldImage(req.files["thumbnail"][0].path);
    }
    next(error);
  }
};

/**
 * Cập nhật bài tập
 */
const updateExercise = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      difficulty,
      videoUrl,
      isPublished,
      primaryMuscleGroupId,
      secondaryMuscleGroupIds,
    } = req.validated.body;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });
    if (!exercise) {
      throw new AppError("Không tìm thấy bài tập.", httpCodes.notFound);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    if (slug !== undefined && slug !== null) {
      let finalSlug = slugify(slug);
      if (!finalSlug) {
        throw new AppError("Slug không hợp lệ", httpCodes.badRequest);
      }
      if (finalSlug !== exercise.slug) {
        const existing = await prisma.exercise.findUnique({
          where: { slug: finalSlug },
        });
        if (existing) {
          throw new AppError("Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.", httpCodes.badRequest);
        }
        updateData.slug = finalSlug;
      }
    }

    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0]) {
      const newThumbnailUrl = req.files["thumbnail"][0].path || req.files["thumbnail"][0].secure_url;
      updateData.thumbnailUrl = newThumbnailUrl;
      if (exercise.thumbnailUrl) {
        await deleteOldImage(exercise.thumbnailUrl);
      }
    }

    const shouldSyncMuscles =
      primaryMuscleGroupId !== undefined || secondaryMuscleGroupIds !== undefined;

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.exercise.update({ where: { id }, data: updateData });
      }

      if (shouldSyncMuscles) {
        const currentMuscles = await tx.exerciseMuscle.findMany({ where: { exerciseId: id } });
        const currentPrimary = currentMuscles.find((m) => m.role === "primary")?.muscleGroupId;
        const currentSecondary = currentMuscles
          .filter((m) => m.role === "secondary")
          .map((m) => m.muscleGroupId);

        const nextPrimary = primaryMuscleGroupId ?? currentPrimary;
        if (!nextPrimary) {
          throw new AppError("Nhóm cơ chính là bắt buộc.", httpCodes.badRequest);
        }

        const nextSecondary =
          secondaryMuscleGroupIds !== undefined ? secondaryMuscleGroupIds : currentSecondary;

        await syncExerciseMuscles(tx, id, nextPrimary, nextSecondary);
      }

      return tx.exercise.findUnique({
        where: { id },
        include: {
          ...MUSCLE_INCLUDE,
          _count: { select: { workoutTemplateExercises: true } },
        },
      });
    });

    await emitExerciseEvents("exercise.updated", updated);

    return res.success(formatExercise(updated), httpCodes.success, "Cập nhật bài tập thành công.");
  } catch (error) {
    if (req.files && req.files["thumbnail"] && req.files["thumbnail"][0] && req.files["thumbnail"][0].path) {
      await deleteOldImage(req.files["thumbnail"][0].path);
    }
    next(error);
  }
};

/**
 * Xóa bài tập an toàn
 */
const deleteExercise = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            workoutTemplateExercises: true,
          },
        },
      },
    });

    if (!exercise) {
      throw new AppError("Không tìm thấy bài tập.", httpCodes.notFound);
    }

    if (exercise._count.workoutTemplateExercises > 0) {
      throw new AppError("Không thể xóa bài tập vì hiện đang được sử dụng trong giáo án tập luyện.", httpCodes.badRequest);
    }

    if (exercise.thumbnailUrl) {
      await deleteOldImage(exercise.thumbnailUrl);
    }

    await prisma.exercise.delete({
      where: { id },
    });

    await emitAdminEvent("admin-exercises", "exercise.deleted", { exerciseId: id });
    await emitAdminEvent("exercises-feed", "exercise.deleted", { exerciseId: id, slug: exercise.slug });

    return res.success(null, httpCodes.success, "Xóa bài tập thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExercises,
  getExerciseDetail,
  createExercise,
  updateExercise,
  deleteExercise,
};
