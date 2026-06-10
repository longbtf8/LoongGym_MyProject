import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

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
    }),
    createMealLog: builder.mutation({
      query: (data) => ({
        url: "/meal-logs",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Nutrition"],
    }),
    addMealLogItem: builder.mutation({
      query: ({ mealLogId, data }) => ({
        url: `/meal-logs/${mealLogId}/items`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["Nutrition", "Dashboard"],
    }),
    deleteMealLogItem: builder.mutation({
      query: (itemId) => ({
        url: `/meal-log-items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Nutrition", "Dashboard"],
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
