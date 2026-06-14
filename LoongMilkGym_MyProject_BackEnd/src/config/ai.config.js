// Cấu hình kết nối AI Coach qua Vercel AI Gateway
const aiConfig = {
  // Key kết nối Vercel AI Gateway
  apiKey: process.env.AI_GATEWAY_API_KEY,
  // Tên model sử dụng (ví dụ: openai/gpt-4o-mini hoặc deepseek/deepseek-r1)
  modelName: process.env.AI_MODEL || "deepseek-v4-flash",
  // Số lượng token tối đa cho phản hồi
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || "1024", 10),
  // Endpoint mặc định của Vercel AI Gateway
  gatewayUrl: "https://ai-gateway.vercel.sh/v1",
};

module.exports = aiConfig;
