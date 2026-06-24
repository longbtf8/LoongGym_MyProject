import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../baseQuery";

export const exerciseApi = createApi({
  reducerPath: "exerciseApi",
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Exercises", "ExerciseDetail", "MuscleGroups", "Equipment", "Favorites"],

  endpoints: (builder) => ({
    getExercises: builder.query({
      query: (params) => ({
        url: "/exercises",
        method: "GET",
        params,
      }),
      providesTags: ["Exercises"],
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("exercises-feed");

          channel.bind("exercise.created", ({ exercise }) => {
            if (!exercise?.isPublished) return;
            updateCachedData((draft) => {
              if (!draft?.data?.data) return;
              if (draft.data.data.some((item) => item.id === exercise.id)) return;
              draft.data.data.unshift(exercise);
              if (draft.data.pagination?.total != null) {
                draft.data.pagination.total += 1;
              }
            });
          });

          channel.bind("exercise.updated", ({ exercise }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.data || !exercise) return;
              const idx = draft.data.data.findIndex((item) => item.id === exercise.id);
              if (exercise.isPublished) {
                if (idx !== -1) {
                  draft.data.data[idx] = { ...draft.data.data[idx], ...exercise };
                } else {
                  draft.data.data.unshift(exercise);
                }
              } else if (idx !== -1) {
                draft.data.data.splice(idx, 1);
              }
            });
          });

          channel.bind("exercise.deleted", ({ exerciseId }) => {
            updateCachedData((draft) => {
              if (!draft?.data?.data) return;
              const before = draft.data.data.length;
              draft.data.data = draft.data.data.filter((item) => item.id !== exerciseId);
              if (draft.data.pagination?.total != null && draft.data.data.length < before) {
                draft.data.pagination.total -= 1;
              }
            });
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("exercises-feed");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getExercises:", err);
        }
      },
    }),
    getExerciseBySlug: builder.query({
      query: (slug) => ({
        url: `/exercises/${slug}`,
        method: "GET",
      }),
      providesTags: (result, error, slug) => [{ type: "ExerciseDetail", id: slug }],
      async onCacheEntryAdded(slug, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { default: socketClient } = await import("@/utils/socketClient");
          const channel = socketClient.subscribe("exercises-feed");

          channel.bind("exercise.updated", ({ exercise }) => {
            if (!exercise || exercise.slug !== slug) return;
            updateCachedData((draft) => {
              if (!draft?.data) return;
              if (exercise.isPublished) {
                draft.data = { ...draft.data, ...exercise };
              }
            });
          });

          channel.bind("exercise.deleted", ({ slug: deletedSlug }) => {
            if (deletedSlug !== slug) return;
            updateCachedData(() => undefined);
          });

          await cacheEntryRemoved;
          channel.unbind_all();
          socketClient.unsubscribe("exercises-feed");
        } catch (err) {
          console.error("Error in onCacheEntryAdded for getExerciseBySlug:", err);
        }
      },
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
    getFavoriteExercises: builder.query({
      query: () => ({
        url: "/exercises/favorites",
        method: "GET",
      }),
      providesTags: ["Favorites"],
    }),
    toggleFavoriteExercise: builder.mutation({
      query: (id) => ({
        url: `/exercises/${id}/favorite`,
        method: "POST",
      }),
      invalidatesTags: ["Favorites", "Exercises"],
    }),
  }),
});

export const {
  useGetExercisesQuery,
  useGetExerciseBySlugQuery,
  useGetMuscleGroupsQuery,
  useGetEquipmentQuery,
  useGetFavoriteExercisesQuery,
  useToggleFavoriteExerciseMutation,
} = exerciseApi;
