const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");

/**
 * Service lấy danh sách bài tập đã xuất bản có bộ lọc và phân trang
 */
const getExercises = async (queryParams) => {
  const { search, difficulty, muscle, equipment, sort, page, limit } = queryParams;

  const where = {
    isPublished: true,
  };

  // Lọc theo từ khóa tìm kiếm (tên hoặc mô tả bài tập)
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // Lọc theo độ khó
  if (difficulty) {
    where.difficulty = difficulty;
  }

  // Lọc theo nhóm cơ (hỗ trợ nhiều nhóm cơ ngăn cách bằng dấu phẩy)
  if (muscle) {
    const muscleSlugs = muscle.split(",").map((s) => s.trim()).filter(Boolean);
    if (muscleSlugs.length > 0) {
      where.muscles = {
        some: {
          muscleGroup: {
            slug: { in: muscleSlugs },
          },
        },
      };
    }
  }

  // Lọc theo thiết bị (hỗ trợ nhiều thiết bị ngăn cách bằng dấu phẩy)
  if (equipment) {
    const equipmentSlugs = equipment.split(",").map((s) => s.trim()).filter(Boolean);
    if (equipmentSlugs.length > 0) {
      where.primaryEquipment = {
        slug: { in: equipmentSlugs },
      };
    }
  }

  // Tính toán phân trang
  const skip = (page - 1) * limit;
  const take = limit;

  // Lấy tổng số lượng bài tập thỏa mãn điều kiện
  const total = await prisma.exercise.count({ where });

  // Xác định thứ tự sắp xếp
  let orderBy = { viewCount: "desc" };
  if (sort === "newest") {
    orderBy = { createdAt: "desc" };
  } else if (sort === "name-asc") {
    orderBy = { name: "asc" };
  }

  // Lấy danh sách bài tập kèm theo thông tin thiết bị và nhóm cơ liên quan
  const data = await prisma.exercise.findMany({
    where,
    skip,
    take,
    include: {
      primaryEquipment: true,
      muscles: {
        include: {
          muscleGroup: true,
        },
      },
    },
    orderBy,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Service lấy chi tiết một bài tập theo slug
 */
const getExerciseBySlug = async (slug) => {
  const exercise = await prisma.exercise.findUnique({
    where: { slug },
    include: {
      primaryEquipment: true,
      muscles: {
        include: {
          muscleGroup: true,
        },
      },
      steps: {
        orderBy: {
          stepOrder: "asc",
        },
      },
      commonMistakes: true,
      tags: true,
    },
  });

  if (!exercise || !exercise.isPublished) {
    const error = new Error("Không tìm thấy bài tập hoặc bài tập chưa được xuất bản.");
    error.statusCode = httpCodes.notFound;
    throw error;
  }

  // Tăng lượt xem lên 1
  await prisma.exercise.update({
    where: { id: exercise.id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });
  exercise.viewCount += 1;

  return exercise;
};

module.exports = {
  getExercises,
  getExerciseBySlug,
};
