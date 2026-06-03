import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Dashboard"],

  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: () => ({
        url: "/dashboard/summary",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery } = dashboardApi;
