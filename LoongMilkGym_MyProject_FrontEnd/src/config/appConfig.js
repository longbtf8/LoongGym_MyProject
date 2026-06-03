export const STORAGE_KEYS = {
  ACCESS_TOKEN: "loongmilkgym_accessToken",
  REFRESH_TOKEN: "loongmilkgym_refreshToken",
  SESSION_ID: "loongmilkgym_sessionId",
};

// Danh sách các endpoint KHÔNG cần refresh token khi gặp lỗi 401
export const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/refresh-token",
];
