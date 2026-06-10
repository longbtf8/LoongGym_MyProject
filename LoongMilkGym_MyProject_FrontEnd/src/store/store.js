import { authApi } from "@/services/auth/authApi";
import { exerciseApi } from "@/services/exercise/exerciseApi";
import { dashboardApi } from "@/services/dashboard/dashboardApi";
import { roadmapApi } from "@/services/roadmap/roadmapApi";
import { workoutSessionApi } from "@/services/workoutSession/workoutSessionApi";
import { nutritionApi } from "@/services/nutrition/nutritionApi";
import { recoveryApi } from "@/services/recovery/recoveryApi";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [exerciseApi.reducerPath]: exerciseApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [roadmapApi.reducerPath]: roadmapApi.reducer,
    [workoutSessionApi.reducerPath]: workoutSessionApi.reducer,
    [nutritionApi.reducerPath]: nutritionApi.reducer,
    [recoveryApi.reducerPath]: recoveryApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    authApi.middleware,
    exerciseApi.middleware,
    dashboardApi.middleware,
    roadmapApi.middleware,
    workoutSessionApi.middleware,
    nutritionApi.middleware,
    recoveryApi.middleware,
  ],
});
