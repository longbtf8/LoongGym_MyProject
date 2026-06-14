// Controller xử lý các yêu cầu liên quan đến AI Coach
const aiService = require("@/services/ai.service");
const { httpCodes } = require("@/config/constants");

// Xử lý tạo phòng hội thoại mới
const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { contextType, title } = req.validated.body;
    const result = await aiService.createConversation(userId, contextType, title);
    return res.success(result, httpCodes.created, "Tạo cuộc hội thoại thành công.");
  } catch (error) {
    next(error);
  }
};

// Xử lý lấy danh sách toàn bộ phòng hội thoại của user
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await aiService.getConversations(userId);
    return res.success(result, httpCodes.success, "Lấy danh sách cuộc hội thoại thành công.");
  } catch (error) {
    next(error);
  }
};

// Xử lý xóa cuộc hội thoại của user
const deleteConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const result = await aiService.deleteConversation(userId, conversationId);
    return res.success(result, httpCodes.success, "Xóa cuộc hội thoại thành công.");
  } catch (error) {
    next(error);
  }
};

// Xử lý lấy danh sách tin nhắn trong 1 phòng hội thoại
const getConversationMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const result = await aiService.getConversationMessages(userId, conversationId);
    return res.success(result, httpCodes.success, "Lấy danh sách tin nhắn thành công.");
  } catch (error) {
    next(error);
  }
};

// Xử lý gửi tin nhắn của user và kích hoạt AI sinh phản hồi stream
const createMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    const { content } = req.validated.body;
    const result = await aiService.createMessageAndStream(userId, conversationId, content);
    return res.success(result, httpCodes.created, "Gửi tin nhắn thành công, đang xử lý câu trả lời.");
  } catch (error) {
    next(error);
  }
};

// Xử lý áp dụng/thực thi đề xuất từ AI vào cơ sở dữ liệu thực tế
const executeRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recommendationId = req.params.id;
    const result = await aiService.executeRecommendation(userId, recommendationId);
    return res.success(result, httpCodes.success, "Áp dụng đề xuất thành công.");
  } catch (error) {
    next(error);
  }
};

// Xử lý từ chối đề xuất của AI
const rejectRecommendation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const recommendationId = req.params.id;
    const result = await aiService.rejectRecommendation(userId, recommendationId);
    return res.success(result, httpCodes.success, "Từ chối đề xuất thành công.");
  } catch (error) {
    next(error);
  }
};

// Xử lý xác thực đăng ký kênh Pusher/Soketi
const authorizeChannel = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Đọc socket_id và channel_name từ body (hỗ trợ cả JSON và URL-encoded)
    const { socket_id, channel_name } = req.body;
    if (!socket_id || !channel_name) {
      return res.status(400).json({ message: "Thiếu thông tin socket_id hoặc channel_name" });
    }
    const auth = aiService.authorizeChannel(userId, socket_id, channel_name);
    return res.send(auth);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConversation,
  getConversations,
  deleteConversation,
  getConversationMessages,
  createMessage,
  executeRecommendation,
  rejectRecommendation,
  authorizeChannel,
};
