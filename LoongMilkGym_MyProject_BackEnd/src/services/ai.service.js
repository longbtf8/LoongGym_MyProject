const { prisma } = require("@/lib/prisma");
const pusher = require("@/lib/pusher");
const {
  getSystemPrompt,
  buildUserContext,
  buildTrainingPlanContext,
  buildExerciseCatalogContext,
} = require("@/utils/aiPrompt");
const AppError = require("@/utils/AppError");
const { httpCodes } = require("@/config/constants");
const { streamResponse } = require("@/utils/ai/ai-stream.helper");
const { execute, reject } = require("@/utils/ai/ai-recommendation.helper");
const { normalizeWeeklyPlanPayload } = require("@/utils/ai/ai-plan-payload.helper");

const normalizeText = (value = "") => {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const isConsentMessage = (content = "") => {
  const normalized = normalizeText(content);
  const keywords = [
    "dong y",
    "ok",
    "oke",
    "san sang",
    "ap dung",
    "tao cho toi",
    "tao lich",
    "chot",
  ];
  return keywords.some((keyword) => {
    if (normalized === keyword) return true;
    if (normalized.length < 25 && (normalized.startsWith(keyword) || normalized.endsWith(keyword))) {
      return true;
    }
    return false;
  });
};

const parseExercisePrescription = (text = "") => {
  const setsMatch = text.match(/(\d+)\s*sets?/i);
  const repsMatch = text.match(/(\d+)\s*[-–]\s*(\d+)\s*reps?/i)
    || text.match(/x\s*(\d+)\s*[-–]\s*(\d+)/i);
  const singleRepMatch = text.match(/(\d+)\s*reps?/i);
  const restMatch = text.match(/(\d+)\s*(?:giây|giay|sec|seconds?)\s*nghỉ?/i);

  return {
    sets: setsMatch ? Number(setsMatch[1]) : 3,
    repsMin: repsMatch ? Number(repsMatch[1]) : singleRepMatch ? Number(singleRepMatch[1]) : 8,
    repsMax: repsMatch ? Number(repsMatch[2]) : singleRepMatch ? Number(singleRepMatch[1]) : 12,
    weightKg: 0,
    restSeconds: restMatch ? Number(restMatch[1]) : 90,
    tempo: "2-0-1-0",
    note: "Bài tập được AI Coach trích từ lịch đã đề xuất",
  };
};

const extractExerciseNameFromLine = (line = "") => {
  const markdownMatch = line.match(/\[([^\]]+)\]\((?:https?:\/\/[^/)\s]+)?\/exercises\/([^)#\s]+)(#[^)]+)?\)/i);
  if (markdownMatch) return markdownMatch[1].trim();

  const nameMatch = line.match(/^[-*]?\s*([^:]+):/);
  if (!nameMatch) return "";

  return nameMatch[1].replace(/^\d+\.\s*/, "").trim();
};

const buildExerciseLookup = (dbExercises = []) => {
  const bySlug = new Map();
  const byName = new Map();

  dbExercises.forEach((exercise) => {
    bySlug.set(exercise.slug, exercise);
    byName.set(normalizeText(exercise.name), exercise);
  });

  return { bySlug, byName };
};

const findExerciseFromLine = (line = "", lookup) => {
  const markdownMatch = line.match(/\[([^\]]+)\]\((?:https?:\/\/[^/)\s]+)?\/exercises\/([^)#\s]+)(#[^)]+)?\)/i);
  if (markdownMatch) {
    return lookup.bySlug.get(markdownMatch[2]);
  }

  const rawName = extractExerciseNameFromLine(line);
  if (!rawName) return null;

  const normalizedName = normalizeText(rawName);

  if (lookup.byName.has(normalizedName)) {
    return lookup.byName.get(normalizedName);
  }

  return [...lookup.byName.entries()].find(([name]) => {
    return name === normalizedName || name.includes(normalizedName) || normalizedName.includes(name);
  })?.[1] || null;
};

const buildPlanPayloadFromAssistantText = (assistantText = "", dbExercises = []) => {
  if (!assistantText || !/ngày\s*1/i.test(assistantText)) return null;

  const lookup = buildExerciseLookup(dbExercises);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  let currentDay = null;

  assistantText.split("\n").forEach((rawLine) => {
    const line = rawLine
      .replace(/\*\*/g, "")
      .replace(/^#+\s*/, "")
      .trim();
    if (!line) return;

    const dayMatch = line.match(/^Ngày\s*(\d+)\s*[:.-]\s*(.+)$/i);
    if (dayMatch) {
      const dayNumber = Number(dayMatch[1]);
      const date = new Date(today);
      date.setDate(today.getDate() + dayNumber - 1);

      currentDay = {
        date: date.toISOString().slice(0, 10),
        title: dayMatch[2].trim(),
        focusArea: dayMatch[2].trim(),
        status: /nghỉ|nghi|rest|mobility|phục hồi|phuc hoi/i.test(dayMatch[2]) ? "rest" : "pending",
        notes: "",
        exercises: [],
      };
      days[dayNumber - 1] = currentDay;
      return;
    }

    if (!currentDay || currentDay.status === "rest") return;

    const exercise = findExerciseFromLine(line, lookup);
    const exerciseName = extractExerciseNameFromLine(line);
    const exerciseKey = exercise?.id || normalizeText(exerciseName);
    if (!exerciseKey || currentDay.exercises.some((item) => item.exerciseId === exerciseKey || normalizeText(item.exerciseName) === exerciseKey)) return;

    currentDay.exercises.push({
      exerciseId: exercise?.id || exerciseName,
      exerciseName: exercise?.name || exerciseName,
      ...parseExercisePrescription(line),
    });
  });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    if (days[index]) return days[index];

    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      title: "Nghỉ phục hồi",
      focusArea: "Phục hồi",
      status: "rest",
      notes: "Ngày nghỉ để phục hồi.",
      exercises: [],
    };
  });

  const trainingDays = weekDays.filter((day) => day.status !== "rest" && day.exercises.length > 0);
  if (!trainingDays.length) return null;

  return normalizeWeeklyPlanPayload({
    title: "Lịch tập AI Coach",
    startDate: weekDays[0].date,
    durationWeeks: 8,
    daysPerWeek: trainingDays.length,
    goal: "Cải thiện nhóm cơ theo yêu cầu",
    focusAreas: [...new Set(trainingDays.map((day) => day.focusArea).filter(Boolean))].slice(0, 6),
    notes: "Mẫu tuần được tạo từ lịch AI đã đề xuất trong cuộc trò chuyện.",
    days: weekDays,
  });
};

const createRecommendationFromPreviousPlan = async ({ userId, conversationId, assistantMessageId, history, dbExercises }) => {
  const previousAssistant = [...history].reverse().find((message) => {
    return message.role === "assistant" && /ngày\s*1/i.test(message.content || "");
  });

  const payload = buildPlanPayloadFromAssistantText(previousAssistant?.content, dbExercises);
  if (!payload) return null;

  const recommendation = await prisma.aiRecommendation.create({
    data: {
      userId,
      conversationId,
      recommendationType: "generate_training_plan",
      title: payload.title,
      payload,
      status: "pending",
    },
  });

  const content = "Mình đã chuẩn bị lịch tập mới từ mẫu tuần ở trên. Nếu ổn, bấm Đồng ý để thay toàn bộ lịch hiện tại.";
  const savedAssistantMsg = await prisma.aiMessage.create({
    data: {
      id: assistantMessageId,
      conversationId,
      role: "assistant",
      content,
      metadata: { recommendationId: recommendation.id },
    },
  });

  await prisma.aiConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return {
    recommendation,
    assistantMessage: savedAssistantMsg,
  };
};

// Tạo phòng hội thoại mới cho user trong database
const createConversation = async (userId, contextType, title) => {
  return prisma.aiConversation.create({
    data: {
      userId,
      contextType: contextType || "general",
      title: title || `Cuộc hội thoại mới (${new Date().toLocaleDateString("vi-VN")})`,
    },
  });
};

// Lấy toàn bộ phòng hội thoại của user, sắp xếp mới nhất lên đầu
const getConversations = async (userId) => {
  return prisma.aiConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
};

// Xóa cuộc hội thoại của user
const deleteConversation = async (userId, conversationId) => {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new AppError("Không tìm thấy cuộc hội thoại.", httpCodes.notFound);
  }

  return prisma.aiConversation.delete({
    where: { id: conversationId },
  });
};

