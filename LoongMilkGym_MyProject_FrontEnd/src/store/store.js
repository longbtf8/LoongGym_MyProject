import { authApi } from "@/services/auth/authApi";
import { exerciseApi } from "@/services/exercise/exerciseApi";
import { dashboardApi } from "@/services/dashboard/dashboardApi";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [exerciseApi.reducerPath]: exerciseApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    authApi.middleware,
    exerciseApi.middleware,
    dashboardApi.middleware,
  ],
});
