import axios from "axios";
import { STORAGE_KEYS, AUTH_ENDPOINTS } from "@/config/appConfig";

export { STORAGE_KEYS };

// Helper dọn dẹp khoảng trắng và dấu ngoặc kép thừa trong URL cấu hình
const getCleanBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "";
  return envUrl.trim().replace(/^["']|["']$/g, "");
};

const cleanBaseUrl = getCleanBaseUrl();

export const httpRequest = axios.create({
  baseURL: cleanBaseUrl,
});

// Tạo hoặc lấy Session ID duy nhất cho mỗi phiên trình duyệt
// Mỗi trình duyệt (Chrome, Firefox, ẩn danh đều khác nhau)
let memorySessionId = null;
const getSessionId = () => {
  try {
    let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }
    return sessionId;
  } catch (e) {
    if (!memorySessionId) {
      memorySessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    }
    return memorySessionId;
  }
};

// Request interceptor: Gắn access token + session ID vào mọi request
httpRequest.interceptors.request.use((config) => {
  const access_token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  config.headers["x-session-id"] = getSessionId();
  return config;
});

// Response interceptor: Xử lý refresh token tự động
let isRefreshing = false;
let queueJobs = [];

const sendRefreshToken = async (refreshToken) => {
  isRefreshing = true;
  const response = await axios.post(
    `${cleanBaseUrl}/auth/refresh-token`,
    {
      refresh_token: refreshToken,
    },
    {
      headers: {
        "x-session-id": getSessionId(),
      },
    }
  );
  const { access_token, refresh_token } = response.data.data;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
};

httpRequest.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const requestUrl = error.config?.url || "";

    // Kiểm tra: KHÔNG refresh token cho các endpoint xác thực (auth)
    const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
      requestUrl.includes(endpoint)
    );

    if (error.response?.status === 401 && refreshToken && !isAuthEndpoint) {
      const original = error.config;
      try {
        if (isRefreshing) {
          await new Promise((resolve, reject) => {
            queueJobs.push({ resolve, reject });
          });
        } else {
          await sendRefreshToken(refreshToken);
          queueJobs.forEach((job) => job.resolve());
          queueJobs = [];
        }

        // Cập nhật token mới vào header của request đang bị lỗi trước khi thử lại
        const newAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (original.headers.set) {
          original.headers.set("Authorization", `Bearer ${newAccessToken}`);
        } else {
          original.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return await httpRequest(original);
      } catch (refreshError) {
        queueJobs.forEach((job) => job.reject(refreshError));
        queueJobs = [];
        // Refresh thất bại → xóa token cũ, buộc đăng nhập lại
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default httpRequest;