// Lấy lịch sử tin nhắn của cuộc hội thoại sau khi xác minh đúng user sở hữu
const getConversationMessages = async (userId, conversationId) => {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new AppError("Không tìm thấy cuộc hội thoại.", httpCodes.notFound);
  }

  const messages = await prisma.aiMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  const recommendationIds = messages
    .map((message) => message.metadata?.recommendationId)
    .filter(Boolean);

  if (!recommendationIds.length) {
    return messages;
  }

  const recommendations = await prisma.aiRecommendation.findMany({
    where: {
      id: { in: recommendationIds },
      userId,
    },
  });
  const recommendationById = new Map(recommendations.map((item) => [item.id, item]));

  return messages.map((message) => {
    const recommendationId = message.metadata?.recommendationId;
    const recommendation = recommendationById.get(recommendationId);

    if (!recommendation) return message;

    return {
      ...message,
      metadata: {
        ...(message.metadata || {}),
        recommendation,
      },
    };
  });
};

// Tìm kiếm tài liệu bằng chỉ mục FULLTEXT MATCH AGAINST trên MySQL
const searchKnowledge = async (queryText) => {
  if (!queryText || queryText.trim().length < 3) return [];
  try {
    return await prisma.$queryRawUnsafe(
      `SELECT title, source_type AS sourceType, content FROM ai_knowledge_documents 
       WHERE MATCH(title, content) AGAINST (?) 
       LIMIT 3`,
      queryText
    );
  } catch (error) {
    console.error("Lỗi tìm kiếm FULLTEXT (tự động chuyển sang tìm kiếm LIKE):", error);
    // Phương án dự phòng tìm kiếm LIKE nếu index FULLTEXT chưa sẵn sàng
    return prisma.aiKnowledgeDocument.findMany({
      where: {
        OR: [
          { title: { contains: queryText } },
          { content: { contains: queryText } },
        ],
      },
      select: {
        title: true,
        sourceType: true,
        content: true,
      },
      take: 3,
    });
  }
};

