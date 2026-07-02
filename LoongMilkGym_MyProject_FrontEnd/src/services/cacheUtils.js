import { authApi } from "@/services/auth/authApi";
import { dashboardApi } from "@/services/dashboard/dashboardApi";
import { roadmapApi } from "@/services/roadmap/roadmapApi";
import { workoutSessionApi } from "@/services/workoutSession/workoutSessionApi";
import { nutritionApi } from "@/services/nutrition/nutritionApi";
import { recoveryApi } from "@/services/recovery/recoveryApi";
import { communityApi } from "@/services/community/communityApi";

export const resetUserScopedApiCaches = (dispatch) => {
  if (!dispatch) return;

  [
    authApi,
    dashboardApi,
    roadmapApi,
    workoutSessionApi,
    nutritionApi,
    recoveryApi,
    communityApi,
  ].forEach((api) => {
    dispatch(api.util.resetApiState());
  });
};

