const { prisma } = require("@/lib/prisma");

/**
 * Service lấy danh sách tất cả các nhóm cơ (dạng danh sách phẳng)
 */
const getMuscleGroups = async () => {
  return await prisma.muscleGroup.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

module.exports = {
  getMuscleGroups,
};
