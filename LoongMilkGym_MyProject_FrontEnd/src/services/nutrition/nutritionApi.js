import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";
import { dashboardApi } from "../dashboard/dashboardApi";

export const nutritionApi = createApi({
  reducerPath: "nutritionApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Nutrition", "Dashboard"],

  endpoints: (builder) => ({
    getTodayNutrition: builder.query({
      query: (date) => ({
        url: "/nutrition/today" + (date ? `?date=${date}` : ""),
        method: "GET",
      }),
      providesTags: ["Nutrition"],
    }),
    saveNutritionTarget: builder.mutation({
      query: (data) => ({
        url: "/nutrition/targets",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Nutrition", "Dashboard"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
        } catch {}
      }
    }),
    createMealLog: builder.mutation({
      query: (data) => ({
        url: "/meal-logs",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Nutrition"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
        } catch {}
      }
    }),
    addMealLogItem: builder.mutation({
      query: ({ mealLogId, data }) => ({
        url: `/meal-logs/${mealLogId}/items`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Nutrition", "Dashboard"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
        } catch {}
      }
    }),
    deleteMealLogItem: builder.mutation({
      query: (itemId) => ({
        url: `/meal-log-items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Nutrition", "Dashboard"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
        } catch {}
      }
    }),
    searchFoods: builder.query({
      query: (search) => ({
        url: "/nutrition/foods" + (search ? `?search=${encodeURIComponent(search)}` : ""),
        method: "GET",
      }),
      providesTags: ["Nutrition"],
    }),
    getFoodByBarcode: builder.query({
      query: (barcode) => ({
        url: `/nutrition/foods/barcode/${barcode}`,
        method: "GET",
      }),
      providesTags: ["Nutrition"],
    }),
    createOrGetFoodItem: builder.mutation({
      query: (data) => ({
        url: "/nutrition/foods",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Nutrition"],
    }),
  }),
});

export const {
  useGetTodayNutritionQuery,
  useSaveNutritionTargetMutation,
  useCreateMealLogMutation,
  useAddMealLogItemMutation,
  useDeleteMealLogItemMutation,
  useSearchFoodsQuery,
  useLazySearchFoodsQuery,
  useLazyGetFoodByBarcodeQuery,
  useCreateOrGetFoodItemMutation,
} = nutritionApi;
