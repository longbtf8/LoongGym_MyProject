const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");
const { deleteOldImage } = require("@/utils/cloudinary");
const { emitAdminEvent } = require("@/utils/admin-realtime.helper");

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "") // Remove non-alphanumeric except space/hyphen
    .replace(/(\s+)/g, "-") // Replace spaces with hyphen
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens
};

/**
 * Lấy danh sách giáo án dành cho Admin (không lọc isPublished)
 */
const getPrograms = async (req, res, next) => {
  try {
    const { search, goal, difficulty, published, sort, page, limit } = req.validated.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (goal) {
      where.goal = goal;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (published !== undefined && published !== "") {
      where.isPublished = published === "true";
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const total = await prisma.workoutProgram.count({ where });

    // Compute overall stats of all programs in the system
    const [totalAll, totalPublished] = await Promise.all([
      prisma.workoutProgram.count(),
      prisma.workoutProgram.count({ where: { isPublished: true } }),
    ]);
    const totalDraft = totalAll - totalPublished;

    let orderBy = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { price: "desc" };
    }

    const data = await prisma.workoutProgram.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        days: {
          select: {
            title: true,
            focusArea: true,
            templates: {
              select: {
                exercises: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            userPlans: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return res.success(
      {
        items: data.map(item => {
          // Count active days (not rest days)
          const activeDaysCount = item.days.filter(day => {
            const title = `${day.title || ""} ${day.focusArea || ""}`.toLowerCase();
            const hasExercises = day.templates?.some(t => t.exercises?.length > 0);
            const isRest = !hasExercises || /nghỉ|nghi|rest|phục hồi|phuc hoi|mobility/.test(title);
            return !isRest;
          }).length;

          // Remove days array so it doesn't inflate payload unnecessarily
          const { days, ...rest } = item;

          return {
            ...rest,
            daysCount: activeDaysCount,
            usersCount: item._count.userPlans,
          };
        }),
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
        stats: {
          total: totalAll,
          published: totalPublished,
          draft: totalDraft,
        },
      },
      httpCodes.success,
      "Lấy danh sách giáo án thành công."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách bộ lọc độc nhất (Goal & Difficulty) từ DB
 */
const getDistinctFilters = async (req, res, next) => {
  try {
    const [goalsInDb, diffsInDb] = await Promise.all([
      prisma.workoutProgram.findMany({
        select: { goal: true },
        distinct: ["goal"],
        where: { goal: { not: null } }
      }),
      prisma.workoutProgram.findMany({
        select: { difficulty: true },
        distinct: ["difficulty"],
        where: { difficulty: { not: null } }
      })
    ]);

    const goals = goalsInDb.map(g => g.goal).filter(Boolean);
    const difficulties = diffsInDb.map(d => d.difficulty).filter(Boolean);

    return res.success(
      { goals, difficulties },
      httpCodes.success,
      "Lấy bộ lọc giáo án thành công."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết giáo án (Admin)
 */
const getProgramDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const program = await prisma.workoutProgram.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userPlans: true,
          },
        },
        days: {
          orderBy: { cycleDay: "asc" },
          include: {
            templates: {
              include: {
                exercises: {
                  orderBy: { exerciseOrder: "asc" },
                  include: {
                    exercise: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new AppError("Không tìm thấy giáo án.", httpCodes.notFound);
    }

    return res.success(
      {
        ...program,
        usersCount: program._count.userPlans,
      },
      httpCodes.success,
      "Lấy chi tiết giáo án thành công."
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo giáo án mới
 */
const createProgram = async (req, res, next) => {
  try {
    const { title, slug, description, goal, difficulty, price, isPublished } = req.validated.body;

    let finalSlug = slug ? slugify(slug) : slugify(title);
    if (!finalSlug) {
      throw new AppError("Không thể tạo slug từ tiêu đề. Vui lòng điền slug.", httpCodes.badRequest);
    }

    // Check slug unique
    const existing = await prisma.workoutProgram.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      throw new AppError("Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.", httpCodes.badRequest);
    }

    let coverImageUrl = null;
    if (req.files && req.files["coverImage"] && req.files["coverImage"][0]) {
      coverImageUrl = req.files["coverImage"][0].path || req.files["coverImage"][0].secure_url;
    }

    const program = await prisma.workoutProgram.create({
      data: {
        title,
        slug: finalSlug,
        description: description || "",
        goal: goal || null,
        difficulty: difficulty || null,
        price,
        isPublished,
        coverImageUrl,
        metadata: {
          cycleLength: 0,
          scheduleType: "recurring",
        },
      },
    });

    await emitAdminEvent("admin-workout-programs", "program.created", { program });

    return res.success(program, httpCodes.created, "Tạo giáo án thành công.");
  } catch (error) {
    if (req.files && req.files["coverImage"] && req.files["coverImage"][0] && req.files["coverImage"][0].path) {
      await deleteOldImage(req.files["coverImage"][0].path);
    }
    next(error);
  }
};

/**
 * Cập nhật giáo án
 */
const updateProgram = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, description, goal, difficulty, price } = req.validated.body;

    const program = await prisma.workoutProgram.findUnique({
      where: { id },
    });
    if (!program) {
      throw new AppError("Không tìm thấy giáo án.", httpCodes.notFound);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (goal !== undefined) updateData.goal = goal;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (price !== undefined) updateData.price = price;

    if (slug !== undefined && slug !== null) {
      let finalSlug = slugify(slug);
      if (!finalSlug) {
        throw new AppError("Slug không hợp lệ", httpCodes.badRequest);
      }
      if (finalSlug !== program.slug) {
        const existing = await prisma.workoutProgram.findUnique({
          where: { slug: finalSlug },
        });
        if (existing) {
          throw new AppError("Đường dẫn (slug) đã tồn tại. Vui lòng chọn đường dẫn khác.", httpCodes.badRequest);
        }
        updateData.slug = finalSlug;
      }
    }

    if (req.files && req.files["coverImage"] && req.files["coverImage"][0]) {
      const coverImageUrl = req.files["coverImage"][0].path || req.files["coverImage"][0].secure_url;
      updateData.coverImageUrl = coverImageUrl;
      // Delete old image if exists
      if (program.coverImageUrl) {
        await deleteOldImage(program.coverImageUrl);
      }
    }

    const updated = await prisma.workoutProgram.update({
      where: { id },
      data: updateData,
    });

    await emitAdminEvent("admin-workout-programs", "program.updated", { program: updated });

    return res.success(updated, httpCodes.success, "Cập nhật giáo án thành công.");
  } catch (error) {
    if (req.files && req.files["coverImage"] && req.files["coverImage"][0] && req.files["coverImage"][0].path) {
      await deleteOldImage(req.files["coverImage"][0].path);
    }
    next(error);
  }
};

/**
 * Xuất bản hoặc ngừng xuất bản giáo án
 */
const updateProgramStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "publish" or "unpublish"

    const program = await prisma.workoutProgram.findUnique({
      where: { id },
      include: {
        days: true,
      },
    });

    if (!program) {
      throw new AppError("Không tìm thấy giáo án.", httpCodes.notFound);
    }

    if (action === "publish") {
      const missingFields = [];
      if (!program.title) missingFields.push("Tiêu đề");
      if (!program.slug) missingFields.push("Đường dẫn (slug)");
      if (!program.goal) missingFields.push("Mục tiêu");
      if (!program.difficulty) missingFields.push("Độ khó");
      if (!program.description) missingFields.push("Mô tả");
      if (program.days.length === 0) missingFields.push("Ít nhất một ngày tập");

      if (missingFields.length > 0) {
        return res.error(
          `Không thể xuất bản giáo án. Vui lòng bổ sung các trường sau: ${missingFields.join(", ")}`,
          httpCodes.badRequest
        );
      }

      await prisma.workoutProgram.update({
        where: { id },
        data: { isPublished: true },
      });

      const updatedProgram = await prisma.workoutProgram.findUnique({ where: { id } });
      await emitAdminEvent("admin-workout-programs", "program.updated", { program: updatedProgram });

      return res.success(null, httpCodes.success, "Xuất bản giáo án thành công.");
    } else if (action === "unpublish") {
      await prisma.workoutProgram.update({
        where: { id },
        data: { isPublished: false },
      });

      const updatedProgram = await prisma.workoutProgram.findUnique({ where: { id } });
      await emitAdminEvent("admin-workout-programs", "program.updated", { program: updatedProgram });

      return res.success(null, httpCodes.success, "Ngừng xuất bản giáo án thành công.");
    } else {
      throw new AppError("Hành động không hợp lệ.", httpCodes.badRequest);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa giáo án an toàn
 */
const deleteProgram = async (req, res, next) => {
  try {
    const { id } = req.params;

    const program = await prisma.workoutProgram.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userPlans: true,
          },
        },
      },
    });

    if (!program) {
      throw new AppError("Không tìm thấy giáo án.", httpCodes.notFound);
    }

    if (program._count.userPlans > 0) {
      throw new AppError("Không thể xóa giáo án vì hiện đang có người dùng sử dụng.", httpCodes.badRequest);
    }

    // Save cover image path to delete after DB deletion
    const coverImageUrl = program.coverImageUrl;

    await prisma.workoutProgram.delete({
      where: { id },
    });

    if (coverImageUrl) {
      await deleteOldImage(coverImageUrl);
    }

    await emitAdminEvent("admin-workout-programs", "program.deleted", { programId: id });

    return res.success(null, httpCodes.success, "Xóa giáo án thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm một ngày tập vào giáo án
 */
const addDay = async (req, res, next) => {
  try {
    const { id: programId } = req.params;
    const { title, description, focusArea, cycleDay, muscleMapUrl } = req.validated.body;

    const program = await prisma.workoutProgram.findUnique({
      where: { id: programId },
    });
    if (!program) {
      throw new AppError("Không tìm thấy giáo án.", httpCodes.notFound);
    }

    // Check duplicate cycleDay
    const existingDay = await prisma.workoutProgramDay.findUnique({
      where: {
        programId_cycleDay: {
          programId,
          cycleDay,
        },
      },
    });
    if (existingDay) {
      throw new AppError(`Ngày thứ ${cycleDay} đã tồn tại trong giáo án này.`, httpCodes.badRequest);
    }

    const day = await prisma.workoutProgramDay.create({
      data: {
        programId,
        title,
        description: description || "",
        focusArea: focusArea || "",
        cycleDay,
        muscleMapUrl: muscleMapUrl || null,
      },
    });

    // Automatically create a Template for this day
    await prisma.workoutTemplate.create({
      data: {
        programDayId: day.id,
        title: title,
        description: `Buổi tập: ${title}`,
      },
    });

    // Update program cycleLength metadata
    const dayCount = await prisma.workoutProgramDay.count({ where: { programId } });
    const currentMeta = typeof program.metadata === "object" ? program.metadata : {};
    await prisma.workoutProgram.update({
      where: { id: programId },
      data: {
        metadata: {
          ...currentMeta,
          cycleLength: dayCount,
        },
      },
    });

    return res.success(day, httpCodes.created, "Thêm ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật một ngày tập
 */
const updateDay = async (req, res, next) => {
  try {
    const { id: programId, dayId } = req.params;
    const { title, description, focusArea, cycleDay, muscleMapUrl } = req.validated.body;

    const day = await prisma.workoutProgramDay.findFirst({
      where: { id: dayId, programId },
    });
    if (!day) {
      throw new AppError("Không tìm thấy ngày tập trong giáo án này.", httpCodes.notFound);
    }

    if (cycleDay !== day.cycleDay) {
      const existingDay = await prisma.workoutProgramDay.findUnique({
        where: {
          programId_cycleDay: {
            programId,
            cycleDay,
          },
        },
      });
      if (existingDay) {
        throw new AppError(`Ngày thứ ${cycleDay} đã tồn tại trong giáo án này.`, httpCodes.badRequest);
      }
    }

    const updated = await prisma.workoutProgramDay.update({
      where: { id: dayId },
      data: {
        title,
        description: description || "",
        focusArea: focusArea || "",
        cycleDay,
        muscleMapUrl: muscleMapUrl || null,
      },
    });

    // Update associated template title
    await prisma.workoutTemplate.updateMany({
      where: { programDayId: dayId },
      data: { title: title },
    });

    return res.success(updated, httpCodes.success, "Cập nhật ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa một ngày tập
 */
const deleteDay = async (req, res, next) => {
  try {
    const { id: programId, dayId } = req.params;

    const day = await prisma.workoutProgramDay.findFirst({
      where: { id: dayId, programId },
    });
    if (!day) {
      throw new AppError("Không tìm thấy ngày tập trong giáo án này.", httpCodes.notFound);
    }

    await prisma.workoutProgramDay.delete({
      where: { id: dayId },
    });

    // Update program cycleLength metadata
    const dayCount = await prisma.workoutProgramDay.count({ where: { programId } });
    const program = await prisma.workoutProgram.findUnique({ where: { id: programId } });
    const currentMeta = typeof program.metadata === "object" ? program.metadata : {};
    await prisma.workoutProgram.update({
      where: { id: programId },
      data: {
        metadata: {
          ...currentMeta,
          cycleLength: dayCount,
        },
      },
    });

    return res.success(null, httpCodes.success, "Xóa ngày tập thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm bài tập vào một ngày tập
 */
const addTemplateExercise = async (req, res, next) => {
  try {
    const { id: programId, dayId } = req.params;
    const { exerciseId, name, videoUrl, sets, repsMin, repsMax, weightKg, restSeconds, tempo, note } = req.validated.body;

    const day = await prisma.workoutProgramDay.findFirst({
      where: { id: dayId, programId },
      include: {
        templates: true,
      },
    });

    if (!day) {
      throw new AppError("Không tìm thấy ngày tập.", httpCodes.notFound);
    }

    let template = day.templates[0];
    if (!template) {
      template = await prisma.workoutTemplate.create({
        data: {
          programDayId: dayId,
          title: day.title,
          description: `Buổi tập: ${day.title}`,
        },
      });
    }

    let targetExerciseId = exerciseId;

    // If no exerciseId, we must create a new Exercise in library
    if (!targetExerciseId) {
      if (!name) {
        throw new AppError("Vui lòng nhập tên bài tập mới.", httpCodes.badRequest);
      }

      const exerciseSlug = slugify(name);
      if (!exerciseSlug) {
        throw new AppError("Tên bài tập không hợp lệ để tạo slug.", httpCodes.badRequest);
      }

      // Check if exercise already exists
      let existingEx = await prisma.exercise.findUnique({
        where: { slug: exerciseSlug },
      });

      if (!existingEx) {
        existingEx = await prisma.exercise.create({
          data: {
            name,
            slug: exerciseSlug,
            description: `Bài tập tự tạo: ${name}`,
            difficulty: "beginner",
            videoUrl: videoUrl || null,
            isPublished: true,
          },
        });
      } else {
        // If already exists, optionally update videoUrl if provided
        if (videoUrl) {
          existingEx = await prisma.exercise.update({
            where: { id: existingEx.id },
            data: { videoUrl },
          });
        }
      }

      targetExerciseId = existingEx.id;
    } else {
      // If exerciseId is provided, check if we need to update its details (name or videoUrl)
      const existingEx = await prisma.exercise.findUnique({ where: { id: targetExerciseId } });
      if (!existingEx) {
        throw new AppError("Bài tập được chọn không tồn tại.", httpCodes.notFound);
      }

      const updateData = {};
      if (name && name !== existingEx.name) {
        updateData.name = name;
        updateData.slug = slugify(name);
      }
      if (videoUrl !== undefined) {
        updateData.videoUrl = videoUrl;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.exercise.update({
          where: { id: targetExerciseId },
          data: updateData,
        });
      }
    }

    // Get max order
    const maxOrderEx = await prisma.workoutTemplateExercise.findFirst({
      where: { workoutTemplateId: template.id },
      orderBy: { exerciseOrder: "desc" },
    });
    const exerciseOrder = maxOrderEx ? maxOrderEx.exerciseOrder + 1 : 1;

    const templateExercise = await prisma.workoutTemplateExercise.create({
      data: {
        workoutTemplateId: template.id,
        exerciseId: targetExerciseId,
        exerciseOrder,
        sets: sets || null,
        repsMin: repsMin || null,
        repsMax: repsMax || null,
        weightKg: weightKg || null,
        restSeconds: restSeconds || null,
        tempo: tempo || null,
        note: note || "",
      },
    });

    return res.success(templateExercise, httpCodes.created, "Thêm bài tập vào buổi tập thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật một bài tập trong ngày tập
 */
const updateTemplateExercise = async (req, res, next) => {
  try {
    const { id: programId, dayId, templateExerciseId } = req.params;
    const { name, videoUrl, sets, repsMin, repsMax, weightKg, restSeconds, tempo, note } = req.validated.body;

    const templateEx = await prisma.workoutTemplateExercise.findFirst({
      where: {
        id: templateExerciseId,
        template: {
          programDay: {
            id: dayId,
            programId,
          },
        },
      },
      include: {
        exercise: true,
      },
    });

    if (!templateEx) {
      throw new AppError("Không tìm thấy bài tập trong buổi tập này.", httpCodes.notFound);
    }

    // Update general exercise library details if provided
    const exerciseUpdate = {};
    if (name && name !== templateEx.exercise.name) {
      exerciseUpdate.name = name;
      exerciseUpdate.slug = slugify(name);
    }
    if (videoUrl !== undefined) {
      exerciseUpdate.videoUrl = videoUrl;
    }

    if (Object.keys(exerciseUpdate).length > 0) {
      await prisma.exercise.update({
        where: { id: templateEx.exerciseId },
        data: exerciseUpdate,
      });
    }

    // Update template parameters
    const updated = await prisma.workoutTemplateExercise.update({
      where: { id: templateExerciseId },
      data: {
        sets: sets !== undefined ? sets : templateEx.sets,
        repsMin: repsMin !== undefined ? repsMin : templateEx.repsMin,
        repsMax: repsMax !== undefined ? repsMax : templateEx.repsMax,
        weightKg: weightKg !== undefined ? weightKg : templateEx.weightKg,
        restSeconds: restSeconds !== undefined ? restSeconds : templateEx.restSeconds,
        tempo: tempo !== undefined ? tempo : templateEx.tempo,
        note: note !== undefined ? note : templateEx.note,
      },
    });

    return res.success(updated, httpCodes.success, "Cập nhật bài tập thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa một bài tập trong ngày tập
 */
const deleteTemplateExercise = async (req, res, next) => {
  try {
    const { id: programId, dayId, templateExerciseId } = req.params;

    const templateEx = await prisma.workoutTemplateExercise.findFirst({
      where: {
        id: templateExerciseId,
        template: {
          programDay: {
            id: dayId,
            programId,
          },
        },
      },
    });

    if (!templateEx) {
      throw new AppError("Không tìm thấy bài tập trong buổi tập này.", httpCodes.notFound);
    }

    const templateId = templateEx.workoutTemplateId;

    await prisma.workoutTemplateExercise.delete({
      where: { id: templateExerciseId },
    });

    // Reorder remaining exercises
    const remaining = await prisma.workoutTemplateExercise.findMany({
      where: { workoutTemplateId: templateId },
      orderBy: { exerciseOrder: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.workoutTemplateExercise.update({
        where: { id: remaining[i].id },
        data: { exerciseOrder: i + 1 },
      });
    }

    return res.success(null, httpCodes.success, "Xóa bài tập khỏi buổi tập thành công.");
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách toàn bộ bài tập trong thư viện để admin lựa chọn
 */
const getAdminExercisesList = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: { name: "asc" },
      take: 50, // Limit to 50 results to avoid massive response
    });

    return res.success(exercises, httpCodes.success, "Lấy danh sách bài tập thành công.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrograms,
  getDistinctFilters,
  getProgramDetail,
  createProgram,
  updateProgram,
  updateProgramStatus,
  deleteProgram,
  addDay,
  updateDay,
  deleteDay,
  addTemplateExercise,
  updateTemplateExercise,
  deleteTemplateExercise,
  getAdminExercisesList,
};
