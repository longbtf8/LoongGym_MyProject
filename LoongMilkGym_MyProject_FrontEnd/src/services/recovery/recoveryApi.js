import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const recoveryApi = createApi({
  reducerPath: "recoveryApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Recovery", "Dashboard"],

  endpoints: (builder) => ({
    getTodayOverview: builder.query({
      query: (date) => ({
        url: "/recovery/today",
        params: date ? { date } : undefined,
      }),
      providesTags: ["Recovery"],
    }),
    logRecovery: builder.mutation({
      query: (data) => ({
        url: "/recovery/log",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Recovery", "Dashboard"],
    }),
    logInjury: builder.mutation({
      query: (data) => ({
        url: "/recovery/injury",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Recovery"],
    }),
    updateInjury: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/recovery/injury/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["Recovery"],
    }),
    logBodyMetric: builder.mutation({
      query: (data) => ({
        url: "/recovery/metrics",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Recovery"],
    }),
    uploadProgressPhoto: builder.mutation({
      query: (data) => ({
        url: "/recovery/photos",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Recovery"],
    }),
  }),
});

export const {
  useGetTodayOverviewQuery,
  useLogRecoveryMutation,
  useLogInjuryMutation,
  useUpdateInjuryMutation,
  useLogBodyMetricMutation,
  useUploadProgressPhotoMutation,
} = recoveryApi;
