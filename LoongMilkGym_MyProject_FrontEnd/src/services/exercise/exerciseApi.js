import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const exerciseApi = createApi({
  reducerPath: "exerciseApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Exercises", "ExerciseDetail", "MuscleGroups", "Equipment"],

  endpoints: (builder) => ({
    getExercises: builder.query({
      query: (params) => ({
        url: "/exercises",
        method: "GET",
        params,
      }),
      providesTags: ["Exercises"],
    }),
    getExerciseBySlug: builder.query({
      query: (slug) => ({
        url: `/exercises/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "ExerciseDetail", id: slug }],
    }),
    getMuscleGroups: builder.query({
      query: () => ({
        url: "/muscle-groups",
        method: "GET",
      }),
      providesTags: ["MuscleGroups"],
    }),
    getEquipment: builder.query({
      query: () => ({
        url: "/equipment",
        method: "GET",
      }),
      providesTags: ["Equipment"],
    }),
  }),
});

export const {
  useGetExercisesQuery,
  useGetExerciseBySlugQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentQuery,
} = exerciseApi;
