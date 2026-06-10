import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const roadmapApi = createApi({
  reducerPath: "roadmapApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Roadmap", "DayDetails", "RoadmapStats"],

  endpoints: (builder) => ({
    getActivePlan: builder.query({
      query: () => ({
        url: "/user-training-plans/active",
        method: "GET",
      }),
      providesTags: ["Roadmap"],
    }),
    getStats: builder.query({
      query: () => ({
        url: "/user-training-plans/stats",
        method: "GET",
      }),
      providesTags: ["RoadmapStats"],
    }),
    getWorkoutPrograms: builder.query({
      query: (params) => ({
        url: "/workout-programs",
        method: "GET",
        params,
      }),
      providesTags: ["Roadmap"],
    }),
    getWorkoutProgram: builder.query({
      query: (id) => ({
        url: `/workout-programs/${id}`,
        method: "GET",
      }),
    }),
    startProgramPlan: builder.mutation({
      query: (data) => ({
        url: "/user-training-plans/from-program",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Roadmap", "RoadmapStats", "DayDetails"],
    }),
    startCustomPlan: builder.mutation({
      query: (data) => ({
        url: "/user-training-plans/custom",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Roadmap", "RoadmapStats", "DayDetails"],
    }),
    cancelActivePlan: builder.mutation({
      query: () => ({
        url: "/user-training-plans/active/cancel",
        method: "POST",
      }),
      invalidatesTags: ["Roadmap", "RoadmapStats", "DayDetails"],
    }),
    getDayDetails: builder.query({
      query: (dayId) => ({
        url: `/user-training-plans/days/${dayId}`,
        method: "GET",
      }),
      providesTags: (result, error, dayId) => [{ type: "DayDetails", id: dayId }],
    }),
    updateDayDetails: builder.mutation({
      query: ({ dayId, data }) => ({
        url: `/user-training-plans/days/${dayId}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { dayId }) => ["Roadmap", { type: "DayDetails", id: dayId }],
    }),
    completeDay: builder.mutation({
      query: ({ dayId, notes }) => ({
        url: `/user-training-plans/days/${dayId}/complete`,
        method: "POST",
        data: { notes },
      }),
      invalidatesTags: (result, error, { dayId }) => ["Roadmap", "RoadmapStats", { type: "DayDetails", id: dayId }],
    }),
    startTrainingPlan: builder.mutation({
      query: (data) => ({
        url: "/me/training-plans",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Roadmap", "RoadmapStats", "DayDetails"],
    }),
    getCurrentPlan: builder.query({
      query: () => ({
        url: "/me/training-plans/current",
        method: "GET",
      }),
      providesTags: ["Roadmap"],
    }),
    getTrainingPlanDays: builder.query({
      query: (params) => ({
        url: "/me/training-plan-days",
        method: "GET",
        params,
      }),
      providesTags: ["Roadmap"],
    }),
    updateTrainingPlanDayStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `/me/training-plan-days/${id}/status`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => ["Roadmap", { type: "DayDetails", id }],
    }),
    swapDaysDates: builder.mutation({
      query: ({ dayId1, dayId2 }) => ({
        url: "/user-training-plans/days/swap-dates",
        method: "POST",
        data: { dayId1, dayId2 },
      }),
      invalidatesTags: ["Roadmap", "DayDetails"],
    }),
  }),
});

export const {
  useGetActivePlanQuery,
  useGetStatsQuery,
  useGetWorkoutProgramsQuery,
  useGetWorkoutProgramQuery,
  useLazyGetWorkoutProgramQuery,
  useStartProgramPlanMutation,
  useStartCustomPlanMutation,
  useCancelActivePlanMutation,
  useGetDayDetailsQuery,
  useLazyGetDayDetailsQuery,
  useUpdateDayDetailsMutation,
  useCompleteDayMutation,
  useStartTrainingPlanMutation,
  useGetCurrentPlanQuery,
  useGetTrainingPlanDaysQuery,
  useUpdateTrainingPlanDayStatusMutation,
  useSwapDaysDatesMutation,
} = roadmapApi;