// Gửi tin nhắn mới và bắt đầu luồng stream câu trả lời từ AI
const createMessageAndStream = async (userId, conversationId, content) => {
  const conversation = await prisma.aiConversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    throw new AppError("Không tìm thấy cuộc hội thoại.", httpCodes.notFound);
  }

  // 1. Lưu tin nhắn của user vào database
  const userMessage = await prisma.aiMessage.create({
    data: {
      conversationId,
      role: "user",
      content,
      metadata: {},
    },
  });

  // 2. Tải thông tin ngữ cảnh người dùng song song để tối ưu tốc độ
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const planningWindowEnd = new Date(todayDate);
  planningWindowEnd.setDate(planningWindowEnd.getDate() + 42);

  const [profile, recentRecovery, activeInjuries, dbExercises, activePlan, upcomingPlanDays] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.recoveryLog.findFirst({
      where: { userId },
      orderBy: { logDate: "desc" },
    }),
    prisma.injuryLog.findMany({
      where: { userId, status: "active" },
    }),
    prisma.exercise.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        name: true,
        slug: true,
        difficulty: true,
        exerciseType: true,
        primaryEquipment: {
          select: {
            name: true,
            slug: true,
          },
        },
        muscles: {
          select: {
            role: true,
            muscleGroup: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: true,
          },
        },
      },
      orderBy: { name: "asc" },
      take: 160,
    }),
    prisma.userTrainingPlan.findFirst({
      where: {
        userId,
        status: "active",
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userTrainingPlanDay.findMany({
      where: {
        plan: {
          userId,
          status: "active",
        },
        scheduledDate: {
          gte: todayDate,
          lte: planningWindowEnd,
        },
      },
      orderBy: { scheduledDate: "asc" },
      take: 42,
    }),
  ]);

  // Lấy lịch tập ngày hôm nay của người dùng
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPlanDay = await prisma.userTrainingPlanDay.findFirst({
    where: {
      plan: { userId },
      scheduledDate: new Date(todayStr),
    },
    include: {
      workoutSessions: {
        include: {
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      },
    },
  });

  // 3. Tìm kiếm tài liệu RAG bổ sung
  const knowledgeDocs = await searchKnowledge(content);
  let ragContext = "";
  if (knowledgeDocs && knowledgeDocs.length > 0) {
    ragContext = `\n[TÀI LIỆU THAM KHẢO HỖ TRỢ (RAG)]\n` + 
      knowledgeDocs.map(d => `- [${d.sourceType}] ${d.title}: ${d.content}`).join("\n");
  }

  // Tạo ngữ cảnh danh sách bài tập hiện có phục vụ AI tạo link video
  let exercisesContext = "";
  if (dbExercises && dbExercises.length > 0) {
    exercisesContext = `\n[DANH SÁCH BÀI TẬP VÀ ĐƯỜNG DẪN THAM KHẢO (NẾU NHẮC ĐẾN BÀI NÀY, HÃY CHÈN LINK MARKDOWN THEO ĐÚNG ĐƯỜNG DẪN NÀY)]\n` +
      dbExercises.map(e => `- ${e.name}: /exercises/${e.slug}`).join("\n");
  }

  // 4. Xây dựng cấu trúc prompt hoàn chỉnh gửi AI
  const systemPrompt = getSystemPrompt();
  const userContext = buildUserContext({
    user: { id: userId },
    profile,
    todayPlanDay,
    recentRecovery,
    activeInjuries,
  });
  const trainingPlanContext = buildTrainingPlanContext({
    activePlan,
    upcomingPlanDays,
  });
  const exerciseCatalogContext = buildExerciseCatalogContext(dbExercises);

  const finalSystemPrompt = `${systemPrompt}\n\n${userContext}\n\n${trainingPlanContext}\n\n${ragContext}\n\n${exercisesContext}\n\n${exerciseCatalogContext}`;

  // 5. Lấy tối đa 20 tin nhắn lịch sử để giữ ngữ cảnh hội thoại liên tục
  const historyDesc = await prisma.aiMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const history = historyDesc.reverse();

  // Tự động cập nhật tiêu đề cuộc trò chuyện nếu đây là tin nhắn đầu tiên hoặc tiêu đề mặc định
  const isFirstMessage = history.length === 0;
  if (isFirstMessage || conversation.title.startsWith("Cuộc hội thoại mới")) {
    const newTitle = content.length > 40 ? `${content.substring(0, 40)}...` : content;
    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { title: newTitle },
    });
  }

  const formattedMessages = history
    .map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content ? msg.content.trim() : "",
    }))
    .filter(msg => msg.content !== "");

  // Tạo ID tạm thời cho tin nhắn phản hồi của AI
  const assistantMessagePlaceholder = {
    id: require("crypto").randomUUID(),
    conversationId,
    role: "assistant",
    content: "",
    createdAt: new Date(),
  };

  const fallbackRecommendation = isConsentMessage(content)
    ? await createRecommendationFromPreviousPlan({
        userId,
        conversationId,
        assistantMessageId: assistantMessagePlaceholder.id,
        history,
        dbExercises,
      })
    : null;

  if (fallbackRecommendation) {
    return {
      userMessage,
      assistantMessageId: assistantMessagePlaceholder.id,
      assistantMessage: fallbackRecommendation.assistantMessage,
      recommendation: fallbackRecommendation.recommendation,
      streamed: false,
      status: "processing",
    };
  }

  // Kích hoạt xử lý stream chạy nền thông qua helper đã phân tách
  streamResponse(
    userId,
    conversationId,
    formattedMessages,
    finalSystemPrompt,
    assistantMessagePlaceholder.id,
    dbExercises.map((exercise) => ({
      name: exercise.name,
      slug: exercise.slug,
    }))
  );

  // Trả về thông tin tin nhắn user và ID phản hồi AI ngay lập tức
  return {
    userMessage,
    assistantMessageId: assistantMessagePlaceholder.id,
    streamed: true,
    status: "processing",
  };
};

