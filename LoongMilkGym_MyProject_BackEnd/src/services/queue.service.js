const { jobStatus } = require("@/config/constants");
const { prisma } = require("@/lib/prisma");

class QueueService {
  async push(type, payload) {
    const jsonPayLoad = JSON.stringify(payload);
    await prisma.queues.create({
      data: {
        type,
        payload: jsonPayLoad,
      },
    });
  }
  async getFirstJob() {
    const job = prisma.queues.findFirst({
      where: {
        status: jobStatus.pending,
      },
    });
    return job;
  }
  async updateStatus(id, status) {
    await prisma.queues.update({
      where: {
        id: id,
      },
      data: {
        status,
      },
    });
  }
}
module.exports = new QueueService();
