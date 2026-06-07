const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");

const getWorkoutPrograms = async (queryParams) => {
  const { search, goal, difficulty, page, limit } = queryParams;

  const where = {
    isPublished: true,
  };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (goal) {
    where.goal = goal;
  }

  if (difficulty) {
    where.difficulty = difficulty;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const total = await prisma.workoutProgram.count({ where });

  const data = await prisma.workoutProgram.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
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

const getWorkoutProgramById = async (id) => {
  const program = await prisma.workoutProgram.findUnique({
    where: { id },
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
  });

  if (!program || !program.isPublished) {
    throw new AppError("Không tìm thấy giáo án hoặc giáo án chưa được xuất bản.", httpCodes.notFound);
  }

  return program;
};

module.exports = {
  getWorkoutPrograms,
  getWorkoutProgramById,
};