// Thực thi / áp dụng đề xuất thay đổi vào DB thật (được uỷ quyền sang recommendation helper)
const executeRecommendation = async (userId, id) => {
  return execute(userId, id);
};

// Từ chối đề xuất của AI (được uỷ quyền sang recommendation helper)
const rejectRecommendation = async (userId, id) => {
  return reject(userId, id);
};

// Xác thực chữ ký đăng ký kênh private socket của Pusher
const authorizeChannel = (userId, socketId, channelName) => {
  if (!channelName || !socketId) {
    throw new AppError("Thiếu thông tin socket_id hoặc channel_name.", httpCodes.badRequest);
  }

  if (channelName.startsWith("private-ai.") && channelName !== `private-ai.${userId}`) {
    throw new AppError("Không được phép đăng ký kênh này.", httpCodes.forbidden);
  }
  
  return pusher.authorizeChannel(socketId, channelName);
};

// Gợi ý món ăn từ AI dựa trên lượng calo và dinh dưỡng còn thiếu trong ngày
const getNutritionSuggestions = async (userId) => {
  const nutritionService = require("./nutrition.service");
  const { generateText, gateway } = require("ai");
  const aiConfig = require("@/config/ai.config");
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const nutrition = await nutritionService.getTodayNutrition(userId, todayStr);
  
  const targetCal = nutrition.target.caloriesTarget ?? 2000;
  const targetPro = nutrition.target.proteinGTarget ?? 150;
  const targetCarbs = nutrition.target.carbsGTarget ?? 200;
  const targetFat = nutrition.target.fatGTarget ?? 60;

  const currentCal = nutrition.totals.calories;
  const currentPro = nutrition.totals.protein;
  const currentCarbs = nutrition.totals.carbs;
  const currentFat = nutrition.totals.fat;

  // Lượng còn thiếu
  const remCal = Math.max(0, targetCal - currentCal);
  const remPro = Math.max(0, targetPro - currentPro);
  const remCarbs = Math.max(0, targetCarbs - currentCarbs);
  const remFat = Math.max(0, targetFat - currentFat);

  if (remCal < 50) {
    return {
      metGoal: true,
      remaining: { calories: remCal, protein: remPro, carbs: remCarbs, fat: remFat },
      suggestions: [
        {
          name: "Sữa chua Hy Lạp ít béo",
          portion: "100g",
          calories: 60,
          protein: 10,
          carbs: 4,
          fat: 0,
          reason: "Vì bạn đã gần đạt hoặc đạt mốc calo hôm nay, một chút sữa chua Hy Lạp sẽ giúp bổ sung nốt lượng protein còn thiếu mà không làm thừa calo."
        },
        {
          name: "Trà xanh ấm hoặc Nước lọc chanh",
          portion: "250ml",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          reason: "Calo của bạn đã đủ cho ngày hôm nay. Hãy bổ sung thêm nước lọc hoặc trà xanh để hỗ trợ trao đổi chất và phục hồi cơ bắp."
        }
      ]
    };
  }

  const prompt = `Bạn là một chuyên gia dinh dưỡng và PT thể hình cao cấp.
Hôm nay người dùng còn thiếu các chỉ số dinh dưỡng sau để đạt mục tiêu trong ngày:
- Lượng Calo còn thiếu: ${remCal} kcal
- Protein còn thiếu: ${remPro} g
- Tinh bột (Carbs) còn thiếu: ${remCarbs} g
- Chất béo (Fat) còn thiếu: ${remFat} g

Hãy gợi ý chính xác 3 món ăn hoặc bữa ăn nhẹ phổ biến tại Việt Nam phù hợp để bù đắp phần dinh dưỡng còn thiếu này. 
Mỗi món ăn phải thực tế, dễ mua hoặc dễ chế biến.

Yêu cầu trả về kết quả dạng JSON thuần túy (không bọc trong thẻ nhãn \`\`\`json hay bất cứ text nào khác ngoài chuỗi JSON). JSON phải là một mảng gồm 3 đối tượng có các trường sau:
[
  {
    "name": "Tên món ăn (Ví dụ: Ức gà áp chảo, Sữa lắc chuối bơ đậu phộng...)",
    "portion": "Khẩu phần gợi ý (Ví dụ: 150g, 1 cốc...)",
    "calories": 250,
    "protein": 25,
    "carbs": 15,
    "fat": 5,
    "reason": "Mô tả ngắn gọn (1-2 câu) tại sao món này tốt cho việc bù đắp lượng dinh dưỡng còn thiếu hôm nay"
  }
]`;

  try {
    const result = await generateText({
      model: gateway(aiConfig.modelName),
      prompt: prompt,
      maxTokens: 1000,
    });

    let jsonText = result.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const suggestions = JSON.parse(jsonText);
    return {
      metGoal: false,
      remaining: { calories: remCal, protein: remPro, carbs: remCarbs, fat: remFat },
      suggestions
    };
  } catch (err) {
    console.error("Lỗi gọi AI gợi ý món ăn:", err);
    return {
      metGoal: false,
      remaining: { calories: remCal, protein: remPro, carbs: remCarbs, fat: remFat },
      suggestions: [
        {
          name: "Ức gà áp chảo & Khoai lang luộc",
          portion: "150g ức gà + 100g khoai lang",
          calories: Math.round(remCal * 0.6),
          protein: Math.round(remPro * 0.7),
          carbs: Math.round(remCarbs * 0.7),
          fat: Math.round(remFat * 0.4),
          reason: "Bữa ăn giàu đạm sạch và carb phức giúp bù đắp nhanh năng lượng và protein mà không làm tăng mỡ thừa."
        },
        {
          name: "Sữa whey protein lắc cùng chuối",
          portion: "1 muỗng Whey + 1 quả chuối + 250ml nước",
          calories: 260,
          protein: 26,
          carbs: 28,
          fat: 2,
          reason: "Cung cấp protein hấp thụ nhanh cho cơ bắp cùng nguồn carbs tốt từ chuối giúp phục hồi thể lực sau tập."
        },
        {
          name: "Trứng luộc và Hạnh nhân",
          portion: "2 quả trứng luộc + 15g hạt hạnh nhân",
          calories: 240,
          protein: 15,
          carbs: 3,
          fat: 18,
          reason: "Thích hợp khi bạn còn thiếu nhiều protein và chất béo tốt nhưng không muốn nạp quá nhiều carbs tinh bột."
        }
      ]
    };
  }
};

module.exports = {
  createConversation,
  getConversations,
  deleteConversation,
  getConversationMessages,
  createMessageAndStream,
  executeRecommendation,
  rejectRecommendation,
  authorizeChannel,
  getNutritionSuggestions,
};
