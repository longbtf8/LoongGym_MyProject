import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "@/services/auth/authApi";
import { adminApi } from "@/services/admin/adminApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    authApi.middleware,
    adminApi.middleware,
  ],
});

