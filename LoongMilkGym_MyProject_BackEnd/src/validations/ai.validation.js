const { z } = require("zod");

// Schema kiểm tra dữ liệu đầu vào khi tạo phòng hội thoại mới
const createConversationSchema = z.object({
  body: z.object({
    contextType: z.enum(["workout", "nutrition", "recovery", "schedule", "general"]).default("general"),
    title: z.string().trim().max(200).optional().nullable(),
  }),
});

// Schema kiểm tra dữ liệu đầu vào khi gửi tin nhắn mới
const createMessageSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID cuộc hội thoại phải là định dạng UUID hợp lệ"),
  }),
  body: z.object({
    content: z.string({ required_error: "Nội dung tin nhắn không được để trống" }).trim().min(1, "Nội dung tin nhắn phải có ít nhất 1 ký tự"),
  }),
});

// Schema kiểm tra dữ liệu đầu vào khi lấy lịch sử tin nhắn
const getConversationMessagesSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID cuộc hội thoại phải là định dạng UUID hợp lệ"),
  }),
});

// Schema kiểm tra dữ liệu đầu vào khi chấp nhận/từ chối đề xuất
const executeRecommendationSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID đề xuất phải là định dạng UUID hợp lệ"),
  }),
});

module.exports = {
  createConversationSchema,
  createMessageSchema,
  getConversationMessagesSchema,
  executeRecommendationSchema,
};
