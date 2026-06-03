const { prisma } = require("@/lib/prisma");

/**
 * Service lấy danh sách tất cả các thiết bị tập luyện
 */
const getEquipment = async () => {
  return await prisma.equipment.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

module.exports = {
  getEquipment,
};
