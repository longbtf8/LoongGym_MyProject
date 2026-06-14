const pusher = require("@/lib/pusher");
const aiConfig = require("@/config/ai.config");
const { prisma } = require("@/lib/prisma");
const { streamText, gateway } = require("ai");

/**
 * Xử lý stream phản hồi từ AI và phát qua socket đồng thời lưu vào DB khi hoàn tất.
 * @param {string} userId 
 * @param {string} conversationId 
 * @param {Array} formattedMessages 
 * @param {string} finalSystemPrompt 
 * @param {string} assistantMessagePlaceholderId 
 */
const streamResponse = async (userId, conversationId, formattedMessages, finalSystemPrompt, assistantMessagePlaceholderId) => {
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

    // Kiểm tra xem AI có trả về đề xuất hành động dạng JSON không
    const actionMatch = fullText.match(/---ACTION---([\s\S]*?)---END_ACTION---/);
    let parsedRecommendation = null;

    if (actionMatch) {
      try {
        const actionJsonStr = actionMatch[1].trim();
        const actionData = JSON.parse(actionJsonStr);

        // Tạo bản ghi đề xuất dạng pending trong DB
        parsedRecommendation = await prisma.aiRecommendation.create({
          data: {
            userId,
            conversationId,
            recommendationType: actionData.type,
            title: actionData.title,
            payload: actionData.payload,
            status: "pending",
          },
        });
      } catch (err) {
        console.error("Lỗi phân tích cú pháp JSON hành động:", err);
      }
    }

    // Loại bỏ khối ACTION khỏi nội dung lưu database để tránh hiển thị mã JSON thô
    const cleanText = fullText.replace(/---ACTION---([\s\S]*?)---END_ACTION---/g, "").trim();

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
