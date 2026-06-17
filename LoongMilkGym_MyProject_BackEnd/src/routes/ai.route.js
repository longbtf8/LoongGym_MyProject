const express = require("express");
const router = express.Router();
const authRequire = require("@/middlewares/authRequire");
const validate = require("@/middlewares/validate");
const aiController = require("@/controllers/ai.controller");
const {
  createConversationSchema,
  createMessageSchema,
  getConversationMessagesSchema,
  executeRecommendationSchema,
} = require("@/validations/ai.validation");

// Route tạo phòng hội thoại mới
router.post("/conversations", authRequire, validate(createConversationSchema), aiController.createConversation);

// Route lấy danh sách tất cả các phòng hội thoại của user
router.get("/conversations", authRequire, aiController.getConversations);

// Route xóa cuộc hội thoại cụ thể
router.delete("/conversations/:id", authRequire, validate(getConversationMessagesSchema), aiController.deleteConversation);

// Route lấy toàn bộ tin nhắn trong 1 phòng hội thoại cụ thể
router.get("/conversations/:id/messages", authRequire, validate(getConversationMessagesSchema), aiController.getConversationMessages);

// Route gợi ý món ăn từ AI dựa trên lượng calo thiếu hụt
router.get("/nutrition-suggestions", authRequire, aiController.getNutritionSuggestions);

// Route gửi tin nhắn mới và bắt đầu luồng AI stream
router.post("/conversations/:id/messages", authRequire, validate(createMessageSchema), aiController.createMessage);

// Route đồng ý và áp dụng đề xuất của AI vào cơ sở dữ liệu thực tế
router.post("/recommendations/:id/execute", authRequire, validate(executeRecommendationSchema), aiController.executeRecommendation);

// Route từ chối đề xuất của AI
router.post("/recommendations/:id/reject", authRequire, validate(executeRecommendationSchema), aiController.rejectRecommendation);

// Route xác thực kết nối private channel của Pusher/Soketi
router.post("/broadcasting/auth", authRequire, aiController.authorizeChannel);

module.exports = router;
