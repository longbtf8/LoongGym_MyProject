import axios from "axios";
import { STORAGE_KEYS, AUTH_ENDPOINTS } from "@/config/appConfig";

export { STORAGE_KEYS };

const getCleanBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || "";
  return envUrl.trim().replace(/^["']|["']$/g, "");
};

const cleanBaseUrl = getCleanBaseUrl();

export const httpRequest = axios.create({
  baseURL: cleanBaseUrl,
});

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

httpRequest.interceptors.request.use((config) => {
  const access_token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (access_token) {
    config.headers.Authorization = `Bearer ${access_token}`;
  }
  config.headers["x-session-id"] = getSessionId();
  return config;
});

let isRefreshing = false;
let queueJobs = [];

const waitForTokenChange = (staleRefreshToken, timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const hasFreshToken = () => {
      const currentRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const currentAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      return Boolean(currentAccessToken && currentRefreshToken && currentRefreshToken !== staleRefreshToken);
    };

    if (hasFreshToken()) {
      resolve(true);
      return;
    }

    const cleanup = () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };

    const finish = (value) => {
      cleanup();
      resolve(value);
    };

    const check = () => {
      if (hasFreshToken()) {
        finish(true);
      } else if (Date.now() - startedAt >= timeoutMs) {
        finish(false);
      }
    };

    const handleStorage = (event) => {
      if (
        event.key === STORAGE_KEYS.ACCESS_TOKEN ||
        event.key === STORAGE_KEYS.REFRESH_TOKEN
      ) {
        check();
      }
    };

    window.addEventListener("storage", handleStorage);
    const intervalId = setInterval(check, 150);
    const timeoutId = setTimeout(() => finish(false), timeoutMs);
  });
};

const retryWithLatestAccessToken = async (original) => {
  const newAccessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (!newAccessToken) {
    throw new Error("Không tìm thấy access token mới");
  }

  if (original.headers?.set) {
    original.headers.set("Authorization", `Bearer ${newAccessToken}`);
  } else {
    original.headers = original.headers || {};
    original.headers.Authorization = `Bearer ${newAccessToken}`;
  }

  return httpRequest(original);
};

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

        return await retryWithLatestAccessToken(original);
      } catch (refreshError) {
        queueJobs.forEach((job) => job.reject(refreshError));
        queueJobs = [];

        const recoveredFromAnotherTab = await waitForTokenChange(refreshToken);
        if (recoveredFromAnotherTab) {
          const retryResult = await retryWithLatestAccessToken(original);
          return retryResult;
        }

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
