import axios from "axios";
import { STORAGE_KEYS, AUTH_ENDPOINTS } from "@/config/appConfig";

export { STORAGE_KEYS };

export const httpRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor: Gắn access token vào mọi request
httpRequest.interceptors.request.use((config) => {
  const access_token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  return config;
});

// Response interceptor: Xử lý refresh token tự động
let isRefreshing = false;
let queueJobs = [];

const sendRefreshToken = async (original, refreshToken) => {
  isRefreshing = true;
  const response = await axios.post(`${original.baseURL}/auth/refresh-token`, {
    refresh_token: refreshToken,
  });
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
          await sendRefreshToken(original, refreshToken);
          queueJobs.forEach((job) => job.resolve());
          queueJobs = [];
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
