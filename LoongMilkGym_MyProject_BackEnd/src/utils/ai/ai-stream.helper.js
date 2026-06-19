const pusher = require("@/lib/pusher");
const aiConfig = require("@/config/ai.config");
const { prisma } = require("@/lib/prisma");
const { streamText, gateway } = require("ai");
const { normalizeWeeklyPlanPayload } = require("./ai-plan-payload.helper");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeExerciseLinks = (text = "") => {
  return text.replace(/\]\((?:https?:\/\/[^/)\s]+)?\/exercises\/([^)#\s]+)(#[^)]+)?\)/g, "](/exercises/$1$2)");
};

const autoLinkExerciseNames = (text = "", exerciseLinks = []) => {
  if (!text || !Array.isArray(exerciseLinks) || !exerciseLinks.length) return normalizeExerciseLinks(text);

  const linkPattern = /\[[^\]]+\]\([^)]+\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "link", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  const sortedLinks = [...exerciseLinks]
    .filter((item) => item?.name && item?.slug)
    .sort((a, b) => b.name.length - a.name.length);

  const linkedText = parts.map((part) => {
    if (part.type === "link") return normalizeExerciseLinks(part.value);

    return sortedLinks.reduce((segment, exercise) => {
      const regex = new RegExp(`(?<!\\])\\b${escapeRegExp(exercise.name)}\\b(?!\\]\\()`, "gi");
      return segment.replace(regex, (name) => `[${name}](/exercises/${exercise.slug})`);
    }, part.value);
  }).join("");

  return normalizeExerciseLinks(linkedText);
};

const extractActionData = (text = "") => {
  const actionMatch = text.match(/---ACTION---([\s\S]*?)---END_ACTION---/);
  if (!actionMatch) return null;

  let actionJsonStr = actionMatch[1].trim();
  if (actionJsonStr.startsWith("```")) {
    actionJsonStr = actionJsonStr
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
  }

  return JSON.parse(actionJsonStr);
};

/**
 * Xử lý stream phản hồi từ AI và phát qua socket đồng thời lưu vào DB khi hoàn tất.
 * @param {string} userId 
 * @param {string} conversationId 
 * @param {Array} formattedMessages 
 * @param {string} finalSystemPrompt 
 * @param {string} assistantMessagePlaceholderId 
 * @param {Array} exerciseLinks
 */
const streamResponse = async (userId, conversationId, formattedMessages, finalSystemPrompt, assistantMessagePlaceholderId, exerciseLinks = []) => {
  const channelName = `private-ai.${userId}`;
  let fullText = "";

  try {
    // Gọi stream kết quả từ Vercel AI SDK
    const result = await streamText({
      model: gateway(aiConfig.modelName),
      messages: formattedMessages,
      system: finalSystemPrompt,
      maxTokens: aiConfig.maxTokens,
    });

    for await (const textPart of result.textStream) {
      fullText += textPart;
      // Phát từng chunk text qua kênh socket
      await pusher.trigger(channelName, "ai.chunk", {
        conversationId,
        messageId: assistantMessagePlaceholderId,
        chunk: textPart,
      });
    }

    let parsedRecommendation = null;

    if (fullText.includes("---ACTION---")) {
      try {
        const actionData = extractActionData(fullText);

        // Tạo bản ghi đề xuất dạng pending trong DB
        if (actionData?.type && actionData?.payload) {
          const payload = ["generate_training_plan", "update_training_plan"].includes(actionData.type)
            ? normalizeWeeklyPlanPayload(actionData.payload)
            : actionData.payload;

          parsedRecommendation = await prisma.aiRecommendation.create({
            data: {
              userId,
              conversationId,
              recommendationType: actionData.type,
              title: actionData.title,
              payload,
              status: "pending",
            },
          });
        }
      } catch (err) {
        console.error("Lỗi phân tích cú pháp JSON hành động:", err);
      }
    }

    // Loại bỏ khối ACTION khỏi nội dung lưu database để tránh hiển thị mã JSON thô
    const cleanText = autoLinkExerciseNames(
      fullText.replace(/---ACTION---[\s\S]*?(---END_ACTION---|$)/g, "").trim(),
      exerciseLinks
    );

    // Lưu tin nhắn trả lời hoàn chỉnh của AI vào DB (lưu cleanText đã lọc sạch JSON)
    const savedAssistantMsg = await prisma.aiMessage.create({
      data: {
        id: assistantMessagePlaceholderId,
        conversationId,
        role: "assistant",
        content: cleanText,
        metadata: parsedRecommendation ? { recommendationId: parsedRecommendation.id } : {},
      },
    });

    // Cập nhật mốc thời gian cập nhật phòng chat
    await prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Gửi event hoàn tất qua socket kèm text sạch
    await pusher.trigger(channelName, "ai.done", {
      conversationId,
      messageId: savedAssistantMsg.id,
      content: cleanText,
      recommendation: parsedRecommendation,
    });

  } catch (error) {
    console.error("Lỗi luồng stream AI:", error);
    await pusher.trigger(channelName, "ai.error", {
      conversationId,
      messageId: assistantMessagePlaceholderId,
      error: error.message || "Đã xảy ra lỗi khi trao đổi với AI Coach.",
    });
  }
};

module.exports = {
  streamResponse,
};
