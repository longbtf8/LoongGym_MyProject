const { prisma } = require("@/lib/prisma");
const { httpCodes } = require("@/config/constants");
const AppError = require("@/utils/AppError");
const userTrainingPlansService = require("./user-training-plans.service");

class WorkoutSessionsService {
  async startSession(userId, { planDayId, title, notes }) {
    let sessionTitle = title || "Buổi tập mới";
    let exercisesToCreate = [];

    if (planDayId) {
      // 1. Kiểm tra ngày tập trong kế hoạch và ownership
      const planDay = await prisma.userTrainingPlanDay.findUnique({
        where: { id: planDayId },
        include: { plan: true },
      });

      if (!planDay) {
        throw new AppError("Không tìm thấy ngày tập trong kế hoạch.", httpCodes.notFound);
      }

      if (planDay.plan.userId !== userId) {
        throw new AppError("Bạn không có quyền bắt đầu ngày tập này.", httpCodes.forbidden);
      }

      sessionTitle = title || planDay.title;

      // 2. Lấy thông tin bài tập chi tiết từ ngày tập
      const dayDetails = await userTrainingPlansService.getDayDetails(userId, planDayId);
      const planExercises = dayDetails.exercises || [];

      exercisesToCreate = planExercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        exerciseOrder: pe.exerciseOrder,
        status: "pending",
        notes: pe.note || null,
      }));
    }

    // 3. Tạo session
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        planDayId: planDayId || null,
        title: sessionTitle,
        notes: notes || null,
        startedAt: new Date(),
        status: "in_progress",
      },
    });

    // 4. Tạo các bài tập trong session nếu có
    if (exercisesToCreate.length > 0) {
      await prisma.workoutSessionExercise.createMany({
        data: exercisesToCreate.map((ex) => ({
          ...ex,
          workoutSessionId: session.id,
        })),
      });
    }

    return this.getSession(userId, session.id);
  }

  async getSession(userId, id) {
    const session = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { exerciseOrder: "asc" },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: "asc" },
            },
          },
        },
      },
    });

    if (!session) {
      throw new AppError("Không tìm thấy buổi tập.", httpCodes.notFound);
    }

    if (session.userId !== userId) {
      throw new AppError("Bạn không có quyền truy cập buổi tập này.", httpCodes.forbidden);
    }

    return session;
  }

  async addSet(userId, sessionId, sessionExerciseId, setData) {
    // 1. Kiểm tra session
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new AppError("Không tìm thấy buổi tập.", httpCodes.notFound);
    }

    if (session.userId !== userId) {
      throw new AppError("Bạn không có quyền truy cập buổi tập này.", httpCodes.forbidden);
    }

    // 2. Kiểm tra exercise trong session
    const sessionExercise = await prisma.workoutSessionExercise.findFirst({
      where: {
        id: sessionExerciseId,
        workoutSessionId: sessionId,
      },
    });

    if (!sessionExercise) {
      throw new AppError("Không tìm thấy bài tập trong buổi tập này.", httpCodes.notFound);
    }

    // 3. Tạo set
    const completedAt = setData.isCompleted ? new Date() : null;
    const newSet = await prisma.workoutSet.create({
      data: {
        sessionExerciseId,
        setNumber: setData.setNumber,
        setType: setData.setType || "working",
        reps: setData.reps ?? null,
        weightKg: setData.weightKg ?? null,
        durationSeconds: setData.durationSeconds ?? null,
        distanceMeters: setData.distanceMeters ?? null,
        rpe: setData.rpe ?? null,
        isCompleted: setData.isCompleted ?? false,
        completedAt,
      },
    });

    return newSet;
  }

  async updateSet(userId, setId, updateData) {
    // 1. Kiểm tra ownership của set
    const set = await prisma.workoutSet.findUnique({
      where: { id: setId },
      include: {
        sessionExercise: {
          include: {
            workoutSession: true,
          },
        },
      },
    });

    if (!set) {
      throw new AppError("Không tìm thấy set tập.", httpCodes.notFound);
    }

    if (set.sessionExercise.workoutSession.userId !== userId) {
      throw new AppError("Bạn không có quyền chỉnh sửa set tập này.", httpCodes.forbidden);
    }

    // 2. Chuẩn bị dữ liệu cập nhật
    const data = { ...updateData };
    if (updateData.isCompleted !== undefined) {
      data.completedAt = updateData.isCompleted ? new Date() : null;
    }

    const updatedSet = await prisma.workoutSet.update({
      where: { id: setId },
      data,
    });

    return updatedSet;
  }

  async completeSession(userId, id, { perceivedEffort, notes }) {
    // 1. Kiểm tra session
    const session = await prisma.workoutSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError("Không tìm thấy buổi tập.", httpCodes.notFound);
    }

    if (session.userId !== userId) {
      throw new AppError("Bạn không có quyền hoàn thành buổi tập này.", httpCodes.forbidden);
    }

    if (session.status !== "in_progress") {
      throw new AppError("Buổi tập này đã hoàn thành hoặc bị hủy bỏ trước đó.", httpCodes.badRequest);
    }

    const endedAt = new Date();
    const startedAt = session.startedAt || session.createdAt;
    const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

    // 2. Tính toán calo tiêu thụ và cập nhật thống kê cá nhân
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    const weightKg = profile?.weightKg || 70;
    const durationMinutes = Math.max(durationSeconds / 60, 1);
    const caloriesBurned = Math.round(6.0 * 3.5 * weightKg / 200 * durationMinutes);

    // 3. Thực hiện cập nhật trong transaction để đảm bảo dữ liệu đồng bộ
    const result = await prisma.$transaction(async (tx) => {
      // Cập nhật session
      const updatedSession = await tx.workoutSession.update({
        where: { id },
        data: {
          status: "completed",
          endedAt,
          durationSeconds,
          perceivedEffort: perceivedEffort ?? null,
          notes: notes || session.notes,
        },
      });

      // Nếu buổi tập liên kết với một ngày trong kế hoạch, cập nhật trạng thái ngày đó
      if (session.planDayId) {
        await tx.userTrainingPlanDay.update({
          where: { id: session.planDayId },
          data: {
            status: "completed",
            notes: notes || null,
          },
        });
      }

      // Cộng dồn calo và số ngày tập vào profile
      await tx.userProfile.update({
        where: { userId },
        data: {
          totalWorkoutDays: { increment: 1 },
          totalCaloriesBurned: { increment: caloriesBurned },
        },
      });

      return updatedSession;
    });

    return result;
  }

  async getSessionByPlanDay(userId, planDayId) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        userId,
        planDayId,
      },
      include: {
        exercises: {
          orderBy: { exerciseOrder: "asc" },
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: "asc" },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return session;
  }
}

module.exports = new WorkoutSessionsService();
